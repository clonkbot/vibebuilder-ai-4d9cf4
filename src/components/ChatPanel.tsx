import { useState, useEffect, RefObject } from "react";
import { Doc } from "../../convex/_generated/dataModel";

interface ChatPanelProps {
  messages: Doc<"messages">[];
  isGenerating: boolean;
  onSend: (message: string) => void;
  chatEndRef: RefObject<HTMLDivElement>;
}

const QUICK_PROMPTS = [
  "Make it modern and stylish",
  "Add a dark mode toggle",
  "Add smooth animations",
  "Make it mobile responsive",
  "Explain this code",
  "Fix any bugs",
];

export function ChatPanel({ messages, isGenerating, onSend, chatEndRef }: ChatPanelProps) {
  const [input, setInput] = useState("");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatEndRef]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isGenerating) {
      onSend(input.trim());
      setInput("");
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <div className="flex-shrink-0 p-3 md:p-4 border-b border-[#00f5d4]/10 bg-[#0d0d14]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff6b9d] to-[#ff6b9d]/50 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">AI Assistant</h3>
            <p className="text-gray-500 text-xs font-mono">Powered by Grok</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#00f5d4]/10 to-[#ff6b9d]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#00f5d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h4 className="text-white font-bold mb-2">Start Building</h4>
            <p className="text-gray-500 text-sm font-mono mb-6 px-4">
              Describe your app idea or ask me to modify the existing code
            </p>

            {/* Quick prompts */}
            <div className="flex flex-wrap justify-center gap-2 px-2">
              {QUICK_PROMPTS.slice(0, 4).map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => onSend(prompt)}
                  disabled={isGenerating}
                  className="px-3 py-1.5 bg-[#12121a] border border-[#00f5d4]/20 rounded-full text-xs font-mono text-gray-400 hover:text-[#00f5d4] hover:border-[#00f5d4]/40 transition-all disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-gradient-to-r from-[#00f5d4] to-[#00d4aa] text-[#0a0a0f]"
                  : "bg-[#12121a] border border-[#00f5d4]/10 text-gray-300"
              }`}
            >
              <p className="text-sm font-mono whitespace-pre-wrap break-words">
                {message.content.length > 500
                  ? message.content.slice(0, 500) + "..."
                  : message.content}
              </p>
              <p className={`text-[10px] mt-2 ${
                message.role === "user" ? "text-[#0a0a0f]/60" : "text-gray-500"
              }`}>
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-[#12121a] border border-[#ff6b9d]/20 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[#ff6b9d] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[#ff6b9d] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[#ff6b9d] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs font-mono text-[#ff6b9d]">Generating...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex-shrink-0 p-3 md:p-4 border-t border-[#00f5d4]/10 bg-[#0d0d14]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your app or changes..."
            disabled={isGenerating}
            className="flex-1 bg-[#0a0a0f] border border-[#00f5d4]/20 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#00f5d4] transition-all placeholder-gray-600 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isGenerating || !input.trim()}
            className="px-4 md:px-6 bg-gradient-to-r from-[#00f5d4] to-[#00d4aa] text-[#0a0a0f] font-bold rounded-xl hover:shadow-lg hover:shadow-[#00f5d4]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
