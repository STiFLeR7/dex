import React, { useState, useEffect, useRef } from 'react';
import { Menu, PanelRight } from 'lucide-react';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import WelcomeScreen from './components/WelcomeScreen';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import { sendMessageToDex, resetConversation } from './services/api';
import { Message, Sender, Conversation } from './types';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn] = useState(true); // For demo, user is logged in

  // Layout state
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dex-conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed.map((c: any) => ({
          ...c,
          timestamp: new Date(c.timestamp)
        })));
      } catch (e) { }
    }
  }, []);

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('dex-conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  const handleSendMessage = async (text: string, files?: File[]) => {
    const newUserMessage: Message = {
      id: Date.now().toString(),
      sender: Sender.User,
      text,
      timestamp: new Date(),
      attachments: files?.map(f => ({ name: f.name, type: f.type }))
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    // Detecting context triggers for visual feedback
    let responseContext: Message['context'] = undefined;
    const lowerText = text.toLowerCase();

    if (lowerText.includes('remember') || lowerText.includes('note') || lowerText.includes('save')) {
      responseContext = { type: 'note_saved', content: 'Saved to your notes' };
    } else if (lowerText.includes('remind')) {
      responseContext = { type: 'reminder', content: "I'll remind you via WhatsApp" };
    } else if (lowerText.includes('what do you know') || lowerText.includes('recall')) {
      responseContext = { type: 'memory', content: 'From our previous conversations...' };
    }

    try {
      const aiResponseText = await sendMessageToDex(text, files);

      const newAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: Sender.Dex,
        text: aiResponseText,
        timestamp: new Date(),
        context: responseContext
      };

      setMessages(prev => [...prev, newAiMessage]);

      // Update conversation history
      const title = text.slice(0, 40) + (text.length > 40 ? '...' : '');
      const existingConv = conversations.find(c => c.id === 'current');
      if (existingConv) {
        setConversations(prev => prev.map(c =>
          c.id === 'current' ? { ...c, lastMessage: text, timestamp: new Date() } : c
        ));
      } else if (messages.length === 0) {
        setConversations(prev => [{
          id: 'current',
          title,
          lastMessage: text,
          timestamp: new Date(),
          isSyncedWhatsApp: false
        }, ...prev]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: Sender.Dex,
        text: "I'm having trouble connecting. Please ensure the backend is running on port 8000.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const startNewChat = () => {
    // Save current conversation before starting new
    if (messages.length > 0 && conversations.length > 0) {
      const current = conversations.find(c => c.id === 'current');
      if (current) {
        setConversations(prev => prev.map(c =>
          c.id === 'current' ? { ...c, id: Date.now().toString() } : c
        ));
      }
    }
    setMessages([]);
    resetConversation();
    setIsLeftSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-dex-bg overflow-hidden text-dex-text font-sans">

      {/* Left Sidebar */}
      <LeftSidebar
        isOpen={isLeftSidebarOpen}
        onCloseMobile={() => setIsLeftSidebarOpen(false)}
        onNewChat={startNewChat}
        conversations={conversations}
        isLoggedIn={isLoggedIn}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative min-w-0">

        {/* Mobile/Tablet Header */}
        <header className="h-14 border-b border-[#262626] flex items-center justify-between px-4 md:hidden bg-dex-bg/80 backdrop-blur z-30 sticky top-0">
          <button onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} className="text-dex-muted">
            <Menu size={24} />
          </button>
          <span className="font-bold text-lg">Dex</span>
          <button onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} className="text-dex-muted">
            <PanelRight size={24} />
          </button>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex h-14 border-b border-[#262626] items-center justify-between px-6 bg-dex-bg/80 backdrop-blur z-30 sticky top-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
              className="text-dex-muted hover:text-white transition-colors lg:hidden"
            >
              <Menu size={20} />
            </button>
            <span className="font-bold text-xl">Dex</span>
            <span className="text-xs text-dex-muted bg-dex-surface px-2 py-0.5 rounded">Personal Assistant</span>
          </div>
          <button
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            className="text-dex-muted hover:text-white transition-colors"
          >
            <PanelRight size={20} />
          </button>
        </header>

        {/* Chat Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 pt-6 group">
          <div className="max-w-[768px] mx-auto min-h-full flex flex-col">
            {messages.length === 0 ? (
              <WelcomeScreen onQuickAction={handleSendMessage} />
            ) : (
              <>
                <div className="flex-1">
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                  {isLoading && (
                    <div className="flex items-center gap-2 mb-8 ml-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center text-black text-xs font-bold animate-pulse">D</div>
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-dex-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-dex-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-dex-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input Area (Sticky) */}
        <div className="bg-gradient-to-t from-dex-bg via-dex-bg to-transparent pb-4 pt-2 z-20">
          <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </main>

      {/* Right Sidebar (Quick Panel) */}
      <div className={`${isRightPanelOpen ? 'hidden lg:block' : 'hidden'} lg:relative fixed inset-0 z-50 lg:z-auto`}>
        <RightSidebar isOpen={isRightPanelOpen} onClose={() => setIsRightPanelOpen(false)} isLoggedIn={isLoggedIn} />
      </div>

      {/* Overlay for mobile right sidebar */}
      {isRightPanelOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsRightPanelOpen(false)}
        />
      )}
      {/* Overlay for mobile left sidebar */}
      {isLeftSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsLeftSidebarOpen(false)}
        />
      )}

    </div>
  );
};

export default App;