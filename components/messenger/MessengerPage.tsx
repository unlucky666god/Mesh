// components/messenger/MessengerPage.tsx
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatSidebar } from '@/components/messenger/ChatSidebar';
import { ChatWindow } from '@/components/messenger/ChatWindow';
import { useSocket } from '@/context/socketContext';
import Link from 'next/link';
import TopNav from "@/components/layout/TopNav";

// === Типы === (Оставлены без изменений)
interface Chat {
  id: string;
  type: 'PRIVATE' | 'GROUP';
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  online: boolean;
  unread?: number;
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
  const searchParams = useSearchParams();
  const chatIdParam = searchParams.get('chatId');

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeTab, setActiveTab] = useState<'PRIVATE' | 'GROUP'>('PRIVATE');
  const [messages, setMessages] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true); // Есть ли старые сообщения на сервере
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Статус подгрузки
  const [newMessage, setNewMessage] = useState('');
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const activeChatRef = useRef<Chat | null>(null);
  const { connected, error, joinConversation, sendMessage, markAsRead, on, off } = useSocket();

  // === ПРОВЕРКА АВТОРИЗАЦИИ ===
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) {
          router.replace('/login');
          return;
        }
        const data = await res.json();
        setCurrentUserId(data.user.id);
      } catch {
        router.replace('/login');
        return;
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, [router]);

  // === Загрузка списка чатов ===
  useEffect(() => {
    if (!authChecked) return;

    const loadChats = async () => {
      try {
        const res = await fetch('/api/conversations', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setChats(data.chats);

          if (chatIdParam) {
            const targeted = data.chats.find((c: Chat) => c.id === chatIdParam);
            if (targeted) {
              setActiveChat(targeted);
              setActiveTab(targeted.type);
            }
          } else if (data.chats.length > 0 && !activeChat && window.innerWidth >= 768) {
            // На десктопе (>=768px) открываем первый чат автоматически
            // На мобилке оставляем null, чтобы показать список чатов
            const firstPrivate = data.chats.find((c: Chat) => c.type === 'PRIVATE');
            if (firstPrivate) setActiveChat(firstPrivate);
            else setActiveChat(data.chats[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load chats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadChats();
  }, [authChecked, chatIdParam]);

  // === Загрузка истории сообщений ===
  useEffect(() => {
    if (!activeChat?.id || !authChecked) return;

    const loadInitialMessages = async () => {
      setMessages([]);
      setHasMore(true);
      try {
        // Добавляем лимит в запрос
        const res = await fetch(`/api/conversations/${activeChat.id}/messages?limit=25`, {
          credentials: 'include'
        });

        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);

          // Если пришло меньше 25, значит истории больше нет
          setHasMore(data.messages.length === 25);
        }
      } catch (err) {
        console.error('Failed to load initial messages:', err);
      }
    };

    loadInitialMessages();
  }, [activeChat?.id, authChecked]);

  const loadMoreMessages = useCallback(async () => {
    if (!activeChat?.id || !hasMore || isLoadingMore) return;

    setIsLoadingMore(true);

    // Берем ID самого первого сообщения в текущем списке (оно самое старое)
    const oldestId = messages[0]?.id;

    try {
      const res = await fetch(
        `/api/conversations/${activeChat.id}/messages?limit=25&beforeId=${oldestId}`,
        { credentials: 'include' }
      );

      if (res.ok) {
        const data = await res.json();

        if (data.messages.length > 0) {
          // ВАЖНО: Добавляем новые (старые) сообщения В НАЧАЛО массива
          setMessages(prev => [...data.messages, ...prev]);
          setHasMore(data.messages.length === 25);
        } else {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error('Failed to load more messages:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [activeChat?.id, hasMore, isLoadingMore, messages]);

  // Синхронизируем Ref со стейтом
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // Обработчики Socket (без изменений)
  const handleNewMessage = useCallback((msg: any) => {
    const currentActiveChat = activeChatRef.current;

    if (currentActiveChat?.id && msg.conversationId === currentActiveChat.id) {
      const isMe = String(msg.senderId) === String(currentUserId);

      const newMsg: Message = {
        id: msg.id,
        senderId: isMe ? 'me' : msg.senderId,
        text: msg.content,
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: '2-digit', minute: '2-digit'
        }),
        status: msg.status === 'read' ? 'read' : 'sent',
      };

      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, newMsg];
      });

      if (!isMe) {
        markAsRead(currentActiveChat.id, [msg.id]);
      }
    }

    setChats(prev => prev.map(c =>
      c.id === msg.conversationId
        ? { ...c, lastMessage: msg.content, time: 'Just now' }
        : c
    ));
  }, [currentUserId, markAsRead]);

  const handleStatusUpdate = useCallback(({ messageIds, status }: { messageIds: string[]; status: string }) => {
    setMessages(prev => prev.map(msg =>
      messageIds.includes(msg.id) && msg.senderId === 'me'
        ? { ...msg, status: status as 'read' | 'delivered' | 'sent' }
        : msg
    ));
  }, []);

  useEffect(() => {
    if (!connected || !authChecked) return;

    if (activeChat?.id) {
      joinConversation(activeChat.id);
    }

    on('message:new', handleNewMessage);
    on('message:status', handleStatusUpdate);

    return () => {
      off('message:new', handleNewMessage);
      off('message:status', handleStatusUpdate);
    };
  }, [connected, authChecked, activeChat?.id, joinConversation, on, off, handleNewMessage, handleStatusUpdate]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeChat?.id) return;
    sendMessage(activeChat.id, newMessage);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // === Кнопка "Назад" на мобилке ===
  const handleBackToChats = () => {
    setActiveChat(null);
    // Очищаем URL, чтобы при обновлении страницы мы не "застряли" в чате
    router.replace('/messenger', undefined);
  };

  if (!authChecked || loading) {
    return (
      <div className="min-h-[100dvh] bg-background-dark flex items-center justify-center">
        <div className="text-accent-neon font-mono animate-pulse">
          Connecting to Mesh Network...
        </div>
      </div>
    );
  }

  const filteredChats = chats.filter(c => c.type === activeTab);

  return (
    // Заменили h-screen на h-[100dvh] для лучшей совместимости с iOS Safari
    <div className="bg-background-dark font-sans text-slate-100 overflow-hidden h-[100dvh] flex flex-col pb-[76px] md:pb-0">

      <TopNav />

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Боковая панель: скрывается на мобилке, если выбран чат */}
        <ChatSidebar
          className={`${activeChat ? 'hidden md:flex' : 'flex'}`}
          chats={filteredChats}
          activeChatId={activeChat?.id}
          onChatSelect={setActiveChat}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Окно чата: скрывается на мобилке, если чат НЕ выбран */}
        <div className={`flex-1 flex-col ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
          <ChatWindow
            activeChat={activeChat}
            messages={messages}
            newMessage={newMessage}
            connected={connected}
            onNewMessageChange={setNewMessage}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
            onBack={handleBackToChats}
            onLoadMore={loadMoreMessages}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
          />
        </div>

        {/* Дополнительная боковая панель: полностью скрыта на планшетах и мобилках */}
        <nav className="hidden xl:flex w-20 lg:w-64 border-l border-white/10 flex-col py-6 px-4 bg-background-dark shrink-0">
          <div className="flex flex-col gap-2">
            <Link href="/" className="group flex items-center gap-4 px-4 py-3 rounded-xl transition-all hover:bg-accent-dark text-slate-500 hover:text-white">
              <span className="material-symbols-outlined group-hover:text-accent-neon">home</span>
              <span className="hidden lg:block text-sm font-medium">Home</span>
            </Link>
            <button className="group flex items-center gap-4 px-4 py-3 rounded-xl bg-accent-neon/10 text-accent-neon border border-accent-neon/20">
              <span className="material-symbols-outlined">chat_bubble</span>
              <span className="hidden lg:block text-sm font-semibold">Messenger</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}