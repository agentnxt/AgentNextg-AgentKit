"""CLI for DocAgent."""

import click
import asyncio
import json
import os


@click.group()
@click.version_option()
def main():
    """DocAgent — AI documentation from GitHub repos."""
    pass


@main.command()
@click.argument("repo_url")
@click.option("--output", "-o", default="docs", help="Output directory")
@click.option("--model", default=None, help="LLM model to use")
def generate(repo_url, output, model):
    """Generate full documentation for a GitHub repo."""
    from teams.docteam.agent import DocAgent
    agent = DocAgent(model=model) if model else DocAgent()
    result = asyncio.run(agent.generate_all(repo_url))

    os.makedirs(output, exist_ok=True)
    for key in ["readme", "api_docs", "architecture", "changelog"]:
        filename = {"readme": "README.md", "api_docs": "API.md", "architecture": "ARCHITECTURE.md", "changelog": "CHANGELOG.md"}[key]
        with open(f"{output}/{filename}", "w") as f:
            f.write(result[key])
        print(f"  Written: {output}/{filename}")

    print(f"\nDone — {result['files_scanned']} files scanned, {len(result['languages'])} languages")


@main.command()
def whoami():
    """Show this agent's identity."""
    print(json.dumps({
        "agent_name": "doc-agent",
        "agent_type": "workflow",
        "team": "docteam",
        "capabilities": ["readme", "api_docs", "architecture", "changelog"],
        "model": os.environ.get("DOC_MODEL", "qwen3:30b-a3b"),
        "identity_url": os.environ.get("AUTONOMYX_API_URL", "https://api.unboxd.cloud/identity"),
    }, indent=2))


if __name__ == "__main__":
    main()
