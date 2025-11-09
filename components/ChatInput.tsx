import React, { useState, useRef } from 'react';
import { PaperclipIcon, SendIcon } from './icons';

interface ChatInputProps {
  onSend: (message: string, file: File | null) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
     if (event.target) {
      event.target.value = '';
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading || (!message.trim() && !file)) return;
    onSend(message, file);
    setMessage('');
    setFile(null);
  };
  
  const handleRemoveFile = () => {
      setFile(null);
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-slate-50/80 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto p-2 sm:p-4">
       {file && (
          <div className="bg-slate-200/70 p-2 mx-1 mb-2 rounded-lg flex items-center justify-between text-sm text-slate-700">
            <div className="flex items-center space-x-2 truncate">
              <PaperclipIcon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate font-medium">{file.name}</span>
            </div>
            <button 
              onClick={handleRemoveFile} 
              className="ml-2 text-slate-500 hover:text-slate-800 p-1 rounded-full hover:bg-slate-300/50"
              aria-label="Remove file"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <div className="relative flex-grow flex items-center">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
              placeholder="এখানে আপনার প্রশ্ন লিখুন বা ছবি যোগ করুন..."
              className="w-full h-14 pl-4 pr-12 py-4 text-md bg-white border border-slate-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              rows={1}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={handleFileClick}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-green-600 transition-colors disabled:opacity-50"
              aria-label="Attach file"
              disabled={isLoading}
            >
              <PaperclipIcon className="w-6 h-6" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || (!message.trim() && !file)}
            className="w-12 h-12 flex-shrink-0 bg-slate-400 text-white rounded-full flex items-center justify-center transition-colors duration-200 disabled:bg-slate-300 disabled:cursor-not-allowed enabled:hover:bg-green-600 enabled:focus:outline-none enabled:focus:ring-2 enabled:focus:ring-green-500 enabled:focus:ring-offset-2"
            aria-label="Send message"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </footer>
  );
};
