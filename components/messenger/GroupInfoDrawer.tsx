'use client';
import { Fragment } from 'react';
import { createPortal } from 'react-dom';

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}

interface GroupInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onRemoveMember: (id: string) => void;
  currentUserId: string | null;
  isAdmin: boolean; // Может ли текущий пользователь удалять других
}

export function GroupInfoDrawer({ isOpen, onClose, members, onRemoveMember, currentUserId, isAdmin }: GroupInfoDrawerProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Content */}
      <div className="relative w-full max-w-sm bg-surface-dark border-l border-white/10 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100">Group Info</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-accent-neon uppercase tracking-widest">Members ({members.length})</span>
          </div>

          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <img src={member.avatar || "/avatar.webp"} className="size-10 rounded-full border border-white/5" alt="" />
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      {member.name} {member.id === currentUserId && <span className="text-[10px] text-slate-500 ml-1">(You)</span>}
                    </p>
                    {/* Показываем роль только если она не MEMBER */}
                    {member.role !== 'MEMBER' && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent-neon/10 text-accent-neon font-bold border border-accent-neon/20">
                        {member.role}
                      </span>
                    )}
                  </div>
                </div>

                {/* Меню удаления (показываем если юзер админ и это не он сам) */}
                {isAdmin && member.id !== currentUserId && member.role !== 'OWNER' && (
                  <button 
                    onClick={() => {
                        if(confirm(`Remove ${member.name} from group?`)) onRemoveMember(member.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">person_remove</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}