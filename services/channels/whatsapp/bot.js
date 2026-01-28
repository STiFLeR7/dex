import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import dotenv from 'dotenv';

dotenv.config({ path: '../../../.env' });

const DEX_API_URL = process.env.DEX_API_URL || 'http://localhost:8000';

// Store for conversation contexts per chat
const conversationIds = new Map();

// Generate unique ID
function generateId() {
    return `whatsapp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
            type: 'whatsapp',
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

async function startWhatsAppBot() {
    // Auth state
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

    // Get latest version
    const { version } = await fetchLatestBaileysVersion();

    // Create socket
    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
    });

    // Connection update handler
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // Display QR code
        if (qr) {
            console.log('\n📱 Scan this QR code with WhatsApp:\n');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

            console.log('Connection closed. Reconnecting:', shouldReconnect);

            if (shouldReconnect) {
                startWhatsAppBot();
            }
        } else if (connection === 'open') {
            console.log('\n✅ WhatsApp bot connected!');
            console.log(`📡 Connected to Dex API at ${DEX_API_URL}`);
        }
    });

    // Save credentials on update
    sock.ev.on('creds.update', saveCreds);

    // Message handler
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
            // Skip messages from self or without content
            if (msg.key.fromMe) continue;
            if (!msg.message) continue;

            // Get message text
            const messageText =
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                '';

            if (!messageText) continue;

            const chatId = msg.key.remoteJid;
            const pushName = msg.pushName || 'User';

            console.log(`📩 Message from ${pushName}: ${messageText}`);

            // Get or create conversation ID
            if (!conversationIds.has(chatId)) {
                conversationIds.set(chatId, generateId());
            }
            const conversationId = conversationIds.get(chatId);

            // Send typing indicator
            await sock.sendPresenceUpdate('composing', chatId);

            // Get response from Dex
            const response = await sendToDex(messageText, conversationId);

            // Stop typing indicator
            await sock.sendPresenceUpdate('paused', chatId);

            // Send response
            await sock.sendMessage(chatId, { text: response });

            console.log(`📤 Replied to ${pushName}`);
        }
    });
}

// Start the bot
console.log('🚀 Starting WhatsApp bot...');
startWhatsAppBot();
