// app/feed/FeedPage.tsx
'use client';
import { useState, useEffect } from 'react';
import { useSocket } from "@/context/socketContext";
import Link from 'next/link';

// Типы для постов и сторис
interface Story {
  id: string;
  username: string;
  avatar: string;
  viewed: boolean;
}

interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    location?: string;
    time?: string;
  };
  content: string;
  image?: string;
  aspectRatio?: string;
  _count: {
    likes: number;
    comments: number;
    shares?: number;
  };
  liked?: boolean;
  bookmarked?: boolean;
  createdAt: string;
}

export default function FeedPage() {
  const { socket, connected } = useSocket();
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!socket) return;

    // Слушаем новые сообщения прямо здесь, в ленте!
    socket.on("message:new", (data) => {
      console.log("Новое сообщение пришло, пока ты листал ленту:", data);
      // Тут можно обновить стейт уведомлений
    });

    return () => { socket.off("message:new"); };
  }, [socket]);

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

      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background-dark/80 backdrop-blur-md px-6 lg:px-40 py-4">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">

          {/* Логотип */}
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3">
              <div className="size-10 flex items-center justify-center bg-accent-neon rounded-lg text-black shadow-[0_0_15px_rgba(57,255,20,0.5)]">
                <span className="font-mono font-extrabold text-xl">M</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tighter text-white font-mono">
                MESH<span className="text-accent-neon">.</span>
              </h1>
            </div>
          </div>

          {/* Правая часть: поиск, уведомления, аватар */}
          <div className="flex items-center gap-6">

            {/* Поиск */}
            <div className="hidden sm:flex bg-white/5 border border-white/10 rounded-full px-4 py-1.5 items-center gap-2 focus-within:border-accent-neon transition-all">
              <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-sm w-40 lg:w-64 text-white placeholder:text-slate-500 outline-none"
                placeholder="Explore Mesh..."
                type="text"
              />
            </div>

            {/* Уведомления */}
            <button className="relative p-2 text-slate-400 hover:text-accent-neon transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-accent-neon rounded-full shadow-[0_0_5px_#39ff14]"></span>
            </button>

            {/* Аватар пользователя */}
            <div className="size-10 rounded-full border-2 border-accent-neon/50 p-0.5 hover:border-accent-neon transition-all cursor-pointer">
              <div
                className="w-full h-full rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAy4RRG-bT7iAihY2K0fqJcPvoRu3Spz-z0k5DOMmu2AMoej0LM_vfh7YF0nWITTelm7le9lwaIsxjv3l9PKheCZqR3fupEjovi9jQWCrAaZkVXAGrAaZLjOBna4jnhphQuOyC5MfIdt2fm6DOuuwvrXviq1Hg4VjaSiZ98jSuSta21MJnQuH1d6PuHuHS4cgXsdFJC7XZT782oVXKAMTBmaEWzeL4niP0_rwyBhuXq3SXq6_XQcYH-bODwo0oZuUB8VNhNDKlMW4p6")` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ========== MAIN CONTENT ========== */}
      <div className="mx-auto w-full max-w-[1200px] flex flex-row px-4 lg:px-40 py-8 gap-8">

        {/* Левая колонка: Сторис + Посты */}
        <main className="flex-1 flex flex-col gap-8 max-w-[700px]">

          {/* Форма создания поста */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col gap-4">
            <div className="flex gap-4">
              <div
                className="size-12 rounded-full bg-cover bg-center shrink-0"
                style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDWOcupY-lVeF2m__7xGAxr56tRQ5ybg7P51rG4aHjeAQAsbMv67QF6C8WTkXZFUNxZs7Y5dbGZ7Hhw8BNa_1WIgI9RfJjY6g7qnDf0zsmI4klIlu4Trag-5eYeE1n34u0EWzuzULoXrmHbjvvH99IyXyxkIyW8XB2VHUUmNdV16ZTvH1dZ7MKLVZrerEgW2K47zi_2LK85vZMKdxnOHK0Z_klAi601Y0gMT7fn8m1Z-pHg0zVOFz4gp7GS450pBl-ynhMkeMFjFBCz")` }}
              />
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-slate-500 focus:ring-1 focus:ring-accent-neon focus:border-accent-neon transition-all resize-none min-h-[80px] outline-none"
                placeholder="Share something new..."
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-accent-neon hover:bg-white/5 rounded-lg transition-all">
                  <span className="material-symbols-outlined">image</span>
                </button>
                <button className="p-2 text-slate-400 hover:text-accent-neon hover:bg-white/5 rounded-lg transition-all">
                  <span className="material-symbols-outlined">videocam</span>
                </button>
                <button className="p-2 text-slate-400 hover:text-accent-neon hover:bg-white/5 rounded-lg transition-all">
                  <span className="material-symbols-outlined">location_on</span>
                </button>
              </div>
              <button
                onClick={handlePost}
                disabled={!postText.trim()}
                className="bg-accent-neon text-black font-bold px-8 py-2 rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Post
              </button>
            </div>
          </div>

          {/* Лента постов */}
          <div className="flex flex-col gap-6">
            {loading ? (
              <p className="text-center text-slate-500 font-mono animate-pulse">Initializing grid data...</p>
            ) : posts.length === 0 ? (
              <p className="text-center text-slate-500 font-mono">No nodes active. Be the first to post!</p>
            ) : posts.map((post) => (
              <article
                key={post.id}
                className="glass-card rounded-2xl border border-white/10 overflow-hidden neon-border-hover transition-all group"
              >
                {/* Шапка поста */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="size-10 rounded-full bg-cover bg-center border border-white/10"
                      style={{ backgroundImage: `url("${post.author.avatar || 'https://lh3.googleusercontent.com/a/ACg8ocL8vGf-fJ0fUqR_V_6Y-8y_vV_VvV_VvV_VvV_V=s96-c'}")` }}
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-accent-neon transition-colors">
                        {post.author.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold">
                        {post.author.location || 'Global Mesh'} • {post.author.time || new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button className="text-slate-500 hover:text-white transition-colors">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </div>

                {/* Контент поста */}
                <div className="px-4 pb-4">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {post.content.split(' ').map((word, i) =>
                      word.startsWith('#') ? (
                        <span key={i} className="text-accent-neon font-bold">{word} </span>
                      ) : word + ' '
                    )}
                  </p>
                </div>

                {/* Изображение поста */}
                {post.image && (
                  <div className="px-4 pb-4">
                    <div
                      className={`w-full rounded-xl bg-cover bg-center border border-white/5 ${post.aspectRatio || 'aspect-video'}`}
                      style={{ backgroundImage: `url("${post.image}")` }}
                    />
                  </div>
                )}

                {/* Футер поста: лайки, комментарии, шеры */}
                <div className="p-4 flex items-center justify-between border-t border-white/5 bg-white/[0.02]">
                  <div className="flex gap-6">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-2 transition-all ${post.liked ? 'text-accent-neon' : 'text-slate-400 hover:text-accent-neon'}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {post.liked ? 'favorite' : 'favorite_border'}
                      </span>
                      <span className="text-xs font-bold">{post._count.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-all">
                      <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                      <span className="text-xs font-bold">{post._count.comments}</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>

        {/* ========== SIDEBAR (только desktop) ========== */}
        <aside className="hidden lg:flex w-64 flex-col gap-6 sticky top-28 self-start">

          {/* Навигация */}
          <nav className="glass-card rounded-2xl p-4 border border-white/10">
            <h3 className="text-xs font-black text-accent-neon uppercase tracking-widest mb-4 px-2">Navigation</h3>
            <div className="flex flex-col gap-1">
              <Link className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-neon text-black font-bold shadow-neon-glow transition-all" href="/">
                <span className="material-symbols-outlined">home</span>
                <span className="text-sm">Home</span>
              </Link>
              <Link className="group flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-accent-neon hover:bg-white/5 transition-all" href="/messenger">
                <span className="material-symbols-outlined">forum</span>
                <span className="text-sm">Messenger</span>
              </Link>
              <a className="group flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-accent-neon hover:bg-white/5 transition-all" href="#">
                <span className="material-symbols-outlined">explore</span>
                <span className="text-sm">Discover</span>
              </a>
              <a className="group flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-accent-neon hover:bg-white/5 transition-all" href="#">
                <span className="material-symbols-outlined">settings</span>
                <span className="text-sm">Settings</span>
              </a>
            </div>
          </nav>
        </aside>
      </div>

      {/* ========== FLOATING ACTION BUTTON ========== */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="size-14 rounded-full bg-accent-neon text-black flex items-center justify-center shadow-[0_0_25px_rgba(57,255,20,0.6)] hover:scale-110 transition-transform active:scale-95">
          <span className="material-symbols-outlined font-bold">edit</span>
        </button>
      </div>
    </div>
  );
}
