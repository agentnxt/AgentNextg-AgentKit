"""
Workflow — multi-agent orchestration with sequential/parallel execution.
"""

from dataclasses import dataclass, field
from typing import Optional
from autonomyx.agent import Agent


@dataclass
class Step:
    name: str
    agent: Agent
    prompt: str
    depends_on: list[str] = field(default_factory=list)
    result: Optional[str] = None


@dataclass
class Workflow:
    name: str
    steps: list[Step] = field(default_factory=list)
    verbose: bool = True

    def add_step(self, name: str, agent: Agent, prompt: str, depends_on: list[str] = None) -> "Workflow":
        self.steps.append(Step(name=name, agent=agent, prompt=prompt, depends_on=depends_on or []))
        return self

    async def run(self, inputs: dict = None) -> dict:
        results = {}
        inputs = inputs or {}

        for step in self._topo_sort():
            context = ""
            for dep in step.depends_on:
                if dep in results:
                    context += f"\n--- {dep} output ---\n{results[dep]}\n"

            prompt = step.prompt.format(**inputs) if inputs else step.prompt

            if self.verbose:
                print(f"[{step.name}] Running with {step.agent.name}...")

            step.result = await step.agent.run(prompt, context)
            results[step.name] = step.result

            if self.verbose:
                print(f"[{step.name}] Done ({len(step.result)} chars)")

        return results

    def _topo_sort(self) -> list[Step]:
        visited = set()
        order = []
        step_map = {s.name: s for s in self.steps}

        def visit(name):
            if name in visited:
                return
            visited.add(name)
            step = step_map.get(name)
            if step:
                for dep in step.depends_on:
                    visit(dep)
                order.append(step)

        for s in self.steps:
            visit(s.name)
        return order
