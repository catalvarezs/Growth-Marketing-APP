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
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-white flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 tracking-tight text-sm">
          <Sparkles className="w-4 h-4 text-black" />
          Growth Assistant
        </h3>
        <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded text-[10px] border border-gray-100 uppercase tracking-wider font-semibold text-gray-500">
           AI Powered
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin bg-white">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-4 border border-gray-100">
                <BarChart2 className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">Start your analysis</p>
            <p className="text-xs mt-1 text-gray-500">"What is the CAC?" or "Show me revenue trends"</p>
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
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border ${
                  msg.role === 'user' ? 'bg-black border-black text-white' : 'bg-white border-gray-200 text-gray-600'
                }`}
              >
                {msg.role === 'user' ? <User size={12} /> : <Bot size={14} />}
              </div>
              
              <div
                className={`max-w-[90%] md:max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-800 border border-gray-100'
                }`}
              >
                {msg.role === 'model' ? (
                  <>
                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-strong:text-gray-900 prose-a:text-black prose-a:underline">
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
            <div className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0">
              <Bot size={14} />
            </div>
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-100">
               <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100">
        <div className="relative flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all text-sm placeholder:text-gray-400 text-gray-900"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-1.5 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
};