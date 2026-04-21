# Issue Solving Workflow

This guide explains how to solve technical issues using a three-tier approach: GitHub search, product documentation, and Playwright automation.

## Overview

| Step | Tool/Method | When to Use |
|------|-------------|-------------|
| 1 | Search GitHub (issues, PRs, code) | First approach for open-source & popular tools |
| 2 | Product documentation | For specific products, APIs, or services |
| 3 | Playwright automation | When manual steps are needed |

---

## Step 1: Search GitHub

### Use GitHub Issues & PRs

Search existing issues and pull requests for similar problems:

```bash
# Using GitHub CLI (gh)
gh issue list --search "keyword" --state all
gh pr list --search "keyword" --state all

# Using GitHub API with curl
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  "https://api.github.com/search/issues?q=keyword+repo:owner/repo"
```

### Use GitHub Code Search

Search across repositories for code examples:

```bash
# Search code in a repository
gh search code "function_name" --repo owner/repo

# Or use GitHub API
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  "https://api.github.com/search/code?q=function+repo:owner/repo"
```

---

## Step 2: Product Documentation

### Use Tavily for Documentation Search

```python
from tavily import TavilyClient

client = TavilyClient(api_key="your-api-key")

# Search documentation
results = client.search(
    query="how to authenticate with GitHub API",
    search_depth="advanced"
)
```

### Use tavily_skill for Targeted Search

```python
from skills.tavily_skill import search

# Search specific library documentation
results = search(
    query="celery beat periodic tasks",  # Your question
    library="celery",               # Specific library name
    task="integrate"               # What you're trying to do
)
```

---

## Step 3: Playwright Automation

When manual interaction is needed (e.g., UI testing, complex workflows):

### Installation

```bash
pip install pytest-playwright playwright
playwright install  # Install browsers (Chromium, Firefox, WebKit)
```

### Basic Automation Script

```python
from playwright.sync_api import sync_playwright

def automate_task():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Navigate to the target page
        page.goto("https://example.com")
        
        # Perform actions
        page.get_by_role("button", name="Submit").click()
        
        # Verify results
        assert "Success" in page.content()
        
        # Cleanup
        page.close()
        browser.close()

if __name__ == "__main__":
    automate_task()
```

### With pytest

```python
import pytest
from playwright.sync_api import Page, expect

def test_login_flow(page: Page):
    page.goto("https://app.example.com/login")
    page.get_by_label("Email").fill("user@example.com")
    page.get_by_label("Password").fill("password123")
    page.get_by_role("button", name="Login").click()
    
    expect(page).to_have_url(/.*dashboard/)
```

---

## Decision Flowchart

```
Start
  │
  ▼
Is the issue common? ──Yes──▶ Search GitHub Issues
  │                              │
  │                              ▼
  │                    Found solution? ──No──▶
  │                       │                 │
  │                      Yes                 ▼
  │                       │          Search Product Docs
  │                       │                 │
  │                       ▼                 ▼
  ▼               Document it         Found solution?
No                      │                 │
  │                      ▼                 │
  ▼              Apply fix            No──▶ Use Playwright
                                              │
                                              ▼
                                          Automate solution
                                              │
                                              ▼
                                          Document & share
```

---

## Examples

### Example 1: Fix GitHub Actions Failure

```bash
# 1. Search GitHub for similar failures
gh issue list --search "actions fail" --state all

# 2. Search docs
tavily_skill(query="GitHub Actions matrix strategy", library="github")

# 3. If unsolved, look at error messages and try solutions
```

### Example 2: API Authentication

```bash
# 1. Search GitHub code examples
gh search code "oauth token" --repo owner/repo

# 2. Search product docs
tavily_skill(query="OAuth 2.0 authentication flow", library="google-cloud")

# 3. Test with Playwright if it's a UI flow
```

---

## Best Practices

1. **Always search first** - 90% of issues have been solved before
2. **Check multiple sources** - GitHub issues, Stack Overflow, official docs
3. **Reproduce the issue** - Create a minimal test case
4. **Document your solution** - Help others with the same problem
5. **Automate repetitive tasks** - Use Playwright for recurring workflows

---

## Related Skills

- [github skill](./skills/github/SKILL.md)
- [tavily skill](./skills/tavily/SKILL.md)
- [docker skill](./skills/docker/SKILL.md)
- [playwright documentation](https://playwright.dev/python/docs/intro)