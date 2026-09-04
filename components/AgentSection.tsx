'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  RefreshCw,
  Terminal,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: { name: string; args?: any; result?: any }[];
}

const SAMPLE_QUERIES = [
  { label: 'When is my next class?', category: 'Lookup' },
  { label: 'What classes do I have on Wednesday?', category: 'Lookup' },
  { label: 'What assignments do I have due this week?', category: 'Lookup' },
  { label: 'Show me all high priority announcements.', category: 'Lookup' },
  { label: "I'm free until 2 PM — is there anything on campus I could drop into?", category: 'Reasoning' },
  { label: 'Which labs have a projector and can fit at least 30 people?', category: 'Reasoning' },
  { label: 'Book Room 7A02 tomorrow from 3 PM to 5 PM.', category: 'Action' },
  { label: 'Register me for the Guest Lecture on Deep Learning.', category: 'Action' },
  { label: 'I need a room for 5 people with a projector, tomorrow between 2 and 4.', category: 'Action' },
  { label: 'Just book me any room tomorrow afternoon.', category: 'Ambiguity Test' },
];

export default function AgentSection({ onDataMutated }: { onDataMutated?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I am your **CampusOS AI Assistant**. I read live campus timetables, room bookings, events, notices, and assignment deadlines in real-time.\n\nAsk me anything or click one of the quick test chips below to get started!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to connect to AI agent');
      }

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || data.content || "I'm sorry, I couldn't process that request.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCalls: data.toolCalls || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If the agent took an action that modified data (e.g. booked a room or registered for event), refresh the parent data!
      if (data.dataMutated && onDataMutated) {
        onDataMutated();
      }
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Notice**: ${err.message || 'Error communicating with AI service.'} Please verify your API key in \`.env\`.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                CampusOS Intelligence Engine
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                Live Tool Calling
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Synchronized directly with current campus backend tables.
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'welcome',
                role: 'assistant',
                content:
                  "Conversation reset. How can I help you with your campus classes, rooms, or events?",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
          title="Clear Conversation"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-6 py-2.5 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800/80 overflow-x-auto no-scrollbar flex items-center space-x-2 shrink-0">
        <span className="text-[11px] font-bold text-slate-500 flex items-center space-x-1 shrink-0">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Judging Test Chips:</span>
        </span>
        {SAMPLE_QUERIES.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q.label)}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-sky-400 dark:hover:border-sky-600 transition-all shrink-0 active:scale-95"
          >
            <span className="text-[9px] uppercase font-bold text-slate-400 mr-1">
              [{q.category}]
            </span>
            {q.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  isUser
                    ? 'bg-sky-600 text-white'
                    : 'bg-gradient-to-tr from-sky-500 to-indigo-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[80%] space-y-1.5 ${isUser ? 'items-end' : ''}`}>
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-sky-600 text-white rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.content}</p>

                  {/* Tool Call Badges if any */}
                  {m.toolCalls && m.toolCalls.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/80 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center space-x-1">
                        <Terminal className="w-3 h-3 text-sky-500" />
                        <span>Real-Time Database Tools Executed:</span>
                      </span>
                      {m.toolCalls.map((t, idx) => (
                        <div
                          key={idx}
                          className="px-2 py-1 rounded bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-300"
                        >
                          ⚡ {t.name}({JSON.stringify(t.args || {})})
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 px-1">{m.timestamp}</span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs flex items-center space-x-2 rounded-tl-none border border-slate-200 dark:border-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-sky-500 animate-spin" />
              <span>Querying live campus database...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask about classes, rooms, deadlines, book a room, register for events..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white shadow-md shadow-sky-500/20 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
