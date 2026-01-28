from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    tool_calls: Optional[List[dict]] = None

class Session(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    conversation_id: str
    user_id: str
    messages: List[Message] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_active: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict = Field(default_factory=dict)

    def add_message(self, role: str, content: str, tool_calls: Optional[List[dict]] = None):
        self.messages.append(Message(role=role, content=content, tool_calls=tool_calls))
        self.last_active = datetime.utcnow()

    def get_history(self, limit: int = 20) -> List[dict]:
        """Get recent messages for context window"""
        recent = self.messages[-limit:] if len(self.messages) > limit else self.messages
        return [{"role": m.role, "content": m.content} for m in recent]

class SessionManager:
    def __init__(self):
        self._sessions: Dict[str, Session] = {}

    def get_or_create(self, conversation_id: str, user_id: str = "default") -> Session:
        if conversation_id not in self._sessions:
            self._sessions[conversation_id] = Session(
                conversation_id=conversation_id,
                user_id=user_id
            )
        return self._sessions[conversation_id]

    def get(self, conversation_id: str) -> Optional[Session]:
        return self._sessions.get(conversation_id)

    def delete(self, conversation_id: str) -> bool:
        if conversation_id in self._sessions:
            del self._sessions[conversation_id]
            return True
        return False

# Global session manager instance
session_manager = SessionManager()
