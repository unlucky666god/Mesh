// app/profile/[username]/page.tsx
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import MobileNav from '@/components/layout/MobileNav';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import PostCard, { type Post } from '@/components/profile/PostCard';
import SidebarNav from '@/components/profile/SidebarNav';

// Моковые данные (замените на API-запрос)
const PROFILE_DATA = {
  id: 'user-123',
  name: 'Alex Rivers',
  username: 'arivers_mesh',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4hCK_aqL6XfscbjEbipmUfth-BHRvOO3OX8X9dYkJWTLmDVeJEJzLDwIlZnlw4ejfN8iB1yKuD24IikiUpLFyqIq8555G2g_q_jINTCvjBsISdla643AB2bkx84ubbJDBSjMiR2GggvTjJVXBreNDp202OekRlQMmKh8suhyoBX4dfkeMMnNh4ADn2qCKSpoWfjo3wfnqHh0Wc-1tE1vUZs8yBfbrgFI3drDQPEp37fRhuml9_VCAVqtO11hXzHzLGTtyYGzJji7Q',
  coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAidSs22nPF55acHaQqLhPVUP6POWavetcR-u4pYkqlERs8sEqkSrUZW_GZhnNL92HOGcGxTfiiH7cmWhtGQK1Sqmmzc1hM4bfatPP-RD7ds9AVRtpsf5zJ0h-kdREgKvITI_pGHF84Dvhp5XaqG9WH21XL0GWVlSSQlu8iuddBZwhLq5K69NZotwVN4jir0tw9DFPA0Dmvv6gvFLd5mHEyY25xGlSx3YIabLhBWqqdkEszO6PwtUNGerFrRpOjTeprFgE0_6rQjpzV',
  bio: 'Digital architect exploring the intersections of generative art and mesh networking. Building the decentralized future. ⚡️',
  stats: { posts: 142, followers: '12.8k', following: 842 },
  isFollowing: false,
};

const POSTS: Post[] = [
  {
    id: 'post-1',
    author: {
      name: 'Alex Rivers',
      username: 'arivers_mesh',
      avatar: PROFILE_DATA.avatar,
    },
    timestamp: '2h ago',
    content: "Just deployed the new node clustering algorithm. The latency drops are significant! Mesh architecture is truly the future of local connectivity. #web3 #meshnetwork",
    likes: 243,
    comments: 18,
    liked: false,
  },
  {
    id: 'post-2',
    author: {
      name: 'Alex Rivers',
      username: 'arivers_mesh',
      avatar: PROFILE_DATA.avatar,
    },
    timestamp: '6h ago',
    content: "New setup aesthetic. Neon vibes all night. 🧪",
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDj6NVqvTW42CiVytxpli6Z9aKt-CZjKXQjp5_hQuVsh9o9ch651TRDJGGUS-FM4Fl-cbsAEmI29w25iO5-zmbaWX7pFdFhBaRJM6-MX2GS82LsCPJU8DOdNZqg5OSlxBqzfPbXd1-j_Wx88ATP9r2cchm7lo-y9EKMz0Ds3N-Qw-eNQcnp3scbOcbkS7rI2GyBr_5Klp73ZCpPYqU492nx_nOR6tzXwvdEPEqSZqx9dqYTe_V0TFRlB8LzKjzNoE5GJBLeSD3wYRJU',
    likes: 1200,
    comments: 42,
    liked: false,
  },
];

const TRENDING = [
  { tag: '#GenerativeArt', count: '2.4k meshers' },
  { tag: '#Decentralized', count: '1.8k meshers' },
  { tag: '#NeonNodes', count: '942 meshers' },
];

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  
  const [profile, setProfile] = useState(PROFILE_DATA);
  const [posts, setPosts] = useState(POSTS);
  const [activeTab, setActiveTab] = useState<'feed' | 'media'>('feed');

  const handleFollow = () => {
    setProfile(prev => ({ ...prev, isFollowing: !prev.isFollowing }));
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      
      {/* Верхняя навигация */}
      <TopNav />

      <main className="flex flex-1 flex-col lg:flex-row lg:px-20 py-6 gap-8">
        
        {/* Основной контент */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Шапка профиля */}
          <ProfileHeader 
            profile={profile}
            onFollow={handleFollow}
          />

          {/* Статистика */}
          <ProfileStats stats={profile.stats} />

          {/* Лента постов */}
          <div className="mt-4 flex flex-col gap-6 max-w-2xl mx-auto w-full px-4">
            
            {/* Табы */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100">Recent Activity</h3>
              <div className="flex gap-2">
                <button 
                  className={`text-sm font-semibold transition-colors ${
                    activeTab === 'feed' ? 'text-primary' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  onClick={() => setActiveTab('feed')}
                >
                  Feed
                </button>
                <span className="text-slate-700">|</span>
                <button 
                  className={`text-sm font-semibold transition-colors ${
                    activeTab === 'media' ? 'text-primary' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  onClick={() => setActiveTab('media')}
                >
                  Media
                </button>
              </div>
            </div>

            {/* Посты */}
            {activeTab === 'feed' && posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
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
          <SidebarNav active="profile" trending={TRENDING} />
        </aside>

      </main>

      {/* Мобильная навигация */}
      <MobileNav active="profile" />
    </div>
  );
}