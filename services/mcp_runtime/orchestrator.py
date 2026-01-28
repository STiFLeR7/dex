import opik
from datetime import datetime
import pytz
from typing import Any, Dict, List
from .schemas import MCPContext, AssistantIdentity
from .session import session_manager
from .llm import gemini_client
from services.prompt_registry.registry import PromptRegistry
from services.tools.definitions import EchoTool, CalculatorTool

# TODO: Use dependency injection/factory for these
prompt_registry = PromptRegistry()
tools = {
    "echo": EchoTool(),
    "calculator": CalculatorTool()
}

class Orchestrator:
    def __init__(self):
        # Opik is configured via env vars (OPIK_API_KEY, etc.)
        self.client = opik.Opik()

    def _get_datetime_context(self) -> Dict[str, str]:
        """Get current datetime information for prompt injection"""
        tz = pytz.timezone('Asia/Kolkata')  # IST timezone
        now = datetime.now(tz)
        return {
            "current_date": now.strftime("%B %d, %Y"),
            "current_time": now.strftime("%I:%M %p"),
            "timezone": "IST (Asia/Kolkata)",
            "day_of_week": now.strftime("%A")
        }

    @opik.track(name="dex_process_interaction")
    async def process(self, context: MCPContext) -> Dict[str, Any]:
        """
        Orchestrates the handling of a user message.
        """
        # 1. Get or create session
        session = session_manager.get_or_create(
            conversation_id=context.session.conversation_id,
            user_id="default"
        )
        
        # 2. Load Prompt and inject datetime
        prompt = prompt_registry.get_prompt(context.prompt.id, context.prompt.version)
        base_prompt = prompt.system_prompt if prompt else "You are Dex, a helpful AI assistant."
        
        # Inject datetime context
        datetime_ctx = self._get_datetime_context()
        system_prompt = base_prompt.format(**datetime_ctx) if prompt else base_prompt
        
        # 3. Add user message to session
        session.add_message("user", context.user_input.message)
        
        # 4. Check for tool keywords first
        user_msg_lower = context.user_input.message.lower()
        if "calc" in user_msg_lower:
            res = await tools["calculator"].execute(tools["calculator"].input_model(expression="2 + 2"))
            response_text = f"Computed: {res}"
        elif "echo" in user_msg_lower:
            res = await tools["echo"].execute(tools["echo"].input_model(message=context.user_input.message))
            response_text = res
        else:
            # 5. Call Gemini with conversation history
            response_text = await self._call_llm(system_prompt, session.get_history())
        
        # 6. Add assistant response to session
        session.add_message("assistant", response_text)
        
        return {
            "context_id": context.context_id,
            "response": response_text,
            "trace_id": context.context_id,
            "session_id": session.session_id
        }

    @opik.track(name="llm_generation")
    async def _call_llm(self, system: str, messages: List[Dict]) -> str:
        """Call Gemini API with conversation history"""
        return await gemini_client.generate(messages=messages, system_prompt=system)

