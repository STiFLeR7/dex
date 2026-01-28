import React, { useState, useEffect } from 'react';
import { Pin, Clock, Calendar, X, Link as LinkIcon, Smartphone, RefreshCw, Check, AlertCircle, QrCode, ExternalLink } from 'lucide-react';
import { Note, Reminder } from '../types';
import { checkWhatsAppStatus, getNotes, getReminders } from '../services/api';

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn?: boolean;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ isOpen, onClose, isLoggedIn = false }) => {
  const [whatsappStatus, setWhatsappStatus] = useState<{ connected: boolean; phone?: string }>({ connected: false });
  const [telegramStatus, setTelegramStatus] = useState<{ connected: boolean }>({ connected: false });
  const [notes, setNotes] = useState<Note[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWhatsAppConnect, setShowWhatsAppConnect] = useState(false);
  const [showTelegramConnect, setShowTelegramConnect] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data on mount
  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [waStatus, notesData, remindersData] = await Promise.all([
        checkWhatsAppStatus(),
        getNotes(),
        getReminders()
      ]);
      setWhatsappStatus(waStatus);
      setNotes(notesData);
      setReminders(remindersData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
    setIsRefreshing(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDay = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  return (
    <aside className={`
      fixed inset-y-0 right-0 z-40 w-[300px] bg-[#141414] border-l border-[#262626] transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      lg:relative lg:translate-x-0 lg:block flex flex-col shadow-2xl lg:shadow-none
    `}>
      <div className="p-4 border-b border-[#262626] flex items-center justify-between">
        <h2 className="font-semibold text-dex-text">Quick Access</h2>
        <div className="flex items-center gap-2">
          {isLoggedIn && (
            <button
              onClick={fetchData}
              className={`text-dex-muted hover:text-white transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          )}
          <button onClick={onClose} className="lg:hidden text-dex-muted hover:text-white">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {/* Today's Context - Always visible */}
        <div className="bg-dex-surface/30 rounded-xl p-4 border border-[#262626]">
          <div className="flex items-center gap-2 mb-3 text-dex-accent">
            <Calendar size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Today's Context</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{formatDate(currentTime)}</div>
          <div className="text-sm text-dex-muted mb-3">{formatDay(currentTime)} • {formatTime(currentTime)}</div>
          {isLoggedIn && (
            <>
              <div className="h-px bg-[#333] mb-3"></div>
              <div className="text-xs text-dex-muted space-y-2">
                <p>• {reminders.length} reminders upcoming</p>
                <p>• {notes.length} notes saved</p>
              </div>
            </>
          )}
        </div>

        {/* Memory & Notes - Only when logged in */}
        {isLoggedIn ? (
          <>
            <div>
              <div className="flex items-center gap-2 mb-3 text-dex-muted px-1">
                <Pin size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">Memory & Notes</span>
              </div>
              {notes.length === 0 ? (
                <div className="text-center py-6 text-dex-muted/60 text-xs">
                  No notes saved yet
                </div>
              ) : (
                <div className="space-y-2">
                  {notes.map(note => (
                    <div key={note.id} className="bg-dex-surface p-3 rounded-lg border border-[#262626] hover:border-dex-accent/30 transition-colors group cursor-pointer">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-medium text-dex-text">{note.title}</h4>
                        <Pin size={12} className="text-dex-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs text-dex-muted font-mono bg-black/30 p-1.5 rounded mt-1">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3 text-dex-muted px-1">
                <Clock size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">Upcoming Reminders</span>
              </div>
              {reminders.length === 0 ? (
                <div className="text-center py-6 text-dex-muted/60 text-xs">
                  No reminders set
                </div>
              ) : (
                <div className="space-y-2">
                  {reminders.map(reminder => (
                    <div key={reminder.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-dex-surface/50 transition-colors">
                      <div className={`mt-0.5 w-4 h-4 rounded-full border-2 ${reminder.platform === 'WhatsApp' ? 'border-green-500' : 'border-gray-500'} flex items-center justify-center`}>
                        {reminder.platform === 'WhatsApp' && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                      </div>
                      <div>
                        <p className="text-sm text-dex-text">{reminder.text}</p>
                        <p className="text-xs text-dex-accent mt-0.5">{reminder.dueTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8 px-4">
            <div className="w-12 h-12 rounded-full bg-dex-surface mx-auto mb-4 flex items-center justify-center">
              <Pin size={20} className="text-dex-muted" />
            </div>
            <p className="text-dex-muted text-sm mb-2">Login to access</p>
            <p className="text-dex-muted/60 text-xs">Notes, reminders, and synced data</p>
          </div>
        )}

        {/* Integrations - Connect Options */}
        <div className="pt-4 border-t border-[#262626]">
          <div className="flex items-center gap-2 mb-3 text-dex-muted px-1">
            <LinkIcon size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Connect Channels</span>
          </div>
          <div className="flex flex-col gap-2">
            {/* WhatsApp */}
            {whatsappStatus.connected ? (
              <div className="bg-[#075e54]/20 text-[#25D366] border-[#25D366]/30 px-3 py-2 rounded-lg text-xs font-medium border flex items-center gap-2">
                <Check size={14} />
                <span>WhatsApp Connected</span>
                {whatsappStatus.phone && <span className="text-dex-muted ml-auto">{whatsappStatus.phone}</span>}
              </div>
            ) : (
              <button
                onClick={() => setShowWhatsAppConnect(!showWhatsAppConnect)}
                className="bg-dex-surface hover:bg-[#333] text-dex-text px-3 py-2 rounded-lg text-xs font-medium border border-[#333] flex items-center gap-2 transition-colors"
              >
                <Smartphone size={14} className="text-[#25D366]" />
                <span>Connect WhatsApp</span>
                <ExternalLink size={12} className="ml-auto text-dex-muted" />
              </button>
            )}

            {showWhatsAppConnect && !whatsappStatus.connected && (
              <div className="bg-dex-surface p-4 rounded-lg border border-[#333] text-center">
                <QrCode size={32} className="mx-auto text-dex-muted mb-3" />
                <p className="text-xs text-dex-muted mb-2">Run the WhatsApp bot to connect:</p>
                <code className="text-[10px] bg-black/50 px-2 py-1 rounded text-dex-accent block">
                  cd services/channels/whatsapp && npm start
                </code>
                <p className="text-[10px] text-dex-muted mt-2">Scan QR code when prompted</p>
              </div>
            )}

            {/* Telegram */}
            {telegramStatus.connected ? (
              <div className="bg-[#0088cc]/20 text-[#0088cc] px-3 py-2 rounded-lg text-xs font-medium border border-[#0088cc]/30 flex items-center gap-2">
                <Check size={14} />
                <span>Telegram Connected</span>
              </div>
            ) : (
              <button
                onClick={() => setShowTelegramConnect(!showTelegramConnect)}
                className="bg-dex-surface hover:bg-[#333] text-dex-text px-3 py-2 rounded-lg text-xs font-medium border border-[#333] flex items-center gap-2 transition-colors"
              >
                <Smartphone size={14} className="text-[#0088cc]" />
                <span>Connect Telegram</span>
                <ExternalLink size={12} className="ml-auto text-dex-muted" />
              </button>
            )}

            {showTelegramConnect && !telegramStatus.connected && (
              <div className="bg-dex-surface p-4 rounded-lg border border-[#333] text-center">
                <p className="text-xs text-dex-muted mb-2">Run the Telegram bot:</p>
                <code className="text-[10px] bg-black/50 px-2 py-1 rounded text-dex-accent block">
                  cd services/channels/telegram && npm start
                </code>
                <p className="text-[10px] text-dex-muted mt-2">Set TELEGRAM_BOT_TOKEN in .env</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;