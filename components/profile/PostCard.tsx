// components/profile/PostCard.tsx
'use client';

export interface Post {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  timestamp: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  liked: boolean;
}

interface PostCardProps {
  post: Post;
  onLike: () => void;
}

export default function PostCard({ post, onLike }: PostCardProps) {
  return (
    <div className="rounded-2xl bg-surface-dark overflow-hidden border border-border-dark">
      
      {/* Шапка поста */}
      <div className="p-6">
        <div className="flex gap-3 mb-4">
          <div className="size-10 rounded-full overflow-hidden">
            <img 
              className="h-full w-full object-cover" 
              src={post.author.avatar}
              alt={post.author.name}
            />
          </div>
          <div>
            <p className="font-bold text-slate-100">
              {post.author.name} 
              <span className="text-slate-500 font-normal text-sm ml-2">{post.timestamp}</span>
            </p>
            <p className="text-primary text-xs">@{post.author.username}</p>
          </div>
        </div>
        <p className="text-slate-300 leading-relaxed">{post.content}</p>
      </div>

      {/* Изображение (если есть) */}
      {post.image && (
        <img 
          className="w-full h-80 object-cover" 
          src={post.image}
          alt="Post media"
        />
      )}

      {/* Футер поста */}
      <div className="p-4 flex gap-6 text-slate-500 border-t border-border-dark">
        <button 
          className={`flex items-center gap-2 transition-colors ${
            post.liked ? 'text-primary' : 'hover:text-primary'
          }`}
          onClick={onLike}
        >
          <span className="material-symbols-outlined text-lg">
            {post.liked ? 'favorite' : 'favorite_border'}
          </span> 
          {post.likes.toLocaleString()}
        </button>
        <button className="flex items-center gap-2 hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-lg">chat_bubble</span> 
          {post.comments}
        </button>
        <button className="flex items-center gap-2 hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-lg">share</span>
        </button>
      </div>
    </div>
  );
}