// components/profile/ProfileHeader.tsx
'use client';

interface ProfileHeaderProps {
  profile: {
    name: string;
    avatar: string;
    cover: string;
    bio: string;
    isFollowing: boolean;
    isMe?: boolean;
  };
  onFollow: () => void;
  onMessage: () => void;
}

export default function ProfileHeader({ profile, onFollow, onMessage }: ProfileHeaderProps) {
  return (
    <>
      {/* Cover Photo */}
      <div className="relative w-full rounded-2xl overflow-hidden h-64 lg:h-80 bg-surface-dark group">
        <img 
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
          src={profile.cover || "/cover.webp"}
          alt="Cover photo"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center -mt-20 relative z-10 px-4">
        <div className="size-32 lg:size-40 rounded-full border-4 border-background-dark bg-background-dark overflow-hidden shadow-2xl">
          <img 
            className="h-full w-full object-cover" 
            src={profile.avatar || "/avatar.webp"}
            alt={`${profile.name} avatar`}
          />
        </div>
        
        <div className="mt-4 text-center">
          <h1 className="text-4xl font-bold text-slate-100 text-accent-neon">@{profile.name}</h1>
          <p className="mt-3 max-w-md text-slate-400 text-base">{profile.bio || 'Dream. Create. Share.'}</p>
        </div>

        {/* Кнопки */}
        {!profile.isMe && (
          <div className="flex gap-3 mt-6">
            <button 
              className={`flex items-center justify-center rounded-xl px-8 py-2.5 font-bold transition-all neon-glow ${
                profile.isFollowing 
                  ? 'bg-surface-dark border border-white/10 text-slate-100 hover:bg-white/5' 
                  : 'bg-accent-neon text-background-dark hover:brightness-110'
              }`}
              onClick={onFollow}
            >
              {profile.isFollowing ? 'Following' : 'Follow'}
            </button>
            <button 
              className="flex items-center justify-center rounded-xl bg-surface-dark border border-white/10 px-4 py-2.5 text-slate-100 hover:bg-white/5 transition-all"
              onClick={onMessage}
            >
              <span className="material-symbols-outlined">mail</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
