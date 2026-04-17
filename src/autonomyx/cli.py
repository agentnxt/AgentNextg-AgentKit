"""Autonomyx ADK CLI."""

import click
import asyncio


@click.group()
@click.version_option()
def main():
    """Autonomyx ADK — One SDK, all agent frameworks."""
    pass


@main.command()
@click.argument("prompt")
@click.option("--name", default="cli-agent", help="Agent name")
@click.option("--model", default="claude-sonnet-4-20250514", help="Model")
def run(prompt, name, model):
    """Run a single agent with a prompt."""
    from autonomyx import Agent
    agent = Agent(name=name, model=model)
    result = asyncio.run(agent.run(prompt))
    print(result)


@main.command()
@click.argument("name")
@click.option("--tenant", default="default", help="Tenant ID")
def provision(name, tenant):
    """Provision an agent identity."""
    from autonomyx import IdentityClient
    client = IdentityClient()
    creds = asyncio.run(client.provision(name, tenant_id=tenant))
    print(f"Agent ID: {creds.agent_id}")
    print(f"API Key:  {creds.api_key}")
    print(f"Status:   {creds.status}")


@main.command()
def skills():
    """List available MCP skills from registry."""
    import httpx
    r = httpx.get("https://registry.unboxd.cloud/v2/_catalog", auth=("admin", "autonomyx2026"), timeout=10)
    if r.status_code == 200:
        repos = r.json().get("repositories", [])
        skills = [r for r in repos if r.startswith("agnxxt/skill-")]
        print(f"{len(skills)} skills available:")
        for s in sorted(skills):
            print(f"  {s.replace('agnxxt/skill-', '')}")


if __name__ == "__main__":
    main()
