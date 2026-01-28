from abc import ABC, abstractmethod
from pydantic import BaseModel, Field
from typing import Dict, Any, Type, Awaitable

class ToolInput(BaseModel):
    pass

class ToolSchema(BaseModel):
    name: str
    description: str
    input_model: Dict[str, Any]  # JSON Schema representation

class BaseTool(ABC):
    name: str
    description: str
    input_model: Type[BaseModel]

    @property
    def schema(self) -> ToolSchema:
        return ToolSchema(
            name=self.name,
            description=self.description,
            input_model=self.input_model.model_json_schema()
        )

    @abstractmethod
    async def execute(self, input_data: BaseModel) -> Any:
        pass
