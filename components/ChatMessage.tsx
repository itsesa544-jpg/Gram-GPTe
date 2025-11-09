import React from 'react';

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

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { role, parts } = message;
  const isUser = role === 'user';

  const containerClasses = isUser ? 'flex justify-end' : 'flex justify-start';
  const bubbleClasses = isUser
    ? 'bg-green-500 text-white rounded-2xl rounded-br-none'
    : 'bg-white border border-slate-200/80 text-slate-800 rounded-2xl rounded-bl-none';

  return (
    <div className={containerClasses}>
      <div className={`p-4 max-w-[85%] sm:max-w-[80%] shadow-sm ${bubbleClasses}`}>
        <div className="flex flex-col space-y-2">
          {parts.map((part, index) => (
            <div key={index}>
              {part.inlineData && (
                <img
                  src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`}
                  alt="user upload"
                  className="rounded-lg max-w-full h-auto"
                />
              )}
              {part.text && <p className="whitespace-pre-wrap">{part.text}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
