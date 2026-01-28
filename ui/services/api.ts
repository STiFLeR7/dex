import { Message, Sender } from "../types";

const API_BASE = "http://localhost:8000";

interface MCPContext {
    context_id: string;
    assistant: {
        name: string;
        persona_version: string;
    };
    session: {
        type: string;
        conversation_id: string;
    };
    user_input: {
        message: string;
        attachments?: { type: string; url: string }[];
    };
    prompt: {
        id: string;
        version: string;
    };
    tools_available: string[];
}

interface APIResponse {
    context_id: string;
    response: string;
    trace_id: string;
    session_id?: string;
}

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Store conversation ID for session persistence
let currentConversationId = generateId();

export const resetConversation = () => {
    currentConversationId = generateId();
};

export const getConversationId = () => currentConversationId;

export const sendMessageToDex = async (
    text: string,
    attachments?: File[]
): Promise<string> => {
    try {
        // Handle file uploads if any
        let attachmentUrls: { type: string; url: string }[] = [];
        if (attachments && attachments.length > 0) {
            // For now, we'll just note the files - actual upload would go to a file server
            attachmentUrls = attachments.map(f => ({
                type: f.type,
                url: f.name // Placeholder - would be actual URL after upload
            }));
        }

        const context: MCPContext = {
            context_id: generateId(),
            assistant: {
                name: "Dex",
                persona_version: "2.0.0"
            },
            session: {
                type: "web",
                conversation_id: currentConversationId
            },
            user_input: {
                message: text,
                attachments: attachmentUrls.length > 0 ? attachmentUrls : undefined
            },
            prompt: {
                id: "dex-core",
                version: "2.0.0"
            },
            tools_available: ["echo", "calculator", "reminder", "note"]
        };

        const response = await fetch(`${API_BASE}/v1/process`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(context)
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data: APIResponse = await response.json();
        return data.response;
    } catch (error) {
        console.error("Dex API Error:", error);
        return "I'm having trouble connecting right now. Please check if the backend is running.";
    }
};

// Check WhatsApp connection status
export const checkWhatsAppStatus = async (): Promise<{ connected: boolean; phone?: string }> => {
    try {
        const response = await fetch(`${API_BASE}/v1/whatsapp/status`);
        if (response.ok) {
            return await response.json();
        }
        return { connected: false };
    } catch {
        return { connected: false };
    }
};

// Get reminders
export const getReminders = async (): Promise<any[]> => {
    try {
        const response = await fetch(`${API_BASE}/v1/reminders`);
        if (response.ok) {
            return await response.json();
        }
        return [];
    } catch {
        return [];
    }
};

// Get notes
export const getNotes = async (): Promise<any[]> => {
    try {
        const response = await fetch(`${API_BASE}/v1/notes`);
        if (response.ok) {
            return await response.json();
        }
        return [];
    } catch {
        return [];
    }
};

// Upload file
export const uploadFile = async (file: File): Promise<string | null> => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_BASE}/v1/upload`, {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            return data.url;
        }
        return null;
    } catch {
        return null;
    }
};
