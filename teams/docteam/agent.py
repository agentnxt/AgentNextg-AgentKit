"""
DocAgent — reads a GitHub repo, generates comprehensive documentation.
Uses open-source LLMs (Ollama) by default, cloud models optional.

Generates:
- README.md
- API reference (from OpenAPI/code)
- Architecture overview
- Setup/install guide
- Contributing guide
- Changelog from git history
"""

import os
import httpx
import json
from dataclasses import dataclass, field
from typing import Optional


OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
LITELLM_URL = os.environ.get("LITELLM_URL", "")
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
DEFAULT_MODEL = os.environ.get("DOC_MODEL", "qwen3:30b-a3b")


@dataclass
class RepoContext:
    owner: str
    repo: str
    files: dict = field(default_factory=dict)
    tree: list = field(default_factory=list)
    languages: dict = field(default_factory=dict)
    readme: str = ""
    openapi: dict = field(default_factory=dict)
    package_info: dict = field(default_factory=dict)
    recent_commits: list = field(default_factory=list)


class DocAgent:
    """AI documentation agent — reads repo, writes docs."""

    def __init__(self, model: str = None, ollama_url: str = None):
        self.model = model or DEFAULT_MODEL
        self.ollama_url = ollama_url or OLLAMA_URL
        self.github_headers = {"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}

    async def _llm(self, system: str, prompt: str, max_tokens: int = 4096) -> str:
        if LITELLM_URL:
            async with httpx.AsyncClient(timeout=120) as client:
                r = await client.post(f"{LITELLM_URL}/chat/completions", json={
                    "model": f"ollama/{self.model}",
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": prompt},
                    ],
                    "max_tokens": max_tokens,
                })
                if r.status_code == 200:
                    return r.json()["choices"][0]["message"]["content"]

        async with httpx.AsyncClient(timeout=120) as client:
            r = await client.post(f"{self.ollama_url}/api/generate", json={
                "model": self.model,
                "system": system,
                "prompt": prompt,
                "stream": False,
                "options": {"num_predict": max_tokens},
            })
            if r.status_code == 200:
                return r.json().get("response", "")
        return ""

    async def _github_get(self, path: str) -> dict:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.get(
                f"https://api.github.com/{path}",
                headers=self.github_headers,
            )
            if r.status_code == 200:
                return r.json()
        return {}

    async def _github_file(self, owner: str, repo: str, path: str) -> str:
        import base64
        data = await self._github_get(f"repos/{owner}/{repo}/contents/{path}")
        if data.get("content"):
            return base64.b64decode(data["content"]).decode("utf-8", errors="ignore")
        return ""

    async def scan_repo(self, repo_url: str) -> RepoContext:
        parts = repo_url.rstrip("/").split("/")
        owner, repo = parts[-2], parts[-1]

        ctx = RepoContext(owner=owner, repo=repo)

        repo_info = await self._github_get(f"repos/{owner}/{repo}")
        ctx.languages = await self._github_get(f"repos/{owner}/{repo}/languages")

        tree_data = await self._github_get(f"repos/{owner}/{repo}/git/trees/main?recursive=1")
        if not tree_data.get("tree"):
            tree_data = await self._github_get(f"repos/{owner}/{repo}/git/trees/master?recursive=1")
        ctx.tree = [t["path"] for t in tree_data.get("tree", []) if t["type"] == "blob"]

        ctx.readme = await self._github_file(owner, repo, "README.md")

        for f in ["package.json", "pyproject.toml", "setup.py", "Cargo.toml", "go.mod"]:
            if f in ctx.tree:
                content = await self._github_file(owner, repo, f)
                ctx.package_info[f] = content
                break

        for f in ["openapi.json", "openapi.yaml", "swagger.json", "docs/openapi.json"]:
            if f in ctx.tree:
                content = await self._github_file(owner, repo, f)
                try:
                    ctx.openapi = json.loads(content)
                except:
                    pass
                break

        key_files = [f for f in ctx.tree if f.endswith((".py", ".ts", ".js", ".go", ".rs"))
                     and not f.startswith(("node_modules/", "vendor/", "."))
                     and "/" not in f][:10]
        for f in key_files:
            ctx.files[f] = await self._github_file(owner, repo, f)

        commits = await self._github_get(f"repos/{owner}/{repo}/commits?per_page=20")
        ctx.recent_commits = [
            {"message": c["commit"]["message"], "date": c["commit"]["author"]["date"]}
            for c in (commits if isinstance(commits, list) else [])
        ]

        return ctx

    async def generate_readme(self, ctx: RepoContext) -> str:
        file_summary = "\n".join(f"- {f}" for f in ctx.tree[:50])
        code_samples = "\n\n".join(
            f"### {name}\n```\n{code[:500]}\n```"
            for name, code in list(ctx.files.items())[:5]
        )

        return await self._llm(
            system="You are a technical writer. Write clear, comprehensive README.md files.",
            prompt=f"""Generate a README.md for the repository {ctx.owner}/{ctx.repo}.

Languages: {json.dumps(ctx.languages)}

File structure (first 50 files):
{file_summary}

Package info:
{json.dumps(ctx.package_info, indent=2)[:1000]}

Key source files:
{code_samples[:3000]}

Existing README (if any):
{ctx.readme[:1000]}

Write a complete README with:
1. Project title and description
2. Features
3. Prerequisites
4. Installation
5. Quick start / Usage
6. Configuration
7. API reference (if applicable)
8. Architecture overview
9. Contributing
10. License""",
            max_tokens=8192,
        )

    async def generate_api_docs(self, ctx: RepoContext) -> str:
        if ctx.openapi:
            return await self._llm(
                system="You are an API documentation writer. Generate clear, developer-friendly docs.",
                prompt=f"""Generate API documentation from this OpenAPI spec:
{json.dumps(ctx.openapi, indent=2)[:4000]}

Include for each endpoint:
- Method + URL
- Description
- Request parameters/body
- Response format
- Example curl command
- Example response""",
                max_tokens=8192,
            )

        code = "\n\n".join(f"# {n}\n{c[:800]}" for n, c in ctx.files.items() if
                           any(kw in c for kw in ["@app.", "@router.", "def ", "func ", "fn "]))

        if not code:
            return "No API endpoints detected in the repository."

        return await self._llm(
            system="You are an API documentation writer. Extract endpoints from code and document them.",
            prompt=f"""Extract and document all API endpoints from this code:
{code[:4000]}

For each endpoint, document:
- Method + URL
- Description
- Parameters
- Request/response format
- Example""",
            max_tokens=8192,
        )

    async def generate_architecture(self, ctx: RepoContext) -> str:
        return await self._llm(
            system="You are a software architect. Write clear architecture documentation.",
            prompt=f"""Write an architecture overview for {ctx.owner}/{ctx.repo}.

Languages: {json.dumps(ctx.languages)}
Files: {json.dumps(ctx.tree[:100])}
Key code:
{json.dumps({k: v[:300] for k, v in list(ctx.files.items())[:5]}, indent=2)}

Include:
1. System overview diagram (ASCII)
2. Component descriptions
3. Data flow
4. Key design decisions
5. Dependencies
6. Deployment architecture""",
            max_tokens=4096,
        )

    async def generate_changelog(self, ctx: RepoContext) -> str:
        commits = "\n".join(
            f"- [{c['date'][:10]}] {c['message']}"
            for c in ctx.recent_commits
        )
        return await self._llm(
            system="You are a release manager. Write clear changelogs.",
            prompt=f"""Generate a CHANGELOG.md from these recent commits for {ctx.owner}/{ctx.repo}:

{commits}

Group by: Added, Changed, Fixed, Removed. Use Keep a Changelog format.""",
            max_tokens=2048,
        )

    async def generate_all(self, repo_url: str) -> dict:
        """Generate all documentation for a repo."""
        print(f"[DocAgent] Scanning {repo_url}...")
        ctx = await self.scan_repo(repo_url)
        print(f"[DocAgent] Found {len(ctx.tree)} files, {len(ctx.languages)} languages")

        print("[DocAgent] Generating README...")
        readme = await self.generate_readme(ctx)

        print("[DocAgent] Generating API docs...")
        api_docs = await self.generate_api_docs(ctx)

        print("[DocAgent] Generating architecture overview...")
        architecture = await self.generate_architecture(ctx)

        print("[DocAgent] Generating changelog...")
        changelog = await self.generate_changelog(ctx)

        return {
            "repo": f"{ctx.owner}/{ctx.repo}",
            "readme": readme,
            "api_docs": api_docs,
            "architecture": architecture,
            "changelog": changelog,
            "files_scanned": len(ctx.tree),
            "languages": ctx.languages,
        }
