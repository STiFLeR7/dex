import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, X, File, Image } from 'lucide-react';

interface InputAreaProps {
  onSendMessage: (text: string, files?: File[]) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((input.trim() || attachedFiles.length > 0) && !isLoading) {
      onSendMessage(input, attachedFiles.length > 0 ? attachedFiles : undefined);
      setInput('');
      setAttachedFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setAttachedFiles(prev => [...prev, ...Array.from(files)]);
    }
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image size={14} />;
    return <File size={14} />;
  };

  return (
    <div className="w-full max-w-[768px] mx-auto px-4 pb-6 pt-2">
      {/* Attached Files Preview */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-dex-surface px-3 py-2 rounded-lg border border-[#333] text-sm"
            >
              {getFileIcon(file)}
              <span className="text-dex-text max-w-[150px] truncate">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="text-dex-muted hover:text-red-400 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="relative flex items-end bg-[#262626] rounded-[24px] p-2 shadow-2xl border border-[#333] focus-within:border-dex-accent/50 transition-colors">

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          className="hidden"
        />

        {/* Left Actions */}
        <div className="flex items-center gap-1 mb-1 ml-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-dex-muted hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Attach file"
          >
            <Paperclip size={20} />
          </button>
          <button className="p-2 text-dex-muted hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Voice input">
            <Mic size={20} />
          </button>
        </div>

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Dex..."
          rows={1}
          className="flex-1 bg-transparent text-dex-text placeholder-dex-muted/70 px-3 py-3 max-h-[120px] resize-none focus:outline-none text-[15px]"
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
          className={`
            p-2.5 rounded-full mb-1 mr-1 transition-all duration-200
            ${(input.trim() || attachedFiles.length > 0) && !isLoading
              ? 'bg-dex-accent text-black hover:scale-105 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
              : 'bg-[#333] text-dex-muted cursor-not-allowed'}
          `}
        >
          <Send size={18} fill={(input.trim() || attachedFiles.length > 0) ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="text-center mt-2">
        <p className="text-[10px] text-dex-muted opacity-50">Dex remembers context across web and WhatsApp.</p>
      </div>
    </div>
  );
};

export default InputArea;