// components/profile/ProfileHeader.tsx
'use client';

interface ProfileHeaderProps {
  profile: {
    name: string;
    avatar: string;
    cover: string;
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
          src={profile.cover || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAidSs22nPF55acHaQqLhPVUP6POWavetcR-u4pYkqlERs8sEqkSrUZW_GZhnNL92HOGcGxTfiiH7cmWhtGQK1Sqmmzc1hM4bfatPP-RD7ds9AVRtpsf5zJ0h-kdREgKvITI_pGHF84Dvhp5XaqG9WH21XL0GWVlSSQlu8iuddBZwhLq5K69NZotwVN4jir0tw9DFPA0Dmvv6gvFLd5mHEyY25xGlSx3YIabLhBWqqdkEszO6PwtUNGerFrRpOjTeprFgE0_6rQjpzV'}
          alt="Cover photo"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center -mt-20 relative z-10 px-4">
        <div className="size-32 lg:size-40 rounded-full border-4 border-background-dark bg-background-dark overflow-hidden shadow-2xl">
          <img 
            className="h-full w-full object-cover" 
            src={profile.avatar || 'https://lh3.googleusercontent.com/a/ACg8ocL8vGf-fJ0fUqR_V_6Y-8y_vV_VvV_VvV_VvV_V=s96-c'}
            alt={`${profile.name} avatar`}
          />
        </div>
        
        <div className="mt-4 text-center">
          <h1 className="text-3xl font-bold text-slate-100">{profile.name}</h1>
          <p className="text-accent-neon font-medium">@{profile.name}</p>
          <p className="mt-3 max-w-md text-slate-400 text-base">{profile.bio || 'Digital architect exploring the intersections of generative art and mesh networking. Building the decentralized future. ⚡️'}</p>
        </div>

        {/* Кнопки */}
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
          <button className="flex items-center justify-center rounded-xl bg-surface-dark border border-white/10 px-4 py-2.5 text-slate-100 hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined">mail</span>
          </button>
        </div>
      </div>
    </>
  );
}
