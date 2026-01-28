import React from 'react';
import { Plus, Search, MessageSquare, Settings, User, LogIn } from 'lucide-react';
import { Conversation } from '../types';

interface LeftSidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
  onNewChat: () => void;
  conversations?: Conversation[];
  isLoggedIn?: boolean;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  isOpen,
  onCloseMobile,
  onNewChat,
  conversations = [],
  isLoggedIn = true
}) => {
  // Group conversations by date
  const today: Conversation[] = [];
  const yesterday: Conversation[] = [];
  const older: Conversation[] = [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);

  conversations.forEach(conv => {
    const convDate = new Date(conv.timestamp);
    if (convDate >= todayStart) {
      today.push(conv);
    } else if (convDate >= yesterdayStart) {
      yesterday.push(conv);
    } else {
      older.push(conv);
    }
  });

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-[280px] bg-dex-sidebar border-r border-[#262626] transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      md:relative md:translate-x-0 flex flex-col
    `}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="font-bold text-2xl tracking-tighter text-white flex items-center gap-1">
            <span className="text-dex-text">Dex</span>
          </div>
        </div>

        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 bg-dex-surface hover:bg-[#333] text-dex-text p-3 rounded-lg border border-[#333] transition-colors group mb-4"
        >
          <div className="w-6 h-6 rounded-full bg-dex-accent/20 flex items-center justify-center text-dex-accent group-hover:bg-dex-accent group-hover:text-black transition-colors">
            <Plus size={16} />
          </div>
          <span className="font-medium text-sm">New Chat</span>
        </button>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-dex-muted" size={16} />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full bg-[#141414] text-dex-text text-sm rounded-lg pl-9 pr-3 py-2 border border-transparent focus:border-dex-accent/50 focus:outline-none placeholder-zinc-600"
          />
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-6">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <MessageSquare size={32} className="text-dex-muted/30 mb-3" />
            <p className="text-dex-muted text-sm">No conversations yet</p>
            <p className="text-dex-muted/60 text-xs mt-1">Start a new chat to begin</p>
          </div>
        ) : (
          <>
            {today.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-dex-muted uppercase tracking-wider px-4 mb-2">Today</h3>
                {today.map(chat => (
                  <HistoryItem key={chat.id} chat={chat} />
                ))}
              </div>
            )}

            {yesterday.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-dex-muted uppercase tracking-wider px-4 mb-2">Yesterday</h3>
                {yesterday.map(chat => (
                  <HistoryItem key={chat.id} chat={chat} />
                ))}
              </div>
            )}

            {older.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-dex-muted uppercase tracking-wider px-4 mb-2">Previous 30 Days</h3>
                {older.map(chat => (
                  <HistoryItem key={chat.id} chat={chat} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer / Profile */}
      <div className="p-4 border-t border-[#262626]">
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-dex-surface cursor-pointer transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-dex-accent to-green-600 flex items-center justify-center text-black font-bold text-sm">
              S
            </div>
            <div>
              <div className="text-sm font-medium text-dex-text">STIFLER</div>
              <div className="text-xs text-dex-muted">Pro Plan</div>
            </div>
          </div>
          <Settings size={16} className="text-dex-muted group-hover:text-dex-text" />
        </div>
      </div>
    </aside>
  );
};

const HistoryItem: React.FC<{ chat: Conversation }> = ({ chat }) => (
  <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-dex-surface/50 group transition-colors relative">
    <div className="flex justify-between items-start mb-1">
      <span className="text-sm font-medium text-dex-text truncate pr-4">{chat.title}</span>
      {chat.isSyncedWhatsApp && (
        <span className="text-[10px] bg-green-900/30 text-green-500 px-1.5 py-0.5 rounded border border-green-900/50">WA</span>
      )}
    </div>
    <div className="text-xs text-dex-muted truncate">{chat.lastMessage}</div>
  </button>
);

export default LeftSidebar;