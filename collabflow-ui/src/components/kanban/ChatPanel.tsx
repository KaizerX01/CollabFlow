import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Loader2,
  MessageSquare,
  ArrowDown,
} from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../context/AuthContext';
import { isToday, isYesterday, format } from 'date-fns';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ChatPanelProps {
  projectId: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Group-label for date separators */
function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d, yyyy');
}

/** Timestamp shown next to each message */
function formatMessageTime(dateStr: string): string {
  return format(new Date(dateStr), 'HH:mm');
}

/** Should we show a date separator before this message? */
function shouldShowDate(current: string, previous?: string): boolean {
  if (!previous) return true;
  const a = new Date(current).toDateString();
  const b = new Date(previous).toDateString();
  return a !== b;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ChatPanel: React.FC<ChatPanelProps> = ({ projectId }) => {
  const { currentUser } = useAuth();
  const { messages, sendMessage, isLoading, isConnected } = useChat({
    projectId,
    historyLimit: 20,
  });

  const [input, setInput] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prevMessageCountRef = useRef(0);

  // ── Auto-scroll to bottom on new messages ────────────────────────

  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      scrollToBottom();
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ── Scroll-aware "jump to bottom" button ─────────────────────────

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollButton(distanceFromBottom > 100);
  };

  // ── Send handler ─────────────────────────────────────────────────

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setInput('');
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Auto-resize textarea ─────────────────────────────────────────

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  // ── Loading state ────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading messages…</p>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col h-full">
        {/* Connection indicator */}
        <ConnectionBadge isConnected={isConnected} />

        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4"
          >
            <MessageSquare className="w-10 h-10 text-purple-400" />
          </motion.div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Start the conversation
          </h3>
          <p className="text-sm text-slate-400 max-w-[250px]">
            Be the first to send a message in this project chat
          </p>
        </div>

        {/* Input bar */}
        <ChatInput
          input={input}
          inputRef={inputRef}
          isConnected={isConnected}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onSend={handleSend}
        />
      </div>
    );
  }

  // ── Main chat view ───────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">
      {/* Connection indicator */}
      <ConnectionBadge isConnected={isConnected} />

      {/* Message list */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-1"
      >
        {messages.map((msg, idx) => {
          const isOwn = msg.senderId === currentUser?.id;
          const prevMsg = idx > 0 ? messages[idx - 1] : undefined;
          const showDate = shouldShowDate(msg.createdAt, prevMsg?.createdAt);

          // Consecutive messages from same sender → compact
          const isConsecutive =
            !showDate &&
            prevMsg?.senderId === msg.senderId;

          return (
            <React.Fragment key={msg.id}>
              {/* Date separator */}
              {showDate && (
                <div className="flex items-center gap-3 py-3">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-slate-500 font-medium px-2">
                    {formatDateSeparator(msg.createdAt)}
                  </span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
              )}

              {/* Message bubble */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${
                  isConsecutive ? 'mt-0.5' : 'mt-3'
                }`}
              >
                <div
                  className={`max-w-[75%] ${
                    isOwn ? 'items-end' : 'items-start'
                  } flex flex-col`}
                >
                  {/* Sender name (only for first in a group, others' messages) */}
                  {!isOwn && !isConsecutive && (
                    <div className="flex items-center gap-2 mb-1.5 ml-0.5">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-purple-500/20">
                        <span className="text-[10px] font-bold text-white">
                          {msg.senderUsername?.[0]?.toUpperCase() ?? '?'}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-300">
                        {msg.senderUsername}
                      </span>
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed break-words ${
                      isOwn
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-sm shadow-md shadow-purple-500/10'
                        : 'bg-white/[0.06] text-slate-200 border border-white/[0.08] rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Time */}
                  <span
                    className={`text-[10px] text-slate-500/80 mt-1 ${
                      isOwn ? 'mr-1.5 text-right' : 'ml-1.5'
                    }`}
                  >
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </div>
              </motion.div>
            </React.Fragment>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll-to-bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-purple-500/90 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 transition-colors"
          >
            <ArrowDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <ChatInput
        input={input}
        inputRef={inputRef}
        isConnected={isConnected}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onSend={handleSend}
      />
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const ConnectionBadge: React.FC<{ isConnected: boolean }> = ({
  isConnected,
}) => (
  <div className="flex items-center justify-center gap-1.5 py-2 px-4">
    <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-amber-400 animate-pulse'}`} />
    <span className={`text-[10px] font-medium ${isConnected ? 'text-emerald-400/90' : 'text-amber-400/90'}`}>
      {isConnected ? 'Live' : 'Connecting…'}
    </span>
  </div>
);

interface ChatInputProps {
  input: string;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  isConnected: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  inputRef,
  isConnected,
  onChange,
  onKeyDown,
  onSend,
}) => (
  <div className="border-t border-white/[0.08] px-5 py-3 bg-slate-950/40 backdrop-blur-sm">
    <div className="flex items-end gap-2.5">
      <textarea
        ref={inputRef}
        value={input}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={
          isConnected ? 'Type a message…' : 'Waiting for connection…'
        }
        disabled={!isConnected}
        rows={1}
        className="flex-1 resize-none bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/40 focus:border-purple-500/40 disabled:opacity-40 transition-all max-h-[120px]"
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSend}
        disabled={!input.trim() || !isConnected}
        className="w-9 h-9 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-opacity flex-shrink-0 shadow-md shadow-purple-500/20"
      >
        <Send className="w-4 h-4" />
      </motion.button>
    </div>
    <p className="text-[10px] text-slate-600 mt-2 ml-1">
      Enter to send · Shift+Enter for new line
    </p>
  </div>
);
