'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Chau_Philomene_One } from 'next/font/google';

export default function EditProfilePage() {
  const router = useRouter();

  // Состояние полей профиля
  const [formData, setFormData] = useState({
    name: '',
    alias: '',
    bio: '',
    phone: '',
    avatar: '',
    cover: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setName] = useState<string | null>(null);
  const [newName, setNewName] = useState<string | null>(null);

  // 1. Загружаем текущие данные пользователя при входе
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (res.ok) {
          const newUsername = formData.name.replace('@', '');
          setFormData({
            name: data.user.name || '',
            alias: data.user.name || '',
            bio: data.user.bio || '',
            phone: data.user.phone || '',
            avatar: data.user.avatar || '/avatar.webp',
            cover: data.user.cover || '/cover.webp'
          });
          setName(data.user.name);
        }
      } catch (err) {
        console.error("FETCH_ERROR: UNABLE_TO_SYNC_PROFILE", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
    if (error) setError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/users/${username}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "UPLINK_CRITICAL_ERROR");

      setHasUnsavedChanges(false);
      setNewName(formData.name);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-20 text-[#39FF14] animate-pulse">INITIALIZING_DATA_STREAM...</div>;

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white font-mono selection:bg-[#39FF14] selection:text-black">
      <style jsx>{`
        .mesh-grid {
          background-image: linear-gradient(to right, rgba(57, 255, 20, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(57, 255, 20, 0.05) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .neon-text-glow {
          text-shadow: 0 0 8px rgba(57, 255, 20, 0.5);
        }
      `}</style>

      {/* HERO / COVER SECTION */}
      <div className="relative h-64 w-full bg-black mesh-grid overflow-hidden group">
        <img alt="Cover" className="w-full h-full object-cover opacity-30 grayscale" src={formData.cover} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent"></div>

        {/* Кнопка смены обложки */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <label className="p-4 border border-[#39FF14]/50 bg-black/80 backdrop-blur-md cursor-pointer hover:border-[#39FF14] transition-all">
            <span className="material-symbols-outlined text-[#39FF14] mr-2">upload_file</span>
            <span className="text-[10px] uppercase tracking-widest text-[#39FF14]">UPDATE_MANIFEST_COVER</span>
            <input type="file" className="hidden" accept="image/*" />
          </label>
        </div>

        <div className="absolute bottom-20 left-12">
          <h1 className="text-4xl font-bold tracking-tighter text-white uppercase">
            Mesh // <span className="text-[#39FF14] neon-text-glow">Edit_Node</span>
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 -mt-16 relative z-10 pb-40">
        {/* AVATAR BLOCK */}
        <div className="flex items-end gap-8 mb-12">
          <div className="relative group">
            <div className="w-32 h-32 p-0.5 bg-[#39FF14]/30 shadow-[0_0_20px_rgba(57,255,20,0.2)]">
              <div className="w-full h-full overflow-hidden bg-zinc-900 border border-[#39FF14]/50 relative">
                <img alt="Avatar" className="w-full h-full object-cover" src={formData.avatar} />
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                  <span className="material-symbols-outlined text-[#39FF14] scale-150">memory</span>
                  <input type="file" className="hidden" accept="image/*" />
                </label>
              </div>
            </div>
          </div>
          <div className="pb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-[#39FF14]"></span>
              <p className="text-[10px] text-[#39FF14] uppercase tracking-[0.3em]">NODE_STATUS: ONLINE</p>
            </div>
            <p className="text-zinc-500 text-[10px] border-l border-zinc-800 pl-4 italic">
              "Awaiting core synchronization..."
            </p>
          </div>
        </div>

        {/* FORMS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-8 space-y-8 bg-zinc-900/40 p-8 border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-[#39FF14] text-sm">settings_ethernet</span>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em]">PRIMARY_DATA</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-[0.2em] text-zinc-500">IDENTIFIER (USERNAME)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#39FF14] text-[16px]">@</span>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-black border border-white/10 py-3 pl-10 pr-4 text-xs focus:border-[#39FF14] transition-all outline-none text-white uppercase"
                    type="text"
                  />
                </div>
              </div>
              {/*<div className="space-y-2">
                <label className="text-[9px] uppercase tracking-[0.2em] text-zinc-500">DISPLAY_ALIAS</label>
                <input 
                  name="alias"
                  value={formData.alias}
                  onChange={handleChange}
                  className="w-full bg-black border border-white/10 py-3 px-4 text-xs focus:border-[#39FF14] transition-all outline-none text-white" 
                  type="text" 
                />
              </div>*/}
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.2em] text-zinc-500">BIO_BUFFER</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full bg-black border border-white/10 py-4 px-4 text-xs focus:border-[#39FF14] transition-all outline-none text-white resize-none leading-relaxed"
                rows={4}
              />
            </div>
          </section>

          <section className="lg:col-span-4 space-y-6 bg-zinc-900/40 p-8 border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-[#39FF14] text-sm">hub</span>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em]">UPLINK_GATES</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-[0.2em] text-zinc-500">PHONE_LINK</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+X XXX XXX XX XX"
                  className="w-full bg-black border border-white/10 py-3 px-4 text-[10px] focus:border-[#39FF14] outline-none text-[#39FF14]"
                />
              </div>
            </div>
          </section>
        </div>

        {/* ACTIONS BAR */}
        <div className="fixed bottom-0 left-0 right-0 lg:left-0 bg-black/80 backdrop-blur-xl border-t border-white/10 p-6 flex justify-between items-center z-40">
          <div className="flex items-center gap-6">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-red-500 animate-ping"></span>
                <p className="text-[9px] text-red-500 uppercase tracking-[0.4em] hidden sm:block">UNSAVED_DATA_DETECTED</p>
              </div>
            )}
            {error && <p className="text-[9px] text-red-500 uppercase tracking-widest">ERROR: {error}</p>}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                const target = newName || username;
                router.push(`/@${target}`);
              }
              }
              className="text-[10px] font-bold uppercase tracking-[0.3em] px-6 py-4 text-zinc-500 hover:text-white transition-all"
            >
              ABORT
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="text-[10px] font-bold uppercase tracking-[0.3em] px-10 py-4 bg-[#39FF14] text-black shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
            >
              {isSaving ? 'SYNCING...' : 'COMMIT_TO_MAINFRAME'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}