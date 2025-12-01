import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, BarChart2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';
import { ChartRenderer, ChartConfig } from './ChartRenderer';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isTyping: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isTyping }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    onSendMessage(input);
    setInput('');
  };

  // Function to separate Text from Chart JSON
  const parseMessageContent = (content: string) => {
    const chartRegex = /```json-chart\n([\s\S]*?)\n```/;
    const match = content.match(chartRegex);

    if (match) {
      const textPart = content.replace(match[0], '').trim();
      let chartConfig: ChartConfig | null = null;
      try {
        chartConfig = JSON.parse(match[1]);
      } catch (e) {
        console.error("Failed to parse chart JSON", e);
      }
      return { text: textPart, chart: chartConfig };
    }

    return { text: content, chart: null };
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 tracking-tight">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          AI Analyst
        </h3>
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-medium text-slate-500">Gemini 2.5 Flash</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin bg-slate-50/30">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <BarChart2 className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-600">Ask questions about your data to get started.</p>
            <p className="text-xs mt-2 text-slate-400">"Calculate ROAS by Campaign"<br/>"What is the CAC?"</p>
          </div>
        )}
        
        {messages.map((msg) => {
          const { text, chart } = msg.role === 'model' ? parseMessageContent(msg.content) : { text: msg.content, chart: null };

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                  msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-indigo-600 text-white'
                }`}
              >
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              
              <div
                className={`max-w-[90%] md:max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                }`}
              >
                {msg.role === 'model' ? (
                  <>
                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-strong:text-slate-900 prose-a:text-indigo-600">
                       <ReactMarkdown>{text}</ReactMarkdown>
                    </div>
                    {chart && <ChartRenderer config={chart} />}
                  </>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Bot size={14} />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-4 shadow-sm">
               <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about CAC, ROAS, trends..."
            className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all text-sm font-medium placeholder:text-slate-400 text-slate-700"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};