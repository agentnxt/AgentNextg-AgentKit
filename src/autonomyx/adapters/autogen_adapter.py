"""AutoGen adapter — convert Autonomyx Agent to AutoGen agent."""


def to_autogen_agent(agent, **kwargs):
    from autogen import AssistantAgent
    return AssistantAgent(
        name=agent.name,
        system_message=agent.system_prompt or f"You are {agent.name}.",
        llm_config={"model": agent.model},
        **kwargs,
    )
