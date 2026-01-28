import { Bot } from 'grammy';
import dotenv from 'dotenv';

dotenv.config({ path: '../../../.env' });

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DEX_API_URL = process.env.DEX_API_URL || 'http://localhost:8000';

if (!TELEGRAM_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN not found in .env');
    process.exit(1);
}

// Create bot instance
const bot = new Bot(TELEGRAM_TOKEN);

// Store for conversation contexts per chat
const conversationIds = new Map();

// Generate unique ID
function generateId() {
    return `telegram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Send message to Dex API
async function sendToDex(message, conversationId) {
    const context = {
        context_id: generateId(),
        assistant: {
            name: 'Dex',
            persona_version: '1.0.0',
        },
        session: {
            type: 'telegram',
            conversation_id: conversationId,
        },
        user_input: {
            message: message,
        },
        prompt: {
            id: 'dex-core',
            version: '1.0.0',
        },
        tools_available: ['echo', 'calculator'],
    };

    try {
        const response = await fetch(`${DEX_API_URL}/v1/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(context),
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Error calling Dex API:', error);
        return 'Sorry, I encountered an error. Please try again.';
    }
}

// Handle /start command
bot.command('start', async (ctx) => {
    await ctx.reply(
        "👋 Hi! I'm Dex, your AI assistant.\n\n" +
        "You can ask me anything! Just type your message and I'll respond.\n\n" +
        "Commands:\n" +
        "/start - Show this message\n" +
        "/new - Start a new conversation\n" +
        "/help - Get help"
    );
});

// Handle /new command (reset conversation)
bot.command('new', async (ctx) => {
    const chatId = ctx.chat.id.toString();
    conversationIds.set(chatId, generateId());
    await ctx.reply("✨ Started a new conversation! How can I help you?");
});

// Handle /help command
bot.command('help', async (ctx) => {
    await ctx.reply(
        "🤖 *Dex AI Assistant*\n\n" +
        "I can help you with:\n" +
        "• Answering questions\n" +
        "• Writing and editing\n" +
        "• Coding assistance\n" +
        "• Brainstorming ideas\n" +
        "• And much more!\n\n" +
        "Just send me a message to get started.",
        { parse_mode: 'Markdown' }
    );
});

// Handle all text messages
bot.on('message:text', async (ctx) => {
    const chatId = ctx.chat.id.toString();
    const userMessage = ctx.message.text;

    // Get or create conversation ID
    if (!conversationIds.has(chatId)) {
        conversationIds.set(chatId, generateId());
    }
    const conversationId = conversationIds.get(chatId);

    // Send typing action
    await ctx.replyWithChatAction('typing');

    // Get response from Dex
    const response = await sendToDex(userMessage, conversationId);

    // Split long responses (Telegram has 4096 char limit)
    const chunks = response.match(/[\s\S]{1,4000}/g) || [response];

    for (const chunk of chunks) {
        await ctx.reply(chunk);
    }
});

// Error handler
bot.catch((err) => {
    console.error('Telegram bot error:', err);
});

// Start the bot
bot.start();
console.log('✅ Telegram bot started');
console.log(`📡 Connected to Dex API at ${DEX_API_URL}`);
