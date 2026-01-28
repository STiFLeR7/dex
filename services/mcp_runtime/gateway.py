import asyncio
import json
import uuid
from typing import Dict, Set
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

class ConnectionManager:
    """Manages WebSocket connections"""
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_sessions: Dict[str, Set[str]] = {}  # user_id -> set of connection_ids

    async def connect(self, websocket: WebSocket, connection_id: str, user_id: str = "default"):
        await websocket.accept()
        self.active_connections[connection_id] = websocket
        if user_id not in self.user_sessions:
            self.user_sessions[user_id] = set()
        self.user_sessions[user_id].add(connection_id)

    def disconnect(self, connection_id: str):
        if connection_id in self.active_connections:
            del self.active_connections[connection_id]
        # Clean up user sessions
        for user_id, connections in self.user_sessions.items():
            connections.discard(connection_id)

    async def send_message(self, connection_id: str, message: dict):
        if connection_id in self.active_connections:
            await self.active_connections[connection_id].send_json(message)

    async def broadcast_to_user(self, user_id: str, message: dict):
        if user_id in self.user_sessions:
            for conn_id in self.user_sessions[user_id]:
                await self.send_message(conn_id, message)

manager = ConnectionManager()

def create_gateway_routes(app: FastAPI, orchestrator):
    """Add WebSocket gateway routes to FastAPI app"""
    
    @app.websocket("/ws/{conversation_id}")
    async def websocket_endpoint(websocket: WebSocket, conversation_id: str):
        connection_id = str(uuid.uuid4())
        await manager.connect(websocket, connection_id)
        
        # Send connection confirmation
        await manager.send_message(connection_id, {
            "type": "connected",
            "connection_id": connection_id,
            "conversation_id": conversation_id
        })
        
        try:
            while True:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                if message.get("type") == "message":
                    # Build MCP context from WebSocket message
                    from .schemas import MCPContext, AssistantIdentity, SessionInfo, UserInput, PromptInfo
                    
                    context = MCPContext(
                        context_id=str(uuid.uuid4()),
                        assistant=AssistantIdentity(name="Dex", persona_version="1.0"),
                        session=SessionInfo(type="chat", conversation_id=conversation_id),
                        user_input=UserInput(message=message.get("content", "")),
                        prompt=PromptInfo(id="dex-core", version="1.0.0"),
                        tools_available=["echo", "calculator"]
                    )
                    
                    # Send typing indicator
                    await manager.send_message(connection_id, {
                        "type": "typing",
                        "status": True
                    })
                    
                    # Process through orchestrator
                    result = await orchestrator.process(context)
                    
                    # Send response
                    await manager.send_message(connection_id, {
                        "type": "message",
                        "role": "assistant",
                        "content": result["response"],
                        "context_id": result["context_id"],
                        "session_id": result.get("session_id")
                    })
                    
                    # Turn off typing indicator
                    await manager.send_message(connection_id, {
                        "type": "typing",
                        "status": False
                    })
                    
                elif message.get("type") == "ping":
                    await manager.send_message(connection_id, {"type": "pong"})
                    
        except WebSocketDisconnect:
            manager.disconnect(connection_id)
        except Exception as e:
            await manager.send_message(connection_id, {
                "type": "error",
                "message": str(e)
            })
            manager.disconnect(connection_id)
