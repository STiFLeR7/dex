export enum Sender {
  User = 'User',
  Dex = 'Dex',
}

export interface MessageContext {
  type: 'memory' | 'reminder' | 'note_saved';
  content: string;
}

export interface MessageAttachment {
  name: string;
  type: string;
  url?: string;
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: Date;
  context?: MessageContext;
  attachments?: MessageAttachment[];
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  isSyncedWhatsApp: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  date: string;
}

export interface Reminder {
  id: string;
  text: string;
  dueTime: string;
  platform: 'WhatsApp' | 'System';
}