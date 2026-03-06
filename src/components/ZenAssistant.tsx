import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion } from 'motion/react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const ZenAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMsg,
        config: {
          systemInstruction: "你是一位智慧、慈悲且平和的禅修导师。你的回答应当充满禅意，简洁而深刻。你可以解释佛经、提供冥想建议、或者在用户感到焦虑时给予安慰。使用温暖、自然的语气。如果用户问及念经，你可以鼓励他们保持正念。",
        },
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.text || '禅师正在冥想，请稍后再试。' }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: '缘分未到，请稍后再试。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-3xl shadow-sm border border-zen-accent/10 overflow-hidden">
      <div className="p-4 border-bottom border-zen-accent/5 bg-zen-bg/50 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-zen-accent" />
        <h3 className="text-sm font-semibold uppercase tracking-wider">禅修指引</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-10 text-zen-accent/40 italic text-sm">
            “心如止水，鉴常明。”<br/>有什么困惑想与禅师聊聊吗？
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-zen-accent text-white' 
                : 'bg-zen-bg text-zen-ink border border-zen-accent/5'
            }`}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zen-bg p-3 rounded-2xl border border-zen-accent/5">
              <Loader2 className="w-4 h-4 animate-spin text-zen-accent" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zen-accent/5 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="向禅师请教..."
          className="flex-1 bg-zen-bg border-none rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-zen-accent outline-none"
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="bg-zen-accent text-white p-2 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
