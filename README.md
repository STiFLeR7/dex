# 🤖 Dex - Personal AI Assistant

A production-ready AI assistant inspired by [Clawdbot](https://github.com/clawdbot/clawdbot), featuring a ChatGPT-style interface and multi-channel support.

![Dex Chat Interface](./doc/screenshot.png)

## ✨ Features

- **ChatGPT-style UI** - Dark theme, sidebar with conversation history, floating input bar
- **Multi-channel Support** - Discord, Telegram, WhatsApp integration
- **Session Management** - Conversation persistence and context management
- **Opik Tracing** - Full observability with Opik/Comet
- **Gemini Powered** - Google's Gemini 1.5 Flash for fast responses
- **WebSocket Gateway** - Real-time messaging support

## 🏗️ Architecture

```
Discord / Telegram / WhatsApp / WebChat
                │
                ▼
        Channel Adapters (Node.js)
                │
                ▼
        Gateway WebSocket (/ws/{conversation_id})
                │
                ▼
        FastAPI Orchestrator → Gemini API
                │
                ▼
           Opik Tracing
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Gemini API Key from [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Clone and Setup

```bash
git clone https://github.com/your-username/dex.git
cd dex

# Setup Python environment
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r services/mcp_runtime/requirements.txt

# Setup Web UI
cd web
npm install
```

### 2. Configure Environment

Create `.env` in the root directory:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Opik Tracing (optional)
OPIK_API_KEY=your_opik_key
OPIK_WORKSPACE=your_workspace

# Channel Bots (optional)
DISCORD_BOT_TOKEN=your_discord_token
TELEGRAM_BOT_TOKEN=your_telegram_token
```

### 3. Run

```bash
# Terminal 1: Start backend
cd dex
.\venv\Scripts\activate
uvicorn services.mcp_runtime.main:app --reload --port 8000

# Terminal 2: Start frontend
cd dex/web
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📱 Channel Setup

### Discord Bot

1. Create a bot at [Discord Developer Portal](https://discord.com/developers/applications)
2. Enable MESSAGE CONTENT intent
3. Add token to `.env`
4. Run: `cd services/channels/discord && npm install && npm start`

### Telegram Bot

1. Create a bot via [@BotFather](https://t.me/BotFather)
2. Add token to `.env`
3. Run: `cd services/channels/telegram && npm install && npm start`

### WhatsApp

1. Run: `cd services/channels/whatsapp && npm install && npm start`
2. Scan the QR code with WhatsApp

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/v1/process` | POST | Process message (REST) |
| `/ws/{conversation_id}` | WS | WebSocket connection |

## 📁 Project Structure

```
dex/
├── services/
│   ├── mcp_runtime/      # FastAPI backend
│   │   ├── main.py       # App entrypoint
│   │   ├── orchestrator.py
│   │   ├── llm.py        # Gemini client
│   │   ├── gateway.py    # WebSocket server
│   │   └── session.py    # Session management
│   ├── channels/         # Channel adapters
│   │   ├── discord/
│   │   ├── telegram/
│   │   └── whatsapp/
│   ├── prompt_registry/  # Prompt management
│   └── tools/            # Tool definitions
├── web/                  # Next.js frontend
│   ├── app/
│   ├── components/
│   └── lib/
├── k8s/                  # Kubernetes manifests
└── scripts/              # Utility scripts
```

## 🔧 Development

### Run Tests

```bash
# Backend
pytest services/

# Frontend
cd web && npm test
```

### Build for Production

```bash
# Backend Docker
docker build -t dex-runtime -f services/mcp_runtime/Dockerfile .

# Frontend Docker
docker build -t dex-web -f web/Dockerfile .
```

## 📊 Observability

Traces are automatically logged to [Opik](https://www.comet.com/opik). View them at your Opik dashboard.

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

Built with ❤️ and Gemini
