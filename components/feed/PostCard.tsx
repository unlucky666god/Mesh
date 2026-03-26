// components/feed/PostCard.tsx
'use client';
import Link from "next/link";

// Выносим интерфейс, чтобы его можно было импортировать в другие места
export interface Post {
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

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
}

export default function PostCard({ post, onLike, onBookmark }: PostCardProps) {
  const profileHref = `/@${post.author.name}`;
  return (
    <article className="glass-card rounded-2xl border border-white/10 overflow-hidden neon-border-hover transition-all group">
      {/* Шапка поста */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={post.author.avatar || "/avatar.webp"} alt="user avatar" className="size-10 rounded-full bg-cover bg-center border border-white/10" />
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-accent-neon transition-colors">
              {post.author.name}
            </h4>
            <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold">
              {post.author.time || new Date(post.createdAt).toLocaleDateString()}
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

      {/* Футер поста */}
      <div className="p-4 flex items-center justify-between border-t border-white/5 bg-white/[0.02]">
        <div className="flex gap-6">
          <button
            onClick={() => onLike(post.id)}
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
        
        {/* Можно добавить кнопку закладки, если она нужна в UI */}
        <button 
          onClick={() => onBookmark(post.id)}
          className={`transition-all ${post.bookmarked ? 'text-accent-neon' : 'text-slate-400 hover:text-white'}`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {post.bookmarked ? 'bookmark' : 'bookmark_border'}
          </span>
        </button>
      </div>
    </article>
  );
}