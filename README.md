# Dex - Personal AI Assistant

<div align="center">

![Dex Logo](https://img.shields.io/badge/Dex-Personal%20AI%20Assistant-22c55e?style=for-the-badge&logo=sparkles&logoColor=white)

**MCP-Powered • Memory-Aware • Multi-Channel**

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Gemini](https://img.shields.io/badge/Gemini-2.0%20Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)

</div>

---

## 🎯 Overview

**Dex** is a production-grade personal AI assistant built on the **Model Context Protocol (MCP)** architecture. Unlike generic chatbots, Dex is designed to be a persistent, memory-aware assistant that:

- 🧠 **Remembers** your conversations, notes, and preferences
- ⏰ **Tracks** reminders and sends alerts via WhatsApp/Telegram
- 🔄 **Syncs** seamlessly across Web, WhatsApp, and Telegram
- 📎 **Handles** file uploads and context-aware responses
- 🔍 **Traces** all interactions via Opik for observability

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Dex Architecture                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Web UI    │    │  WhatsApp   │    │  Telegram   │         │
│  │  (Vite)     │    │    Bot      │    │    Bot      │         │
│  │  :5173      │    │   Baileys   │    │   grammY    │         │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘         │
│         │                  │                  │                 │
│         └──────────────────┼──────────────────┘                 │
│                            ▼                                    │
│                   ┌─────────────────┐                          │
│                   │   MCP Runtime   │                          │
│                   │   (FastAPI)     │                          │
│                   │     :8000       │                          │
│                   └────────┬────────┘                          │
│                            │                                    │
│         ┌──────────────────┼──────────────────┐                │
│         ▼                  ▼                  ▼                │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐          │
│  │ Orchestrator│   │   Prompt    │   │    Tools    │          │
│  │  + Session  │   │  Registry   │   │  (Echo,Calc)│          │
│  └─────────────┘   └─────────────┘   └─────────────┘          │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐   ┌─────────────┐                             │
│  │ Gemini 2.0  │   │   Opik      │                             │
│  │   Flash     │   │  Tracing    │                             │
│  └─────────────┘   └─────────────┘                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
dex/
├── ui/                          # Frontend (Vite + React + TypeScript)
│   ├── components/
│   │   ├── InputArea.tsx        # Message input with file upload
│   │   ├── LeftSidebar.tsx      # Conversation history
│   │   ├── RightSidebar.tsx     # Quick Access panel
│   │   ├── MessageBubble.tsx    # Chat messages
│   │   └── WelcomeScreen.tsx    # Landing screen
│   ├── services/
│   │   └── api.ts               # Backend API integration
│   ├── App.tsx                  # Main application
│   └── types.ts                 # TypeScript interfaces
│
├── services/
│   ├── mcp_runtime/             # Core MCP Runtime
│   │   ├── main.py              # FastAPI app + endpoints
│   │   ├── orchestrator.py      # Message orchestration
│   │   ├── llm.py               # Gemini client
│   │   ├── session.py           # Session management
│   │   ├── gateway.py           # WebSocket gateway
│   │   └── schemas.py           # Pydantic models
│   │
│   ├── prompt_registry/         # Prompt Management
│   │   ├── registry.py          # Prompt loader
│   │   └── prompts/
│   │       └── dex_core.yaml    # Dex persona definition
│   │
│   ├── tools/                   # Tool Definitions
│   │   └── definitions.py       # Echo, Calculator tools
│   │
│   └── channels/                # Multi-Channel Adapters
│       ├── discord/             # Discord bot
│       ├── telegram/            # Telegram bot (grammY)
│       └── whatsapp/            # WhatsApp bot (Baileys)
│
├── web/                         # Legacy Next.js UI (deprecated)
├── k8s/                         # Kubernetes manifests
├── scripts/                     # Utility scripts
└── .env                         # Environment variables
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Gemini API Key from [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Clone & Setup Environment

```powershell
# Clone the repository
git clone https://github.com/STiFLeR7/dex.git
cd dex

# Create Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install Python dependencies
pip install fastapi uvicorn httpx python-dotenv pyyaml opik pytz python-multipart
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
# Gemini API (Get from https://aistudio.google.com/apikey)
GEMINI_API_KEY=your_gemini_api_key_here

# Opik Tracing (Optional - for observability)
OPIK_API_KEY=your_opik_api_key
OPIK_WORKSPACE=your_workspace

# Channel Tokens (Optional - for multi-channel)
DISCORD_BOT_TOKEN=your_discord_token
TELEGRAM_BOT_TOKEN=your_telegram_token
```

### 3. Start the Backend

```powershell
# From project root with venv activated
uvicorn services.mcp_runtime.main:app --reload --port 8000
```

### 4. Start the Frontend

```powershell
# In a new terminal
cd ui
npm install
npm run dev
```

### 5. Access Dex

Open **<http://localhost:5173>** in your browser.

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/v1/process` | POST | Process message (main endpoint) |
| `/v1/whatsapp/status` | GET | Check WhatsApp connection |
| `/v1/whatsapp/connect` | POST | Mark WhatsApp connected |
| `/v1/notes` | GET/POST | Manage saved notes |
| `/v1/reminders` | GET/POST | Manage reminders |
| `/v1/upload` | POST | Upload files |
| `/ws/{conversation_id}` | WebSocket | Real-time messaging |

### Example: Send Message

```bash
curl -X POST http://localhost:8000/v1/process \
  -H "Content-Type: application/json" \
  -d '{
    "context_id": "123",
    "assistant": {"name": "Dex", "persona_version": "2.0.0"},
    "session": {"type": "web", "conversation_id": "conv-1"},
    "user_input": {"message": "Hello Dex!"},
    "prompt": {"id": "dex-core", "version": "2.0.0"},
    "tools_available": ["echo", "calculator"]
  }'
```

---

## 🎨 UI Features

| Feature | Description |
|---------|-------------|
| **Dark Theme** | Professional grey (#1a1a1a) with green accents (#22c55e) |
| **File Upload** | Attach images, PDFs, docs via paperclip button |
| **Conversation History** | Persisted in localStorage, grouped by date |
| **Quick Access Panel** | Real-time date/time, notes, reminders |
| **Channel Connect** | Connect WhatsApp/Telegram from UI |
| **Responsive** | Works on desktop, tablet, mobile |

---

## 🔌 Multi-Channel Setup

### WhatsApp (Baileys)

```powershell
cd services/channels/whatsapp
npm install
npm start
# Scan QR code when prompted
```

### Telegram (grammY)

```powershell
# Set TELEGRAM_BOT_TOKEN in .env first
cd services/channels/telegram
npm install
npm start
```

### Discord

```powershell
# Set DISCORD_BOT_TOKEN in .env first
cd services/channels/discord
npm install
npm start
```

---

## 🧠 Dex Persona

Dex is configured via `services/prompt_registry/prompts/dex_core.yaml`:

```yaml
id: dex-core
version: "2.0.0"

system_prompt: |
  You are **Dex**, a personal AI assistant.
  
  ## IDENTITY
  - Your name is **Dex** - always introduce yourself by name
  - You are friendly, helpful, and precise
  - You remember context from conversations
  
  ## CURRENT CONTEXT
  - Current Date: {current_date}
  - Current Time: {current_time}
  - Timezone: {timezone}
  - Day of Week: {day_of_week}
```

The orchestrator automatically injects the current date/time into every response.

---

## 📊 Observability

Dex uses **Opik** for tracing and observability:

- All interactions are logged with trace IDs
- View traces at [Comet Opik Dashboard](https://www.comet.com/opik)
- Traces include: messages, LLM calls, tool executions

---

## 🛠️ Development Status

| Component | Status |
|-----------|--------|
| MCP Runtime | ✅ Complete |
| Gemini Integration | ✅ Complete |
| Web UI (Vite) | ✅ Complete |
| File Upload | ✅ Complete |
| Session Management | ✅ Complete |
| Opik Tracing | ✅ Complete |
| WhatsApp Bot | 🔧 Ready (needs testing) |
| Telegram Bot | 🔧 Ready (needs testing) |
| Discord Bot | 🔧 Ready (needs testing) |
| Kubernetes Deployment | 📋 Prepared |

---

## 🔜 Coming Soon

- [ ] Persistent database for notes/reminders
- [ ] User authentication system
- [ ] Voice input/output
- [ ] Advanced tool integrations
- [ ] Mobile app (React Native)

---

## 📝 License

MIT License - See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ by STIFLER**

</div>
