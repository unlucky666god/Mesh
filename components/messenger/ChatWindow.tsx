// components/messenger/ChatWindow.tsx
'use client';
import { useRef, useEffect, useState } from 'react';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface Chat {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
}

interface ChatWindowProps {
  activeChat: Chat | null;
  messages: Message[];
  newMessage: string;
  connected: boolean;
  onNewMessageChange: (val: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onBack?: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
}

export function ChatWindow({
  activeChat,
  messages,
  newMessage,
  connected,
  onNewMessageChange,
  onSendMessage,
  onKeyPress,
  onBack,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: ChatWindowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const lastScrollHeightRef = useRef<number>(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    // Проверяем, находится ли пользователь внизу (с поправкой 100px)
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldScrollToBottom(isAtBottom);

    // Загрузка старых сообщений при скролле вверх
    if (scrollTop < 50 && hasMore && !isLoadingMore) {
      lastScrollHeightRef.current = scrollHeight; // Запоминаем текущую высоту
      onLoadMore();
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (shouldScrollToBottom) {
      // Скроллим вниз, если мы уже были внизу
      container.scrollTop = container.scrollHeight;
    } else if (isLoadingMore === false && lastScrollHeightRef.current > 0) {
      // Если подгрузились старые сообщения, корректируем скролл, чтобы экран не прыгал
      const heightDifference = container.scrollHeight - lastScrollHeightRef.current;
      container.scrollTop = heightDifference;
      lastScrollHeightRef.current = 0;
    }
  }, [messages, isLoadingMore, shouldScrollToBottom]);

  if (!activeChat) {
    return (
      <section className="flex-1 hidden md:flex items-center justify-center text-slate-500 bg-background-dark">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl mb-2 opacity-50 text-accent-neon">chat_bubble</span>
          <p>Select a conversation to start messaging</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 flex flex-col bg-background-dark h-full overflow-hidden">
      
      {/* HEADER */}
      <header className="shrink-0 p-4 border-b border-white/10 flex items-center justify-between bg-background-dark/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="md:hidden flex items-center justify-center p-2 -ml-2 text-slate-300 hover:text-accent-neon rounded-full">
              <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
            </button>
          )}
          <div className="relative shrink-0">
            <img className="size-10 rounded-full object-cover border border-accent-neon/30" src={activeChat.avatar || 'https://ui-avatars.com/api/?name=' + activeChat.name} alt="avatar" />
            {activeChat.online && <div className="absolute bottom-0 right-0 size-2.5 bg-accent-neon rounded-full border border-background-dark" />}
          </div>
          <div>
            <p className="font-bold text-sm text-slate-100">{activeChat.name}</p>
            <p className="text-[10px] text-accent-neon uppercase tracking-tighter">{activeChat.online ? 'Online' : 'Offline'}</p>
          </div>
        </div>
      </header>

      {/* MESSAGES AREA - Теперь это ОДИН блок */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 chat-scroll custom-scrollbar"
      >
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <div className="size-6 border-2 border-accent-neon border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!hasMore && messages.length > 0 && (
          <p className="text-center text-[10px] text-slate-600 uppercase tracking-widest py-6 opacity-50">
            Beginning of the encrypted history
          </p>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === 'me';
          return (
            <div key={msg.id} className={`flex items-end gap-3 max-w-[85%] md:max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`p-3 rounded-2xl border ${isMe ? 'bg-accent-neon/10 border-accent-neon/30 rounded-br-none shadow-[0_0_10px_rgba(57,255,20,0.1)]' : 'bg-surface-dark border-white/5 rounded-bl-none text-slate-100'}`}>
                <p className="text-sm break-words leading-relaxed">{msg.text}</p>
                <div className="flex justify-end gap-1 mt-1">
                  <p className={`text-[9px] ${isMe ? 'text-accent-neon/70' : 'text-slate-500'}`}>{msg.timestamp}</p>
                  {isMe && msg.status && (
                    <span className="material-symbols-outlined text-[10px] text-accent-neon">
                      {msg.status === 'read' ? 'done_all' : 'done'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT AREA */}
      <div className="shrink-0 p-3 md:p-4 bg-background-dark/50 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-4xl mx-auto relative flex items-center gap-2 bg-surface-dark border border-white/10 rounded-xl p-1.5 md:p-2 focus-within:ring-1 focus-within:ring-accent-neon/50">
          <input
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2 outline-none text-slate-100"
            placeholder={connected ? "Type a secure message..." : "Connecting..."}
            type="text"
            value={newMessage}
            onChange={(e) => onNewMessageChange(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSendMessage();
                }
            }}
            disabled={!connected}
          />
          <button
            onClick={onSendMessage}
            disabled={!newMessage.trim() || !connected}
            className="bg-accent-neon text-black rounded-lg p-2 flex items-center justify-center hover:brightness-110 active:scale-95 transition-all disabled:opacity-30"
          >
            <span className="material-symbols-outlined font-bold">send</span>
          </button>
        </div>
      </div>
    </section>
  );
}