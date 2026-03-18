// components/profile/ProfileHeader.tsx
'use client';

interface ProfileHeaderProps {
  profile: {
    name: string;
    username: string;
    avatar: string;
    coverImage: string;
    bio: string;
    isFollowing: boolean;
  };
  onFollow: () => void;
}

export default function ProfileHeader({ profile, onFollow }: ProfileHeaderProps) {
  return (
    <>
      {/* Cover Photo */}
      <div className="relative w-full rounded-2xl overflow-hidden h-64 lg:h-80 bg-surface-dark group">
        <img 
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
          src={profile.coverImage}
          alt="Cover photo"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center -mt-20 relative z-10 px-4">
        <div className="size-32 lg:size-40 rounded-full border-4 border-background-dark bg-background-dark overflow-hidden shadow-2xl">
          <img 
            className="h-full w-full object-cover" 
            src={profile.avatar}
            alt={`${profile.name} avatar`}
          />
        </div>
        
        <div className="mt-4 text-center">
          <h1 className="text-3xl font-bold text-slate-100">{profile.name}</h1>
          <p className="text-primary font-medium">@{profile.username}</p>
          <p className="mt-3 max-w-md text-slate-400 text-base">{profile.bio}</p>
        </div>

        {/* Кнопки */}
        <div className="flex gap-3 mt-6">
          <button 
            className={`flex items-center justify-center rounded-xl px-8 py-2.5 font-bold transition-all neon-glow ${
              profile.isFollowing 
                ? 'bg-surface-dark border border-border-dark text-slate-100 hover:bg-border-dark' 
                : 'bg-primary text-background-dark hover:brightness-110'
            }`}
            onClick={onFollow}
          >
            {profile.isFollowing ? 'Following' : 'Follow'}
          </button>
          <button className="flex items-center justify-center rounded-xl bg-surface-dark border border-border-dark px-4 py-2.5 text-slate-100 hover:bg-border-dark transition-all">
            <span className="material-symbols-outlined">mail</span>
          </button>
        </div>
      </div>
    </>
  );
}