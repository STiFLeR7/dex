from .base import BaseTool
from pydantic import BaseModel, Field
from typing import Any

# --- Echo Tool ---
class EchoInput(BaseModel):
    message: str = Field(..., description="Message to echo back")

class EchoTool(BaseTool):
    name = "echo"
    description = "Echoes the input message back to the user. Useful for testing."
    input_model = EchoInput

    async def execute(self, input_data: EchoInput) -> str:
        return f"Echo: {input_data.message}"

# --- Calculator Tool (Simple) ---
class CalculatorInput(BaseModel):
    expression: str = Field(..., description="Mathematical expression to evaluate (e.g., '2 + 2')")

class CalculatorTool(BaseTool):
    name = "calculator"
    description = "Evaluates a mathematical expression."
    input_model = CalculatorInput

    async def execute(self, input_data: CalculatorInput) -> Any:
        try:
            # SAFETY WARNING: eval() is dangerous. In prod, use a safe parser.
            # For this demo, we restrict to basic chars.
            allowed = set("0123456789+-*/(). ")
            if not set(input_data.expression).issubset(allowed):
                return "Error: Invalid characters in expression."
            return eval(input_data.expression)
        except Exception as e:
            return f"Error: {str(e)}"
