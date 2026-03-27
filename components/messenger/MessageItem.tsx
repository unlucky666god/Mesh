// components/messenger/ChatItem.tsx
'use client';

interface MessageItemProps {
    message: {
        id: string;
        text: string;
        timestamp: string;
        senderId: string;
        status: string;
        sender?: {
            name: string;
            avatar: string;
        };
    };
    isMe: boolean;
    showSenderInfo: boolean; // Включаем для групповых чатов
}

export function MessageItem({ message, isMe, showSenderInfo }: MessageItemProps) {
    return (
        <div className={`flex w-full mb-4 ${isMe ? 'justify-end' : 'justify-start items-end gap-3'}`}>

            {!isMe && showSenderInfo && (
                <div className="size-9 rounded-full bg-slate-800 border border-white/10 overflow-hidden flex-shrink-0 mb-1 shadow-sm">
                    {message.sender?.avatar ? (
                        <img src={message.sender.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 bg-slate-700 font-bold">
                            {message.sender?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                    )}
                </div>
            )}

            <div className={`flex flex-col max-w-[75%] md:max-w-[60%] ${isMe ? 'items-end' : 'items-start'}`}>

                <div className={`px-4 py-2 rounded-2xl text-sm relative transition-all ${isMe
                    ? 'bg-accent-neon text-black rounded-tr-none shadow-neon-glow'
                    : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                    }`}>

                    {/* ИМЯ: Внутри блока сверху (только для чужих сообщений) */}
                    {!isMe && showSenderInfo && (
                        <div className="text-[10px] font-black text-accent-neon mb-1 uppercase tracking-tighter opacity-80">
                            {message.sender?.name || 'Unknown User'}
                        </div>
                    )}

                    <p className="whitespace-pre-wrap break-words leading-relaxed text-[16px]">
                        {message.text}
                    </p>

                    {/* ВРЕМЯ И СТАТУС */}
                    <div className={`flex items-center gap-1 mt-1 justify-end ${isMe ? 'text-black/40' : 'text-slate-500'}`}>
                        <span className="text-[12px] font-mono">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && (
                            <span className={`material-symbols-outlined text-[8px] text-black/40`}>
                                {message.status === 'read' ? 'done_all' : 'done'}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}