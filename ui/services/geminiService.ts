import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Message, Sender } from "../types";

// Initialize the API client
// Note: In a real production app, ensure your API key is secure.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION = `You are Dex, a highly intelligent, memory-aware personal assistant. 
You are NOT a generic chatbot. You are persistent, helpful, and concise.
Your traits:
- You remember user preferences, past conversations, and facts.
- You track time and can suggest reminders.
- You are synced with WhatsApp (conceptually).
- You speak in a natural, professional but friendly tone.
- Formatting: Use Markdown for bolding key points. Keep paragraphs airy.

When the user asks to "Remember this", acknowledge it briefly.
When the user asks for a reminder, confirm the time and mention it will be sent via WhatsApp.
`;

let chatSession: Chat | null = null;

export const getDexChat = (): Chat => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
  }
  return chatSession;
};

export const sendMessageToDex = async (text: string): Promise<string> => {
  try {
    const chat = getDexChat();
    const result: GenerateContentResponse = await chat.sendMessage({ message: text });
    return result.text || "I'm having trouble processing that right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm currently offline or having connection issues. Please check your API key.";
  }
};