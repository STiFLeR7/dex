from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AssistantIdentity(BaseModel):
    name: str = "Dex"
    persona_version: str

class SessionInfo(BaseModel):
    type: str = "chat"
    conversation_id: str

class UserInput(BaseModel):
    message: str

class PromptInfo(BaseModel):
    id: str
    version: str

class MCPContext(BaseModel):
    context_id: str
    assistant: AssistantIdentity
    session: SessionInfo
    user_input: UserInput
    memory_refs: Dict[str, List[str]] = Field(default_factory=dict)
    prompt: PromptInfo
    tools_available: List[str] = Field(default_factory=list)
    constraints: Dict[str, Any] = Field(default_factory=dict)
