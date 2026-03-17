// app/messenger/MessengerPage.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChatItem } from './ChatItem';

// === Типы ===
interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  online: boolean;
  unread?: number;
  active?: boolean;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

export default function MessengerPage() {
  const router = useRouter();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false); // 🔥 Флаг проверки авторизации
  
  const { connected, error, joinConversation, sendMessage, markAsRead, on, off } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // === 🔥 ПРОВЕРКА АВТОРИЗАЦИИ (редирект если не авторизован) ===
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) {
          // 🔥 Не авторизован → редирект на логин
          router.replace('/auth/login');
          return;
        }
      } catch {
        router.replace('/auth/login');
        return;
      } finally {
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, [router]);

  // === Загрузка списка чатов (только после проверки авторизации) ===
  useEffect(() => {
    if (!authChecked) return;
    
    const loadChats = async () => {
      try {
        const res = await fetch('/api/conversations', { credentials: 'include' });
        if (res.ok) {
          const { chats } = await res.json();
          setChats(chats);
          if (chats.length > 0 && !activeChat) {
            setActiveChat(chats[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load chats:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadChats();
  }, [authChecked, activeChat]);

  // === Загрузка истории сообщений при смене чата ===
  useEffect(() => {
    if (!activeChat?.id || !authChecked) return;
    
    const loadMessages = async () => {
      try {
        const res = await fetch(`/api/conversations/${activeChat.id}/messages`, { 
          credentials: 'include' 
        });
        if (res.ok) {
          const { messages } = await res.json();
          setMessages(messages);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };
    
    loadMessages();
  }, [activeChat?.id, authChecked]);

  // === Подписка на сокет-события ===
  useEffect(() => {
    if (!activeChat?.id || !connected || !authChecked) return;
    
    joinConversation(activeChat.id);
    
    const handleNewMessage = (msg: MessageData) => {
      if (msg.conversationId === activeChat.id) {
        const newMsg: Message = {
          id: msg.id,
          senderId: msg.senderId,
          text: msg.content,
          timestamp: new Date(msg.createdAt).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          status: msg.senderId === 'me' ? 'sent' : undefined,
        };
        
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, newMsg];
        });
        
        if (msg.senderId !== 'me') {
          markAsRead(activeChat.id, [msg.id]);
        }
      }
    };
    
    const handleStatusUpdate = ({ messageIds, status }: { 
      messageIds: string[]; 
      status: string;
      userId: string;
    }) => {
      setMessages(prev => prev.map(msg => 
        messageIds.includes(msg.id) && msg.senderId === 'me'
          ? { ...msg, status: status as 'read' | 'delivered' }
          : msg
      ));
    };
    
    on('message:new', handleNewMessage);
    on('message:status', handleStatusUpdate);
    
    return () => {
      off('message:new', handleNewMessage);
      off('message:status', handleStatusUpdate);
    };
  }, [activeChat?.id, connected, authChecked, joinConversation, on, off, markAsRead]);

  // === Автоскролл ===
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // === Отправка сообщения ===
  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeChat?.id) return;
    
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const optimisticMsg: Message = {
      id: tempId,
      senderId: 'me',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };
    
    setMessages(prev => [...prev, optimisticMsg]);
    setNewMessage('');
    sendMessage(activeChat.id, newMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // === 🔥 Показываем загрузку пока не проверили авторизацию ===
  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-accent-neon font-mono animate-pulse">
          Connecting to Mesh Network...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-slate-100 overflow-hidden h-screen flex flex-col">
      
      {/* ========== HEADER ========== */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-white/10 bg-background-light dark:bg-background-dark z-20">
        
        {/* Логотип */}
        <div className="flex items-center gap-3 text-accent-neon">
          <div className="size-6">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor" />
            </svg>
          </div>
          <h1 className="text-slate-900 dark:text-white text-xl font-bold tracking-tighter uppercase italic font-mono">
            Mesh
          </h1>
        </div>

        {/* Поиск */}
        <div className="relative hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          <input
            className="w-64 bg-slate-100 dark:bg-surface-dark border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-accent-neon placeholder:text-slate-500 outline-none"
            placeholder="Search network..."
            type="text"
          />
        </div>

        {/* Правая часть + индикатор подключения */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-200 dark:hover:bg-accent-dark rounded-lg transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 size-2 bg-accent-neon rounded-full shadow-[0_0_10px_rgba(57,255,20,0.4)]"></span>
          </button>

          <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10 mx-2"></div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">Alex Rivera</p>
              <p className="text-[10px] text-accent-neon uppercase tracking-widest font-bold">Pro Member</p>
            </div>
            <div className="size-10 rounded-full border border-accent-neon/50 p-0.5">
              <img
                className="w-full h-full rounded-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDB2liMK2Kfv4AlAZ1yj9ceGrcMhGfuRKjYETqP9thgwpaPVD7mNccObI_XUrE3rhPecz6Z8VjWhEjQEzYbp-Q7uYo5IApQncoRUIXA6dY7piqV_6VHox2FnmXWcM7af53SqrLV0PMG5FXyn-cWB9ymyfMnxJ0QI-RecGxIAkn3gW9TN-IhxdymLpf_tl6wEsYSocZjdwfjWno1UUKZVQgQxXWJhGJu5t3rqjbj3FWY2td6KCaifImGN9aBg6B9nKA-zUEnlgMYpAPx"
                alt="User avatar"
              />
            </div>
          </div>

          {/* 🔥 Индикатор подключения к сокету */}
          <div className="flex items-center gap-2 ml-2">
            <div className={`size-2 rounded-full transition-colors ${
              connected ? 'bg-accent-neon shadow-[0_0_10px_rgba(57,255,20,0.6)]' : 'bg-red-500'
            }`}></div>
            <span className="text-[10px] text-slate-500 font-mono uppercase hidden sm:inline">
              {connected ? 'Online' : 'Reconnecting...'}
            </span>
          </div>
        </div>
      </header>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Левая панель: Список чатов */}
        <aside className="w-full max-w-xs border-r border-slate-200 dark:border-white/10 flex flex-col bg-slate-50 dark:bg-surface-dark/50">
          <div className="p-4 flex items-center justify-between">
            <h3 className="font-bold text-lg">Messages</h3>
            <button className="size-8 bg-accent-neon/10 text-accent-neon rounded-lg flex items-center justify-center hover:bg-accent-neon/20 transition-all">
              <span className="material-symbols-outlined text-xl">edit_square</span>
            </button>
          </div>

          <div className="px-4 mb-4">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm group-focus-within:text-accent-neon transition-colors">search</span>
              <input
                className="w-full bg-slate-100 dark:bg-accent-dark border border-transparent focus:border-accent-neon/50 focus:ring-0 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 transition-all outline-none"
                placeholder="Search messages..."
                type="text"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 space-y-1">
            {chats.map((chat) => (
              <ChatItem
                key={chat.id}
                {...chat}
                active={activeChat?.id === chat.id}
                onClick={() => setActiveChat(chat)}
              />
            ))}
            {chats.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                No conversations yet
              </div>
            )}
          </div>
        </aside>

        {/* Окно активного чата */}
        <section className="flex-1 flex flex-col bg-background-light dark:bg-background-dark relative">
          
          {activeChat ? (
            <>
              {/* Шапка чата */}
              <header className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img
                      className="size-10 rounded-full object-cover border border-accent-neon/30"
                      src={activeChat.avatar}
                      alt={`${activeChat.name} avatar`}
                    />
                    {activeChat.online && (
                      <div className="absolute bottom-0 right-0 size-2.5 bg-accent-neon rounded-full border border-background-dark"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{activeChat.name}</p>
                    <p className="text-[10px] text-accent-neon uppercase tracking-tighter">
                      {activeChat.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-slate-200 dark:hover:bg-accent-dark rounded-lg text-slate-500 hover:text-accent-neon transition-colors">
                    <span className="material-symbols-outlined">call</span>
                  </button>
                  <button className="p-2 hover:bg-slate-200 dark:hover:bg-accent-dark rounded-lg text-slate-500 hover:text-accent-neon transition-colors">
                    <span className="material-symbols-outlined">videocam</span>
                  </button>
                  <button className="p-2 hover:bg-slate-200 dark:hover:bg-accent-dark rounded-lg text-slate-500 hover:text-accent-neon transition-colors">
                    <span className="material-symbols-outlined">info</span>
                  </button>
                </div>
              </header>

              {/* Сообщения */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 chat-scroll">
                <div className="flex justify-center">
                  <span className="text-[10px] px-3 py-1 bg-slate-200 dark:bg-accent-dark rounded-full text-slate-500 font-bold uppercase tracking-widest">
                    Today
                  </span>
                </div>

                {messages.map((msg) => {
                  const isMe = msg.senderId === 'me';
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-3 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      {!isMe && (
                        <img
                          className="size-8 rounded-full object-cover"
                          src={activeChat.avatar}
                          alt={activeChat.name}
                        />
                      )}
                      <div className={`
                        p-3 rounded-2xl border
                        ${isMe
                          ? 'bg-accent-neon/10 border-accent-neon/30 rounded-br-none shadow-[0_0_10px_rgba(57,255,20,0.2)]'
                          : 'bg-slate-100 dark:bg-surface-dark border-slate-200 dark:border-white/5 rounded-bl-none'
                        }
                      `}>
                        <p className="text-sm">{msg.text}</p>
                        <div className={`flex justify-end gap-1 mt-1 ${isMe ? 'items-center' : ''}`}>
                          <p className={`text-[9px] ${isMe ? 'text-accent-neon/70' : 'text-slate-500'}`}>
                            {msg.timestamp}
                          </p>
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
                <div ref={messagesEndRef} />
              </div>

              {/* Поле ввода */}
              <div className="p-4 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-white/10">
                <div className="max-w-4xl mx-auto relative flex items-center gap-2 bg-slate-100 dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl p-2 focus-within:ring-1 focus-within:ring-accent-neon/50 transition-all">
                  <label className="p-2 text-slate-500 hover:text-accent-neon transition-colors">
                    <span className="material-symbols-outlined">add_circle</span>
                    <input className='hidden' type="file" />
                  </label>
                  <label className="p-2 text-slate-500 hover:text-accent-neon transition-colors">
                    <span className="material-symbols-outlined">image</span>
                    <input className="hidden" type="file" accept='image/*' />
                  </label>
                  <input
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 outline-none disabled:opacity-50"
                    placeholder={connected ? "Type a secure message..." : "Connecting..."}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={!connected}
                  />
                  <button className="p-2 text-slate-500 hover:text-accent-neon transition-colors">
                    <span className="material-symbols-outlined">sentiment_satisfied</span>
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || !connected}
                    className="bg-accent-neon text-black rounded-lg p-2 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(57,255,20,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span className="material-symbols-outlined font-bold">send</span>
                  </button>
                </div>
                
                {error && (
                  <p className="text-center text-[10px] text-red-400 mt-2 font-mono">
                    ⚠ {error}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">chat_bubble</span>
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </section>

        {/* Правая панель: Навигация */}
        <nav className="w-20 lg:w-64 border-l border-slate-200 dark:border-white/10 flex flex-col py-6 px-4 bg-slate-50 dark:bg-background-dark">
          <div className="flex flex-col gap-2">
            <a href="/" className="group flex items-center gap-4 px-4 py-3 rounded-xl transition-all hover:bg-slate-200 dark:hover:bg-accent-dark text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <span className="material-symbols-outlined group-hover:text-accent-neon">home</span>
              <span className="hidden lg:block text-sm font-medium">Home</span>
            </a>
            <button className="group flex items-center gap-4 px-4 py-3 rounded-xl bg-accent-neon/10 text-accent-neon border border-accent-neon/20">
              <span className="material-symbols-outlined">chat_bubble</span>
              <span className="hidden lg:block text-sm font-semibold">Messenger</span>
            </button>
            <a href="/discover" className="group flex items-center gap-4 px-4 py-3 rounded-xl transition-all hover:bg-slate-200 dark:hover:bg-accent-dark text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <span className="material-symbols-outlined group-hover:text-accent-neon">explore</span>
              <span className="hidden lg:block text-sm font-medium">Discover</span>
            </a>
            <a href="/settings" className="group flex items-center gap-4 px-4 py-3 rounded-xl transition-all hover:bg-slate-200 dark:hover:bg-accent-dark text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <span className="material-symbols-outlined group-hover:text-accent-neon">settings</span>
              <span className="hidden lg:block text-sm font-medium">Settings</span>
            </a>
          </div>
        </nav>
      </div>
    </div>
  );
}