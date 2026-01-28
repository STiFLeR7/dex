from pathlib import Path
import yaml
from typing import Dict, Optional, Any
from pydantic import BaseModel

class Prompt(BaseModel):
    id: str
    version: str
    system_prompt: str
    evaluation_criteria: list[str] = []
    metadata: Dict[str, Any] = {}

class PromptRegistry:
    def __init__(self, prompt_dir: str = "services/prompt_registry/prompts"):
        self.prompt_dir = Path(prompt_dir)
        self._cache: Dict[str, Prompt] = {}

    def get_prompt(self, prompt_id: str, version: str = "latest") -> Optional[Prompt]:
        # TODO: Implement versioning logic. For now, just load the file [id].yaml
        # In a real system, we might look for [id]_v[version].yaml or use a DB.
        
        prompt_path = self.prompt_dir / f"{prompt_id}.yaml"
        if not prompt_path.exists():
            return None
            
        if prompt_path in self._cache:
            return self._cache[prompt_path]

        with open(prompt_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        
        prompt = Prompt(**data)
        self._cache[prompt_path] = prompt
        return prompt
