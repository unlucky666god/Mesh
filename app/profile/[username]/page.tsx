// app/profile/[username]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import MobileNav from '@/components/layout/MobileNav';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import PostCard, { type Post } from '@/components/profile/PostCard';
import SidebarNav from '@/components/profile/SidebarNav';

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'media'>('feed');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${username}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    };
    if (username) fetchUser();
  }, [username]);

  const handleFollow = async () => {
    try {
      const res = await fetch(`/api/users/${username}/follow`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        // Update user state to reflect new follower count/status
        // For simplicity, refetch or update count manually
        setUser((prev: any) => ({
          ...prev,
          _count: {
            ...prev._count,
            followers: data.isFollowing ? prev._count.followers + 1 : prev._count.followers - 1
          },
          isFollowing: data.isFollowing
        }));
      }
    } catch (err) {
      console.error('Failed to follow user:', err);
    }
  };

  const handleLike = (postId: string) => {
    // Implement like logic
  };

  if (loading) return <div className="min-h-screen bg-background-dark flex items-center justify-center text-accent-neon font-mono animate-pulse">Accessing node ${username}...</div>;
  if (!user) return <div className="min-h-screen bg-background-dark flex items-center justify-center text-red-500 font-mono">Node ${username} not found.</div>;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Верхняя навигация */}
      <TopNav />

      <main className="flex flex-1 flex-col lg:flex-row lg:px-20 py-6 gap-8">
        
        {/* Основной контент */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Шапка профиля */}
          <ProfileHeader 
            profile={{
              ...user,
              isFollowing: user.isFollowing // Assume API returns this
            }}
            onFollow={handleFollow}
          />

          {/* Статистика */}
          <ProfileStats stats={{
            posts: user._count.posts,
            followers: user._count.followers,
            following: user._count.following
          }} />

          {/* Лента постов */}
          <div className="mt-4 flex flex-col gap-6 max-w-2xl mx-auto w-full px-4">
            
            {/* Табы */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100">Recent Activity</h3>
              <div className="flex gap-2">
                <button 
                  className={`text-sm font-semibold transition-colors ${
                    activeTab === 'feed' ? 'text-accent-neon' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  onClick={() => setActiveTab('feed')}
                >
                  Feed
                </button>
                <span className="text-slate-700">|</span>
                <button 
                  className={`text-sm font-semibold transition-colors ${
                    activeTab === 'media' ? 'text-accent-neon' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  onClick={() => setActiveTab('media')}
                >
                  Media
                </button>
              </div>
            </div>

            {/* Посты */}
            {activeTab === 'feed' && user.posts.map((post: any) => (
              <PostCard 
                key={post.id} 
                post={{
                  ...post,
                  stats: {
                    likes: post._count.likes.toString(),
                    comments: post._count.comments.toString(),
                    shares: "0"
                  }
                }}
                onLike={() => handleLike(post.id)} 
              />
            ))}

            {activeTab === 'media' && (
              <div className="text-center py-12 text-slate-500">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">photo_library</span>
                <p>No media posts yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Боковая панель (десктоп) */}
        <aside className="hidden lg:flex flex-col gap-4 w-64 sticky top-24 h-fit">
          <SidebarNav active="profile" trending={[]} />
        </aside>

      </main>

      {/* Мобильная навигация */}
      <MobileNav active="profile" />
    </div>
  );
}
