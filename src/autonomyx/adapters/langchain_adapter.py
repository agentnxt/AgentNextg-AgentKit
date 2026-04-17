"""LangChain adapter — convert Autonomyx Agent to LangChain agent."""


def to_langchain_agent(agent):
    from langchain_anthropic import ChatAnthropic
    from langchain.agents import AgentExecutor, create_tool_calling_agent
    from langchain_core.prompts import ChatPromptTemplate

    llm = ChatAnthropic(model=agent.model)
    tools = [t.to_langchain_tool() for t in agent.tools]
    prompt = ChatPromptTemplate.from_messages([
        ("system", agent.system_prompt or f"You are {agent.name}."),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ])
    lc_agent = create_tool_calling_agent(llm, tools, prompt)
    return AgentExecutor(agent=lc_agent, tools=tools)
