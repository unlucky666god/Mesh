// components/profile/ProfileStats.tsx
'use client';

interface ProfileStatsProps {
  stats: {
    posts: number;
    followers: string;
    following: number;
  };
}

export default function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-8 py-6 border-y border-border-dark w-full max-w-2xl mx-auto px-4">
      <div className="text-center">
        <p className="text-2xl font-bold text-slate-100">{stats.posts}</p>
        <p className="text-slate-500 text-sm uppercase tracking-widest">Posts</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-slate-100">{stats.followers}</p>
        <p className="text-slate-500 text-sm uppercase tracking-widest">Followers</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-slate-100">{stats.following}</p>
        <p className="text-slate-500 text-sm uppercase tracking-widest">Following</p>
      </div>
    </div>
  );
}