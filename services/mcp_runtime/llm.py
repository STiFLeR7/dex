import os
import httpx
import json
from typing import List, Dict, Any, Optional
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root with override to ensure fresh values
env_path = Path(__file__).resolve().parents[2] / ".env"
print(f"Loading .env from: {env_path}")
load_dotenv(env_path, override=True)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print(f"Loaded GEMINI_API_KEY: {GEMINI_API_KEY[:20] if GEMINI_API_KEY else 'None'}...")

# Use Gemini 2.0 Flash model
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

class GeminiClient:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or GEMINI_API_KEY
        print(f"GeminiClient initialized with key: {self.api_key[:20] if self.api_key else 'None'}...")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment")

    async def generate(
        self, 
        messages: List[Dict[str, str]], 
        system_prompt: str = None
    ) -> str:
        """
        Generate a response using Gemini API.
        
        Args:
            messages: List of {"role": "user"|"assistant", "content": "..."} dicts
            system_prompt: Optional system instruction
        """
        # Ensure messages is not empty
        if not messages:
            return "I'm ready to help. What would you like to discuss?"
        
        # Convert to Gemini format - Gemini uses "model" for assistant
        contents = []
        for msg in messages:
            # Skip empty messages
            if not msg.get("content", "").strip():
                continue
            
            role = "model" if msg["role"] == "assistant" else "user"
            contents.append({
                "role": role,
                "parts": [{"text": msg["content"]}]
            })
        
        # Ensure we have at least one message and it starts with user
        if not contents:
            return "I'm ready to help. What would you like to discuss?"
        
        # Gemini requires first message to be from user
        if contents[0]["role"] != "user":
            contents.insert(0, {"role": "user", "parts": [{"text": "Hello"}]})

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.7,
                "topP": 0.95,
                "topK": 40,
                "maxOutputTokens": 8192,
            }
        }

        if system_prompt:
            payload["systemInstruction"] = {
                "parts": [{"text": system_prompt}]
            }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{GEMINI_API_URL}?key={self.api_key}",
                    json=payload,
                    timeout=60.0
                )
                
                if response.status_code != 200:
                    error_detail = response.text
                    print(f"Gemini API Error: {response.status_code} - {error_detail}")
                    print(f"Request payload: {json.dumps(payload, indent=2)}")
                    return f"Error: Gemini API returned {response.status_code}. Please try again."
                
                data = response.json()

            # Extract text from response
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except httpx.HTTPStatusError as e:
            print(f"HTTP Error: {e}")
            return f"Error communicating with Gemini: {str(e)}"
        except (KeyError, IndexError) as e:
            print(f"Response parsing error: {e}, Data: {data}")
            return "Error: Unexpected response format from Gemini."
        except Exception as e:
            print(f"Unexpected error: {e}")
            return f"Error: {str(e)}"

# Global client instance
gemini_client = GeminiClient()
