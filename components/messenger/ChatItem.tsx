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
          src={avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuDWOcupY-lVeF2m__7xGAxr56tRQ5ybg7P51rG4aHjeAQAsbMv67QF6C8WTkXZFUNxZs7Y5dbGZ7Hhw8BNa_1WIgI9RfJjY6g7qnDf0zsmI4klIlu4Trag-5eYeE1n34u0EWzuzULoXrmHbjvvH99IyXyxkIyW8XB2VHUUmNdV16ZTvH1dZ7MKLVZrerEgW2K47zi_2LK85vZMKdxnOHK0Z_klAi601Y0gMT7fn8m1Z-pHg0zVOFz4gp7GS450pBl-ynhMkeMFjFBCz"}
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
            text-[18px] font-bold transition-colors shrink-0
            ${active 
              ? 'text-accent-neon' 
              : 'text-white md:text-slate-500' 
            }
          `}>
            {name}
          </p>
          <span className={`
            text-[10px] font-bold transition-colors shrink-0 ml-2
            ${active 
              ? 'text-accent-neon' 
              : 'text-white md:text-slate-500' 
            }
          `}>
            {time}
          </span>
        </div>
        <p className={`
          text-xs truncate font-medium transition-colors mt-0.5
          ${active 
            ? 'text-accent-neon' 
            : 'text-white/90 md:text-slate-500'
          }
        `}>
          {lastMessage}
        </p>
      </div>
    </div>
  );
}