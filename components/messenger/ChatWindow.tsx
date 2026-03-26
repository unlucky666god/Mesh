// components/messenger/ChatWindow.tsx
'use client';
import { useRef, useEffect, useState, Fragment } from 'react';
import { createPortal } from 'react-dom'; // Добавили портал
import { formatDateLabel, formatTime24 } from '@/utils/date';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  isEdited?: boolean;
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
  onKeyPress?: (e: React.KeyboardEvent) => void;
  onBack?: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  onDeleteMessage: (id: string) => void;
  onEditMessage: (conversationId: string, messageId: string, newText: string) => void;
  markAsRead: (conversationId: string, messageIds: string[]) => void;
}

export function ChatWindow({
  activeChat,
  messages,
  newMessage,
  connected,
  onNewMessageChange,
  onSendMessage,
  onBack,
  onLoadMore,
  hasMore,
  isLoadingMore,
  onDeleteMessage,
  markAsRead,
  onEditMessage
}: ChatWindowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [contextMenu, setContextMenu] = useState<{ id: string, x: number, y: number } | null>(null);
  const [editingMessage, setEditingMessage] = useState<{ id: string, text: string } | null>(null);
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const lastScrollHeightRef = useRef<number>(0);

  // Закрытие меню при любом клике или скролле
  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    if (scrollContainerRef.current) {
        scrollContainerRef.current.addEventListener('scroll', closeMenu);
    }
    return () => {
        window.removeEventListener('click', closeMenu);
    };
  }, []);

  const handleStart = (msgId: string, e: any) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    longPressTimer.current = setTimeout(() => {
      setContextMenu({ id: msgId, x: clientX, y: clientY });
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500);
  };

  const handleEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const startEditing = (msg: Message) => {
    setEditingMessage({ id: msg.id, text: msg.text });
    onNewMessageChange(msg.text);
    setContextMenu(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSendAction = () => {
    if (!newMessage.trim() || !connected) return;
    if (editingMessage) {
      onEditMessage(activeChat!.id, editingMessage.id, newMessage);
      setEditingMessage(null);
      onNewMessageChange('');
    } else {
      onSendMessage();
    }
  };

  // --- СКРОЛЛ И ПРОЧТЕНИЕ ---
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setShouldScrollToBottom(scrollHeight - scrollTop - clientHeight < 100);
    if (scrollTop < 50 && hasMore && !isLoadingMore) {
      lastScrollHeightRef.current = scrollHeight;
      onLoadMore();
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    if (shouldScrollToBottom) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    } else if (!isLoadingMore && lastScrollHeightRef.current > 0) {
      container.scrollTop = container.scrollHeight - lastScrollHeightRef.current;
      lastScrollHeightRef.current = 0;
    }
  }, [messages, isLoadingMore, shouldScrollToBottom]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const msgId = entry.target.getAttribute('data-msg-id');
          const isMe = entry.target.getAttribute('data-is-me') === 'true';
          const status = entry.target.getAttribute('data-status');
          if (msgId && !isMe && status !== 'read') {
            markAsRead(activeChat!.id, [msgId]);
          }
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.message-bubble').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [messages, activeChat]);

  if (!activeChat) return null;

  return (
    <section className="flex-1 flex flex-col bg-background-dark h-full overflow-hidden relative">
      {/* HEADER */}
      <header className="shrink-0 p-4 border-b border-white/10 flex items-center justify-between bg-background-dark/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          {onBack && <button onClick={onBack} className="md:hidden p-2 -ml-2 text-slate-300"><span className="material-symbols-outlined">arrow_back_ios_new</span></button>}
          <div className="relative shrink-0">
            <img className="size-10 rounded-full border border-accent-neon/30" src={activeChat.avatar || "/avatar.webp"} alt="" />
            {activeChat.online && <div className="absolute bottom-0 right-0 size-2.5 bg-accent-neon rounded-full border-2 border-background-dark" />}
          </div>
          <div>
            <p className="font-bold text-sm text-slate-100">{activeChat.name}</p>
            <p className="text-[10px] text-accent-neon uppercase">{activeChat.online ? 'Online' : 'Offline'}</p>
          </div>
        </div>
      </header>

      {/* MESSAGES */}
      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === 'me';
          const showDate = index === 0 || new Date(msg.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString();

          return (
            <Fragment key={msg.id || index}>
              {showDate && (
                <div className="flex justify-center my-2 w-full">
                  <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-white/5">
                    {formatDateLabel(msg.timestamp)}
                  </span>
                </div>
              )}
              <div 
                className={`message-bubble flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                data-msg-id={msg.id} data-is-me={isMe} data-status={msg.status}
              >
                <div 
                  className={`relative p-3 rounded-2xl border max-w-[80%] shrink-0 ${isMe ? 'bg-accent-neon/10 border-accent-neon/30' : 'bg-surface-dark border-white/5'}`}
                  onMouseDown={(e) => handleStart(msg.id, e)}
                  onMouseUp={handleEnd}
                  onTouchStart={(e) => handleStart(msg.id, e)}
                  onTouchEnd={handleEnd}
                  onContextMenu={(e) => { e.preventDefault(); setContextMenu({ id: msg.id, x: e.clientX, y: e.clientY }); }}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                  <div className={`flex items-center gap-1 mt-1 opacity-50 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <p className="text-[10px]">{msg.isEdited && '(edited) '}{formatTime24(msg.timestamp)}</p>
                    {isMe && (
                      <span className={`material-symbols-outlined !text-[16px] ${msg.status === 'read' ? 'text-accent-neon' : 'text-slate-500'}`}>
                        {msg.status === 'read' ? 'done_all' : msg.status === 'delivered' ? 'done_all' : 'done'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>

      {/* INPUT */}
      <div className="shrink-0 p-4 bg-background-dark border-t border-white/10">
        {editingMessage && (
          <div className="flex items-center justify-between bg-surface-dark border border-white/10 rounded-t-xl p-2 mb-[-1px] max-w-4xl mx-auto">
             <div className="flex items-center gap-2 text-amber-400 text-xs ml-2">
                <span className="material-symbols-outlined text-sm">edit</span> Editing message...
             </div>
             <button onClick={() => { setEditingMessage(null); onNewMessageChange(''); }} className="text-slate-500"><span className="material-symbols-outlined text-sm">close</span></button>
          </div>
        )}
        <div className={`max-w-4xl mx-auto flex items-center gap-2 bg-surface-dark border border-white/10 p-2 ${editingMessage ? 'rounded-b-xl' : 'rounded-xl'}`}>
          <input
            ref={inputRef}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none text-slate-100"
            placeholder={connected ? "Type a message..." : "Connecting..."}
            value={newMessage}
            onChange={(e) => onNewMessageChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendAction())}
          />
          <button onClick={handleSendAction} disabled={!newMessage.trim()} className={`${editingMessage ? 'bg-amber-400' : 'bg-accent-neon'} text-black rounded-lg p-2 disabled:opacity-30`}>
            <span className="material-symbols-outlined font-bold">{editingMessage ? 'done' : 'send'}</span>
          </button>
        </div>
      </div>

      {/* PORTAL MENU - Теперь точно не сломает верстку */}
      {contextMenu && createPortal(
        <div 
          className="fixed z-[9999] bg-surface-light border border-white/10 rounded-lg shadow-2xl p-1 min-w-[140px] animate-in fade-in zoom-in duration-100"
          style={{ top: contextMenu.y, left: Math.min(contextMenu.x, window.innerWidth - 150) }}
          onClick={(e) => e.stopPropagation()}
        >
          {messages.find(m => m.id === contextMenu.id)?.senderId === 'me' && (
            <button onClick={() => startEditing(messages.find(m => m.id === contextMenu.id)!)} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-200 hover:bg-white/5 rounded">
              <span className="material-symbols-outlined text-sm text-amber-400">edit</span> Edit
            </button>
          )}
          <button onClick={() => { onDeleteMessage(contextMenu.id); setContextMenu(null); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded">
            <span className="material-symbols-outlined text-sm">delete</span> Delete
          </button>
        </div>,
        document.body
      )}
    </section>
  );
}