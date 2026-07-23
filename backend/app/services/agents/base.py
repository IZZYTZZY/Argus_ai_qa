"""Base class for the agent team. Each agent = a role, a system prompt, and a
structured task. The orchestrator composes them into workflows."""
from dataclasses import dataclass
from app.services import llm


@dataclass
class AgentResult:
    agent: str
    output: dict


class Agent:
    name: str = "agent"
    system_prompt: str = ""

    def run(self, task: str, context: str = "") -> AgentResult:
        user = f"PROJECT CONTEXT:\n{context}\n\nTASK:\n{task}" if context else task
        return AgentResult(self.name, llm.complete_json(self.system_prompt, user))
