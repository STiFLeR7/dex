from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List, Optional
import os
import uuid
from pathlib import Path
from .schemas import MCPContext

app = FastAPI(title="Dex MCP Runtime")

# CORS middleware for frontend - allow all localhost ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# In-memory storage for demo (would be database in production)
notes_storage = []
reminders_storage = []
whatsapp_connected = False
whatsapp_phone = None

@app.get("/")
async def health_check():
    return {"status": "ok", "service": "dex-mcp-runtime", "websocket": "/ws/{conversation_id}"}

from .orchestrator import Orchestrator
from .gateway import create_gateway_routes

orchestrator = Orchestrator()

# Add WebSocket gateway routes
create_gateway_routes(app, orchestrator)

@app.post("/v1/process")
async def process_interaction(context: MCPContext):
    """
    Main entry point for Dex interactions (REST API).
    Accepts full MCP Context, orchestrates execution (tools, model), and logs to Opik.
    """
    result = await orchestrator.process(context)
    return result

# ============== WhatsApp Status ==============
@app.get("/v1/whatsapp/status")
async def get_whatsapp_status():
    """Check WhatsApp connection status"""
    return {
        "connected": whatsapp_connected,
        "phone": whatsapp_phone
    }

@app.post("/v1/whatsapp/connect")
async def connect_whatsapp(phone: str):
    """Mark WhatsApp as connected (called by WhatsApp bot)"""
    global whatsapp_connected, whatsapp_phone
    whatsapp_connected = True
    whatsapp_phone = phone
    return {"status": "connected", "phone": phone}

@app.post("/v1/whatsapp/disconnect")
async def disconnect_whatsapp():
    """Mark WhatsApp as disconnected"""
    global whatsapp_connected, whatsapp_phone
    whatsapp_connected = False
    whatsapp_phone = None
    return {"status": "disconnected"}

# ============== Notes ==============
@app.get("/v1/notes")
async def get_notes():
    """Get all saved notes"""
    return notes_storage

@app.post("/v1/notes")
async def save_note(title: str, content: str, pinned: bool = False):
    """Save a new note"""
    note = {
        "id": str(uuid.uuid4()),
        "title": title,
        "content": content,
        "pinned": pinned,
        "date": str(datetime.now().date())
    }
    notes_storage.append(note)
    return note

@app.delete("/v1/notes/{note_id}")
async def delete_note(note_id: str):
    """Delete a note"""
    global notes_storage
    notes_storage = [n for n in notes_storage if n["id"] != note_id]
    return {"status": "deleted"}

# ============== Reminders ==============
@app.get("/v1/reminders")
async def get_reminders():
    """Get all reminders"""
    return reminders_storage

@app.post("/v1/reminders")
async def create_reminder(text: str, due_time: str, platform: str = "System"):
    """Create a new reminder"""
    reminder = {
        "id": str(uuid.uuid4()),
        "text": text,
        "dueTime": due_time,
        "platform": platform
    }
    reminders_storage.append(reminder)
    return reminder

@app.delete("/v1/reminders/{reminder_id}")
async def delete_reminder(reminder_id: str):
    """Delete a reminder"""
    global reminders_storage
    reminders_storage = [r for r in reminders_storage if r["id"] != reminder_id]
    return {"status": "deleted"}

# ============== File Upload ==============
@app.post("/v1/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a file and return its URL"""
    # Generate unique filename
    ext = Path(file.filename).suffix if file.filename else ""
    unique_name = f"{uuid.uuid4()}{ext}"
    file_path = UPLOAD_DIR / unique_name
    
    # Save file
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Return URL (would be full URL in production)
    return {
        "url": f"/uploads/{unique_name}",
        "filename": file.filename,
        "size": len(content)
    }

# Serve uploaded files
try:
    app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
except Exception:
    pass  # Directory might not exist yet

# Import datetime for notes
from datetime import datetime
