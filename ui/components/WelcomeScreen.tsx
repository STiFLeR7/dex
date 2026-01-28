import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onQuickAction: (text: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onQuickAction }) => {
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZoneName: 'short'
      };
      setCurrentDate(now.toLocaleDateString('en-US', options));
    };

    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-fade-in">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-dex-surface to-dex-accent flex items-center justify-center mb-6 shadow-2xl shadow-green-900/20">
        <Sparkles size={40} className="text-white" />
      </div>

      <h1 className="text-3xl font-semibold text-white mb-2">Hey, I'm Dex</h1>
      <p className="text-dex-muted text-lg mb-8 max-w-md">Your memory-aware personal assistant.</p>

      <div className="text-sm font-medium text-dex-accent bg-dex-surface/50 px-4 py-2 rounded-full mb-12 border border-dex-surface">
        {currentDate}
      </div>

      <div className="text-center max-w-md">
        <p className="text-dex-muted text-sm mb-4">
          Start a conversation by typing below. I can help you with:
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-dex-surface rounded-full text-dex-text border border-[#333]">Reminders & Tasks</span>
          <span className="px-3 py-1.5 bg-dex-surface rounded-full text-dex-text border border-[#333]">Notes & Memory</span>
          <span className="px-3 py-1.5 bg-dex-surface rounded-full text-dex-text border border-[#333]">Code & Writing</span>
          <span className="px-3 py-1.5 bg-dex-surface rounded-full text-dex-text border border-[#333]">Brainstorming</span>
        </div>
      </div>

      <div className="mt-12 flex items-center gap-2 text-dex-muted text-sm opacity-60">
        <span>Available on Web, WhatsApp & Telegram</span>
      </div>
    </div>
  );
};

export default WelcomeScreen;