// app/feed/FeedPage.tsx
'use client';
import { useState, useEffect } from 'react';
import { useSocket } from "@/context/socketContext";
import Link from 'next/link';
import TopNav from "@/components/layout/TopNav";
import SidebarNav from "@/components/layout/SidebarNav";
import BackgroundEffect from '../layout/BackgroundEffect';
import CreatePostForm from '@/components/feed/CreatePostForm';
import PostCard, { Post } from '@/components/feed/PostCard';

// Типы для постов и сторис
interface Story {
  id: string;
  username: string;
  avatar: string;
  viewed: boolean;
}

export default function FeedPage() {
  const { socket, connected } = useSocket();
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/posts');
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts);
        }
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handlePost = async () => {
    if (!postText.trim()) return;
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: postText }),
      });
      if (res.ok) {
        const data = await res.json();
        setPosts([data.post, ...posts]);
        setPostText('');
      }
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const toggleLike = (postId: string) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, liked: !post.liked }
        : post
    ));
  };

  const toggleBookmark = (postId: string) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, bookmarked: !post.bookmarked }
        : post
    ));
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">

      <TopNav />

      {/* ========== MAIN CONTENT ========== */}
      <div className="mx-auto w-full max-w-[1200px] flex flex-row px-4 lg:px-40 py-8 gap-8">

        <BackgroundEffect />

        {/* Левая колонка: Сторис + Посты */}
        <main className="flex-1 flex flex-col gap-8 max-w-[700px]">

          {/* Форма создания поста */}
          <CreatePostForm />

          {/* Лента постов */}
          <div className="flex flex-col gap-6">
            {loading ? (
              <p className="text-center text-slate-500 font-mono animate-pulse">Initializing grid data...</p>
            ) : posts.length === 0 ? (
              <p className="text-center text-slate-500 font-mono">No nodes active. Be the first to post!</p>
            ) : (
              posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onLike={toggleLike} 
                  onBookmark={toggleBookmark} 
                />
              ))
            )}
          </div>
        </main>
        <SidebarNav />
      </div>

      {/* ========== FLOATING ACTION BUTTON ========== 
      <div className="fixed bottom-8 right-8 z-50">
        <button className="size-14 rounded-full bg-accent-neon text-black flex items-center justify-center shadow-[0_0_25px_rgba(57,255,20,0.6)] hover:scale-110 transition-transform active:scale-95">
          <span className="material-symbols-outlined font-bold">edit</span>
        </button>
      </div>*/}
    </div>
  );
}
