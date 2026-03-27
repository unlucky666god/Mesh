// components/messenger/CreateGroupModal.tsx
import { useState, useEffect } from 'react';

export function CreateGroupModal({ onClose }: { onClose: () => void }) {
    const [groupName, setGroupName] = useState('');
    const [friends, setFriends] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Загружаем список фолловеров (тех, на кого МЫ подписаны)
    useEffect(() => {
        fetch('/api/users/following') // Создай этот эндпоинт, если его нет
            .then(res => res.json())
            .then(data => {
                setFriends(data.following || []);
                setIsLoading(false);
            });
    }, []);

    const toggleFriend = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleCreate = async () => {
        if (!groupName || selectedIds.length === 0) return;

        const res = await fetch('/api/conversations/group', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: groupName,
                participantIds: selectedIds
            })
        });

        if (res.ok) {
            onClose();
            window.location.reload(); // Для прототипа обновим страницу, чтобы чат появился
        }
    };
    
    // Внутри CreateGroupModal
    useEffect(() => {
        fetch('/api/users/following')
            .then(res => res.json())
            .then(data => {
                // Теперь data — это сразу массив объектов пользователей
                setFriends(Array.isArray(data) ? data : []);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-background-dark border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-100">Create Group</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Название */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-accent-neon uppercase tracking-tighter">Group Name</label>
                        <input
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Neon Squad..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent-neon outline-none transition-all"
                        />
                    </div>

                    {/* Список друзей */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-accent-neon uppercase tracking-tighter">Add Friends</label>
                        <div className="max-h-48 overflow-y-auto space-y-2 pr-2 no-scrollbar">
                            {isLoading ? (
                                <div className="text-slate-500 text-sm animate-pulse">Scanning network...</div>
                            ) : friends.map(friend => (
                                <div
                                    key={friend.id} // Теперь id берем напрямую у объекта
                                    onClick={() => toggleFriend(friend.id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${selectedIds.includes(friend.id)
                                        ? 'bg-accent-neon/10 border-accent-neon/50'
                                        : 'bg-white/5 border-transparent hover:border-white/10'
                                        }`}
                                >
                                    <div className="size-10 bg-slate-800 rounded-full overflow-hidden flex-shrink-0">
                                        {friend.avatar ? (
                                            <img src={friend.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                                                {friend.name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <span className="flex-1 text-slate-200 text-sm font-medium truncate">
                                        {friend.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white/5 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl text-slate-400 hover:text-white transition-all">Cancel</button>
                    <button
                        onClick={handleCreate}
                        disabled={!groupName || selectedIds.length === 0}
                        className="flex-[2] py-3 bg-accent-neon text-black font-bold rounded-xl shadow-neon-glow disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                        Create Chat
                    </button>
                </div>
            </div>
        </div>
    );
}