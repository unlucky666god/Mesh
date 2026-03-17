// components/messenger/ChatItem.tsx
'use client';

interface ChatItemProps {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  online: boolean;
  active: boolean;
  onClick: () => void;
}

export function ChatItem({
  id,
  name,
  avatar,
  lastMessage,
  time,
  online,
  active,
  onClick,
}: ChatItemProps) {
  return (
    <div
      onClick={onClick}
      className={`
        group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-l-4
        ${active 
          ? 'bg-accent-neon/10 border-accent-neon' 
          : 'border-transparent hover:bg-slate-200 dark:hover:bg-accent-dark'
        }
      `}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Аватар */}
      <div className="relative shrink-0">
        <img 
          className="size-12 rounded-full object-cover"
          src={avatar}
          alt={`${name} avatar`}
        />
        {online && (
          <div className="absolute bottom-0 right-0 size-3 bg-accent-neon border-2 border-surface-dark rounded-full"></div>
        )}
      </div>

      {/* Контент */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <p className={`
            font-semibold text-sm truncate transition-colors
            ${active ? 'text-accent-neon' : 'text-slate-900 dark:text-slate-100'}
          `}>
            {name}
          </p>
          <span className={`
            text-[10px] font-bold transition-colors
            ${active ? 'text-accent-neon' : 'text-slate-500'}
          `}>
            {time}
          </span>
        </div>
        <p className={`
          text-xs truncate font-medium transition-colors
          ${active ? 'text-accent-neon' : 'text-slate-500'}
        `}>
          {lastMessage}
        </p>
      </div>
    </div>
  );
}