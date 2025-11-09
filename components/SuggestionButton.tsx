
import React from 'react';

interface SuggestionButtonProps {
  text: string;
  onClick: () => void;
}

export const SuggestionButton: React.FC<SuggestionButtonProps> = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white border border-slate-200/80 rounded-xl p-4 text-left shadow-sm hover:bg-slate-100/70 hover:border-slate-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
    >
      <span className="text-slate-700 font-medium">{text}</span>
    </button>
  );
};
