// components/messenger/ChatWindow.tsx
'use client';
import { useRef, useEffect, useState, Fragment } from 'react';
import { createPortal } from 'react-dom'; // Добавили портал
import { MessageItem } from '@/components/messenger/MessageItem';
import { GroupInfoDrawer } from './GroupInfoDrawer';

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
  type: 'PRIVATE' | 'GROUP';
  members?: GroupMember[];
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
  currentUserId: string | null;
  onFetchMembers: (chatId: string) => void;
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
  onEditMessage,
  currentUserId,
  onFetchMembers
}: ChatWindowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [contextMenu, setContextMenu] = useState<{ id: string, x: number, y: number } | null>(null);
  const [editingMessage, setEditingMessage] = useState<{ id: string, text: string } | null>(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const lastScrollHeightRef = useRef<number>(0);

  const handleHeaderClick = () => {
    if (activeChat?.type === 'GROUP') {
      onFetchMembers(activeChat.id); // Загружаем данные только ПРИ КЛИКЕ
      setShowGroupInfo(true);
    }
  };

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
      <header onClick={handleHeaderClick} className="shrink-0 p-4 border-b border-white/10 flex items-center justify-between bg-background-dark/80 backdrop-blur-md z-20 cursor-pointer">
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
          const isMe = msg.senderId === 'me' || msg.senderId === currentUserId;

          // ЛОГИКА РАЗДЕЛЕНИЯ ДАТ:
          const currentDate = new Date(msg.timestamp).toDateString();
          const prevDate = index > 0 ? new Date(messages[index - 1].timestamp).toDateString() : null;
          const showDateSeparator = currentDate !== prevDate;

          return (
            <Fragment key={msg.id}>
              {showDateSeparator && (
                <div className="flex justify-center my-6">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    {new Date(msg.timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                  </span>
                </div>
              )}

              <div
                onContextMenu={(e) => { e.preventDefault(); handleStart(msg.id, e); }}
                onTouchStart={(e) => handleStart(msg.id, e)}
                onTouchEnd={handleEnd}
                className="message-bubble"
                data-msg-id={msg.id}
                data-is-me={isMe}
                data-status={msg.status}
              >
                <MessageItem
                  message={msg}
                  isMe={isMe}
                  showSenderInfo={true}
                />
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
          style={{
            top: contextMenu.y,
            left: Math.min(contextMenu.x, window.innerWidth - 150)
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {(() => {
            const msg = messages.find(m => m.id === contextMenu.id);
            const isMine = msg?.senderId === 'me' || msg?.senderId === currentUserId;

            // Если сообщение НЕ моё — показываем только инфо
            if (!isMine) {
              return (
                <div className="p-3 text-[10px] text-slate-500 text-center uppercase font-bold">
                  Message Info
                  <div className="mt-1 text-slate-400 normal-case font-normal italic">
                    Sent at {new Date(msg?.timestamp || '').toLocaleTimeString()}
                  </div>
                </div>
              );
            }

            // Если сообщение МОЁ — показываем кнопки управления
            return (
              <Fragment>
                <button
                  onClick={() => startEditing(msg!)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-200 hover:bg-white/5 rounded transition-colors"
                >
                  <span className="material-symbols-outlined text-sm text-amber-400">edit</span>
                  Edit
                </button>
                <button
                  onClick={() => { onDeleteMessage(contextMenu.id); setContextMenu(null); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Delete
                </button>
              </Fragment>
            );
          })()}
        </div>,
        document.body
      )}
      <GroupInfoDrawer
        isOpen={showGroupInfo}
        onClose={() => setShowGroupInfo(false)}
        members={activeChat.members || []}
        currentUserId={currentUserId}
        isAdmin={!!activeChat.members?.some(m => m.id === currentUserId && m.role !== 'MEMBER')}
        onRemoveMember={(id) => {
          console.log("Removing member:", id);
        }}
      />
    </section>
  );
}