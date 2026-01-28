import { Client, GatewayIntentBits, Events, Partials } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../../../.env' });

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DEX_API_URL = process.env.DEX_API_URL || 'http://localhost:8000';

if (!DISCORD_TOKEN) {
    console.error('DISCORD_BOT_TOKEN not found in .env');
    process.exit(1);
}

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel, Partials.Message],
});

// Store for conversation contexts per channel/DM
const conversationIds = new Map();

// Generate unique ID
function generateId() {
    return `discord-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
            type: 'discord',
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

// Handle messages
client.on(Events.MessageCreate, async (message) => {
    // Ignore bot's own messages
    if (message.author.bot) return;

    // Check if bot is mentioned or it's a DM
    const isMentioned = message.mentions.has(client.user);
    const isDM = !message.guild;

    if (!isMentioned && !isDM) return;

    // Get or create conversation ID for this channel
    const channelKey = isDM ? `dm-${message.author.id}` : message.channel.id;
    if (!conversationIds.has(channelKey)) {
        conversationIds.set(channelKey, generateId());
    }
    const conversationId = conversationIds.get(channelKey);

    // Clean message content (remove mention)
    let content = message.content;
    if (isMentioned) {
        content = content.replace(/<@!?\d+>/g, '').trim();
    }

    if (!content) {
        await message.reply("Hi! I'm Dex. How can I help you?");
        return;
    }

    // Show typing indicator
    await message.channel.sendTyping();

    // Get response from Dex
    const response = await sendToDex(content, conversationId);

    // Split long responses (Discord has 2000 char limit)
    const chunks = response.match(/[\s\S]{1,1900}/g) || [response];

    for (const chunk of chunks) {
        await message.reply(chunk);
    }
});

// Bot ready
client.on(Events.ClientReady, () => {
    console.log(`✅ Discord bot logged in as ${client.user.tag}`);
    console.log(`📡 Connected to Dex API at ${DEX_API_URL}`);
});

// Login
client.login(DISCORD_TOKEN);
