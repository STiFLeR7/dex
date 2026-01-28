import React from 'react';
import { Copy, Pin, Clock, Paperclip } from 'lucide-react';
import { Message, Sender } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === Sender.User;

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`
          w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-lg mt-1
          ${isUser ? 'bg-zinc-700 text-zinc-300' : 'bg-gradient-to-br from-green-600 to-green-400 text-black'}
        `}>
          {isUser ? 'U' : 'D'}
        </div>

        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          
          {/* Context Context Header (Dex only) */}
          {!isUser && message.context && (
             <div className="flex items-center gap-1.5 text-xs text-dex-accent mb-1.5 ml-1 bg-dex-surface/50 px-2 py-1 rounded w-fit">
                {message.context.type === 'memory' && <Paperclip size={10} />}
                {message.context.type === 'reminder' && <Clock size={10} />}
                {message.context.type === 'note_saved' && <Pin size={10} />}
                <span>{message.context.content}</span>
             </div>
          )}

          {/* Message Content */}
          <div className={`
            px-5 py-3 rounded-2xl text-[15px] leading-[1.75] shadow-sm
            ${isUser 
              ? 'bg-dex-surface text-dex-text rounded-tr-sm' 
              : 'bg-transparent text-[#e5e5e5] border border-[#262626] rounded-tl-sm'
            }
          `}>
             {message.text.split('\n').map((line, i) => (
               <p key={i} className="mb-1 last:mb-0">{line}</p>
             ))}
          </div>

          {/* Action Footer (Dex only) */}
          {!isUser && (
            <div className="flex items-center gap-3 mt-2 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
               <span className="text-[10px] text-dex-muted">{message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
               <button className="text-dex-muted hover:text-white transition-colors" title="Copy">
                  <Copy size={12} />
               </button>
               <button className="text-dex-muted hover:text-dex-accent transition-colors flex items-center gap-1" title="Remember this">
                  <Pin size={12} />
                  <span className="text-[10px]">Remember</span>
               </button>
            </div>
          )}

          {/* Timestamp for User */}
          {isUser && (
             <span className="text-[10px] text-dex-muted mt-1 mr-1">{message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;