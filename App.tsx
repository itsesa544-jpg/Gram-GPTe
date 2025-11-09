import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { SuggestionButton } from './components/SuggestionButton';
import { ChatInput } from './components/ChatInput';
import { ChatMessage } from './components/ChatMessage';
import { LogoIcon } from './components/icons';

interface Part {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

interface Message {
  role: 'user' | 'model';
  parts: Part[];
}

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    try {
      if (!process.env.API_KEY) {
        throw new Error("API কী অনুপস্থিত।");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
      });
      setChat(chatSession);
    } catch (e: any) {
      console.error("Initialization Failed:", e);
      setError(e.message || "অ্যাপটি শুরু করা যায়নি। অনুগ্রহ করে পৃষ্ঠাটি রিফ্রেশ করুন।");
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string, file: File | null) => {
    if (isLoading || (!text.trim() && !file) || !chat) return;

    setIsLoading(true);
    setError(null);

    const userParts: Part[] = [];
    if (file) {
      try {
        const filePart = await fileToGenerativePart(file);
        userParts.push(filePart);
      } catch (e) {
        console.error('Error converting file:', e);
        setError('Failed to process the image file.');
        setIsLoading(false);
        return;
      }
    }
    if (text.trim()) {
      userParts.push({ text: text.trim() });
    }

    const newUserMessage: Message = { role: 'user', parts: userParts };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    try {
      const response = await chat.sendMessage({ message: userParts });

      const modelResponseText = response.text;
      const newModelMessage: Message = { role: 'model', parts: [{ text: modelResponseText }] };
      setMessages((prevMessages) => [...prevMessages, newModelMessage]);
    } catch (e) {
      console.error(e);
      setError('দুঃখিত, একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    'আজকের আবহাওয়া কেমন?',
    'গ্রামের একটি সুন্দর গল্প বলো',
    'ধানক্ষেতের একটি ছবি আঁকো',
    'ফসলের রোগ নির্ণয় করতে সাহায্য করো',
  ];

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-600 font-sans">
        <div className="flex flex-col items-center space-y-4">
           <div className="bg-green-500 rounded-full p-4 animate-pulse">
              <LogoIcon className="w-10 h-10 text-white" />
            </div>
          <p className="text-lg font-medium">গ্রামজিপিটি লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }
  
  if (!chat) {
     return (
      <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-600 font-sans p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-red-200 max-w-md w-full">
           <h1 className="text-2xl font-bold text-red-600 mb-4">একটি সমস্যা হয়েছে</h1>
           <p className="text-slate-700">{error || "একটি অজানা ত্রুটি ঘটেছে।"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 flex flex-col h-screen">
      <header className="px-4 pt-4 sticky top-0 bg-slate-50/90 backdrop-blur-sm z-10 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="bg-green-500 rounded-full p-2 w-10 h-10 flex items-center justify-center">
            <LogoIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-700">গ্রামজিপিটি</span>
        </div>
        <div className="w-full h-px bg-slate-200 mt-3"></div>
      </header>

      <main ref={chatHistoryRef} className="flex-grow overflow-y-auto px-4 pt-4 pb-32">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-full">
            <div className="w-full max-w-lg mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-800">গ্রামজিপিটি</h1>
              <p className="text-slate-500 mt-2 mb-8">আপনার গ্রামীণ বন্ধু।</p>
              <div className="space-y-3">
                {suggestions.map((text) => (
                  <SuggestionButton
                    key={text}
                    text={text}
                    onClick={() => handleSendMessage(text, null)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                  <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-none p-4 max-w-[80%]">
                      <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                      </div>
                  </div>
              </div>
            )}
            {error && <p className="text-red-500 text-center py-4">{error}</p>}
          </div>
        )}
      </main>

      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;