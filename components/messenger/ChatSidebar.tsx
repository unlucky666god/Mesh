// components/messenger/ChatSidebar.tsx
'use client';
import { ChatItem } from './ChatItem';

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

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId?: string;
  onChatSelect: (chat: Chat) => void;
  activeTab: 'PRIVATE' | 'GROUP';
  onTabChange: (tab: 'PRIVATE' | 'GROUP') => void;
  className?: string; // Добавлено для мобильной адаптации
}

export function ChatSidebar({
  chats,
  activeChatId,
  onChatSelect,
  activeTab,
  onTabChange,
  className = ''
}: ChatSidebarProps) {
  return (
    <aside className={`w-full md:w-80 border-r border-white/10 flex flex-col bg-surface-dark/50 shrink-0 ${className}`}>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-100">Messages</h3>
          {/*<button className="size-8 bg-accent-neon/10 text-accent-neon rounded-lg flex items-center justify-center hover:bg-accent-neon/20 transition-all">
            <span className="material-symbols-outlined text-xl">edit_square</span>
          </button>*/}
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-background-dark/50 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => onTabChange('PRIVATE')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'PRIVATE' 
                ? 'bg-accent-neon text-black shadow-neon-glow' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Direct
          </button>
          <button
            onClick={() => onTabChange('GROUP')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'GROUP' 
                ? 'bg-accent-neon text-black shadow-neon-glow' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Groups
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
        {chats.length > 0 ? (
          chats.map((chat) => (
            <ChatItem
              key={chat.id}
              {...chat}
              active={activeChatId === chat.id}
              onClick={() => onChatSelect(chat)}
            />
          ))
        ) : (
          <div className="text-center py-10 text-slate-500 text-sm italic">
            No {activeTab === 'PRIVATE' ? 'direct' : 'group'} messages yet
          </div>
        )}
      </div>
    </aside>
  );
}