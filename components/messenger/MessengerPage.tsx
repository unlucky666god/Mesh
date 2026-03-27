// components/messenger/MessengerPage.tsx
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatSidebar } from '@/components/messenger/ChatSidebar';
import { ChatWindow } from '@/components/messenger/ChatWindow';
import { useSocket } from '@/context/socketContext';
import TopNav from "@/components/layout/TopNav";
import SidebarNav from '../layout/SidebarNav';

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
  members?: GroupMember[];
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  sender?: {
    name: string;
    avatar: string;
  };
}

export default function MessengerPage() {
  const {
    editMessage,
  } = useSocket();

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
  const { connected, error, joinConversation, sendMessage, markAsRead, on, off, deleteMessage, socket } = useSocket();
  const [user, setUser] = useState<{ id: string; name: string } | null>(null); //set current username
  const [friends, setFriends] = useState([]); // get friends list

  // get friends list function
  useEffect(() => {
    const loadFriends = async () => {
      // API, который возвращает тех, на кого подписан юзер
      const res = await fetch('/api/users/following');
      const data = await res.json();
      setFriends(data);
    };
    if (authChecked) loadFriends();
  }, [authChecked]);

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
        setUser({
          id: data.user.id,
          name: data.user.name
        });
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

    // Проверяем, относится ли сообщение к текущему открытому чату
    if (currentActiveChat?.id && msg.conversationId === currentActiveChat.id) {
      // ВАЖНО: Сравниваем ID отправителя с текущим пользователем
      const isMe = String(msg.senderId) === String(currentUserId);

      const newMsg: Message = {
        id: msg.id,
        senderId: isMe ? 'me' : msg.senderId,
        text: msg.text || msg.content, // Проверка на оба варианта поля
        timestamp: new Date(msg.timestamp).toString(),
        status: msg.status || 'sent',
        sender: msg.sender
      };

      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, newMsg];
      });

      if (!isMe) {
        markAsRead(currentActiveChat.id, [msg.id]);
      }
    }

    // Обновляем текст последнего сообщения в списке чатов слева
    setChats(prev => prev.map(c =>
      c.id === msg.conversationId
        ? { ...c, lastMessage: msg.text || msg.content, time: 'Just now' }
        : c
    ));
  }, [currentUserId, markAsRead]);

  useEffect(() => {
    if (!connected || !authChecked || !socket) return;

    if (activeChat?.id) {
      joinConversation(activeChat.id);
    }

    // Единый обработчик обновления статуса (приходит от сервера)
    const handleStatusUpdate = ({ messageIds, status }: { messageIds: string[]; status: string }) => {
      setMessages(prev => prev.map(msg =>
        messageIds.includes(msg.id)
          ? { ...msg, status: status as 'read' | 'delivered' | 'sent' }
          : msg
      ));
    };

    const handleDeleted = ({ messageId }: { messageId: string }) => {
      setMessages(prev => prev.filter(m => m.id !== messageId));
    };

    // Подписываемся на события
    on('message:new', handleNewMessage);
    socket.on('message:status_update', handleStatusUpdate); // Исправлено название
    socket.on('message:deleted', handleDeleted);

    return () => {
      off('message:new', handleNewMessage);
      socket.off('message:status_update', handleStatusUpdate);
      socket.off('message:deleted', handleDeleted);
    };
  }, [connected, authChecked, activeChat?.id, socket, on, off, handleNewMessage]);

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

  const filteredChats = chats.filter(c => c.type === activeTab);

  // В MessengerPage.tsx

  const handleDelete = (messageId: string) => {
    if (!activeChat) return;

    // Вызываем функцию из контекста (которая делает и API, и Socket)
    deleteMessage(activeChat.id, messageId);

    // Оптимистичное удаление в стейте
    setMessages(prev => prev.filter(m => m.id !== messageId));
  };

  // Прослушивание удаления от других
  useEffect(() => {
    if (!socket) return;
    const onDeleted = ({ messageId }: { messageId: string }) => {
      setMessages(prev => prev.filter(m => m.id !== messageId));
    };
    socket.on('message:deleted', onDeleted);
    return () => { socket.off('message:deleted', onDeleted); };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleEdited = ({ messageId, text }: { messageId: string, text: string }) => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text } : m));
    };

    socket.on('message:edited', handleEdited);
    return () => { socket.off('message:edited', handleEdited); };
  }, [socket]);

  if (!authChecked || loading) {
    return (
      <div className="min-h-[100dvh] bg-background-dark flex items-center justify-center">
        <div className="text-accent-neon font-mono animate-pulse">
          Connecting to Mesh Network...
        </div>
      </div>
    );
  }
  //Функция загрузки участников группы
  const fetchMembers = async (chatId: string) => {
    if (activeChat?.id === chatId && activeChat.members && activeChat.members.length > 0) {
      return;
    }
    try {
      const res = await fetch(`/api/conversations/${chatId}/members`);
      const data = await res.json();

      if (data.members) {
        // Обновляем состояние активного чата, добавляя в него участников
        setActiveChat(prev => {
          if (prev?.id === chatId) {
            return { ...prev, members: data.members };
          }
          return prev;
        });
      }
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  };

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
            onDeleteMessage={handleDelete}
            markAsRead={markAsRead}
            onEditMessage={editMessage}
            currentUserId={currentUserId}
            onFetchMembers={fetchMembers}
          />
        </div>

        {/* Дополнительная боковая панель: полностью скрыта на планшетах и мобилках */}
        <nav className="hidden lg:flex m-2 w-66 border-r border-white/10 flex-col bg-background-dark shrink-0 overflow-y-auto">
          <SidebarNav user={user} />
        </nav>
      </div>
    </div>
  );
}