/**
 * VirtuLab AI - Lab Mentor AI Assistant Panel
 * Communicates with locally running Gemma model via Ollama.
 * Injects verified simulation telemetry into context.
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MentorContext, queryLabMentor, getOllamaConfig, checkOllamaConnection } from '../../services/ollamaService';
import { OllamaStatus } from '../../types/app';
import { Bot, Send, Trash2, RefreshCw, Terminal, Sparkles, AlertCircle, X, ChevronRight } from 'lucide-react';

interface LabMentorDrawerProps {
  context: MentorContext;
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const LabMentorDrawer: React.FC<LabMentorDrawerProps> = ({
  context,
  isOpen,
  onClose,
  initialQuery
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello! I'm your local **Lab Mentor**, running via Ollama on your computer. I inspect your circuit simulation state in real time to guide you through ${context.experimentTitle}. Ask me about formulas, circuit mistakes, or hints for your next step!`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const config = getOllamaConfig();

  // Check Ollama status on mount
  useEffect(() => {
    checkOllamaConnection(config).then(setOllamaStatus);
  }, []);

  // Handle external query trigger (e.g. from mistake card)
  useEffect(() => {
    if (initialQuery && isOpen) {
      handleSend(initialQuery);
    }
  }, [initialQuery, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: textToSend };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await queryLabMentor(newHistory, context, config);
      setMessages([...newHistory, { role: 'assistant', content: response.text }]);
    } catch {
      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          content: 'I encountered an issue connecting to Ollama. Please check that Ollama is running locally with your Gemma model.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Chat history cleared. I'm ready to assist with ${context.experimentTitle}!`
      }
    ]);
  };

  const suggestedQuestions = [
    "Why is my current reading zero?",
    "Explain Ohm's Law formula.",
    "Why is this connection invalid?",
    "Give me a hint for the next step.",
    "Explain the voltage drop across this resistor."
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-[#090e1b] border-l border-[#1e2e4f] shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-3.5 border-b border-[#1e2e4f] flex items-center justify-between bg-[#0b1222]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white">Lab Mentor AI</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#111c34] text-cyan-300 border border-[#1e2e4f]">
                {config.model}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${ollamaStatus?.isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span>{ollamaStatus?.isConnected ? 'Ollama Online (Local)' : 'Offline Laboratory Fallback'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={clearChat}
            className="p-1.5 rounded hover:bg-[#162546] text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#162546] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ollama Offline Warning Banner if unreachable */}
      {ollamaStatus && !ollamaStatus.isConnected && (
        <div className="px-3 py-2 bg-amber-950/40 border-b border-amber-900/40 text-[11px] text-amber-200 flex items-start gap-2">
          <Terminal className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-300">Ollama not detected on port 11434</div>
            <div className="text-[10px] text-amber-200/80 mt-0.5">
              To run your local Gemma model, run <code className="bg-amber-950 px-1 py-0.5 rounded text-amber-300 font-mono">ollama run {config.model}</code> in Windows PowerShell. The mentor will still answer using built-in laboratory knowledge!
            </div>
          </div>
        </div>
      )}

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-xl p-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-cyan-600 text-white rounded-br-none shadow-sm'
                    : 'bg-[#111c34] text-slate-200 border border-[#1e2e4f] rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">
                {isUser ? 'You' : `Gemma (${config.model})`}
              </span>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 bg-[#111c34] border border-[#1e2e4f] rounded-xl p-3 w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Consulting local Gemma model...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="p-2 border-t border-[#1e2e4f] bg-[#0b1222] overflow-x-auto flex items-center gap-1.5 scrollbar-none">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1" />
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="whitespace-nowrap px-2.5 py-1 rounded-md bg-[#111c34] hover:bg-[#162546] border border-[#1e2e4f] text-[11px] text-slate-300 hover:text-cyan-300 transition-colors disabled:opacity-40"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-[#0d1527] border-t border-[#1e2e4f] flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Lab Mentor about circuit or formulas..."
          disabled={isLoading}
          className="flex-1 bg-[#070b14] border border-[#1e2e4f] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
