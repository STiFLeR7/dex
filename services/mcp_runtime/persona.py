from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class PersonaProfile(BaseModel):
    name: str = "Dex"
    role: str = "Personal AI Assistant"
    style_guidelines: List[str] = Field(default_factory=list)
    constraints: List[str] = Field(default_factory=list)
    version: str = "1.0.0"

class MemoryConfig(BaseModel):
    short_term_context_window: int = 10
    long_term_memory_enabled: bool = True
    vector_store_type: str = "chroma"  # Placeholder
    vector_store_path: Optional[str] = "data/memory"

class AssistantConfig(BaseModel):
    persona: PersonaProfile
    memory: MemoryConfig
    tool_registry_path: str = "services/tools"
