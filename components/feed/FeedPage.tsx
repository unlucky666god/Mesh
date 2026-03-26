// app/feed/FeedPage.tsx
'use client';
import { useState, useEffect } from 'react';
import TopNav from "@/components/layout/TopNav";
import SidebarNav from "@/components/layout/SidebarNav";
import BackgroundEffect from '../layout/BackgroundEffect';
import CreatePostForm from '@/components/feed/CreatePostForm';
import PostCard, { Post } from '@/components/feed/PostCard';

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const initPage = async () => {
      try {
        // Загружаем пользователя и посты параллельно
        const [postsRes, userRes] = await Promise.all([
          fetch('/api/posts'),
          fetch('/api/auth/me')
        ]);

        if (postsRes.ok) {
          const data = await postsRes.json();
          setPosts(data.posts);
        }
        if (userRes.ok) {
          const data = await userRes.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Initialization failed:', err);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <TopNav user={user} />

      <div className="mx-auto w-full max-w-[1200px] flex flex-row px-4 lg:px-40 py-8 gap-8">
        <BackgroundEffect />

        <main className="flex-1 flex flex-col gap-8 max-w-[700px]">
          <CreatePostForm currentUserAvatar={user?.avatar} />

          <div className="flex flex-col gap-6">
            {loading ? (
              <p className="text-center text-slate-500 font-mono animate-pulse">Initializing grid data...</p>
            ) : posts.length === 0 ? (
              <p className="text-center text-slate-500 font-mono">No nodes active.</p>
            ) : (
              posts.map((post) => (
                <PostCard key={post.id} post={post} onLike={() => {}} onBookmark={() => {}} />
              ))
            )}
          </div>
        </main>
      
        <SidebarNav user={user} />
      </div>
    </div>
  );
}