"""CrewAI adapter — convert Autonomyx Agent to CrewAI agent."""


def to_crewai_agent(agent):
    from crewai import Agent as CrewAgent
    return CrewAgent(
        role=agent.name,
        goal=agent.system_prompt or f"Complete tasks as {agent.name}",
        backstory=f"AI agent provisioned via Autonomyx Identity Platform",
        llm=agent.model,
        verbose=True,
    )
