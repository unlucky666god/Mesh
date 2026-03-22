// components/feed/CreatePostForm.tsx
'use client';
import { useState } from 'react';

interface CreatePostFormProps {
  onPostCreated?: (newPost: any) => void;
  currentUserAvatar?: string;
}

export default function CreatePostForm({ 
  onPostCreated, 
  currentUserAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuDWOcupY-lVeF2m__7xGAxr56tRQ5ybg7P51rG4aHjeAQAsbMv67QF6C8WTkXZFUNxZs7Y5dbGZ7Hhw8BNa_1WIgI9RfJjY6g7qnDf0zsmI4klIlu4Trag-5eYeE1n34u0EWzuzULoXrmHbjvvH99IyXyxkIyW8XB2VHUUmNdV16ZTvH1dZ7MKLVZrerEgW2K47zi_2LK85vZMKdxnOHK0Z_klAi601Y0gMT7fn8m1Z-pHg0zVOFz4gp7GS450pBl-ynhMkeMFjFBCz" 
}: CreatePostFormProps) {
  const [postText, setPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!postText.trim() || isPosting) return;
    
    setIsPosting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: postText }),
      });
      
      if (res.ok) {
        const data = await res.json();
        // Уведомляем родительский компонент
        onPostCreated?.(data.post);
        // Очищаем форму
        setPostText('');
      }
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setIsPosting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Отправка по Ctrl+Enter или Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handlePost();
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col gap-4">
      <div className="flex gap-4">
        <div
          className="size-12 rounded-full bg-cover bg-center shrink-0 border border-white/10"
          style={{ backgroundImage: `url("${currentUserAvatar}")` }}
        />
        <textarea
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-slate-500 focus:ring-1 focus:ring-accent-neon focus:border-accent-neon transition-all resize-none min-h-[80px] outline-none"
          placeholder="Share something new..."
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPosting}
        />
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex gap-2">
          {/*<button 
            className="p-2 text-slate-400 hover:text-accent-neon hover:bg-white/5 rounded-lg transition-all disabled:opacity-50"
            disabled={isPosting}
            title="Add image"
          >
            <span className="material-symbols-outlined">image</span>
          </button>
          <button 
            className="p-2 text-slate-400 hover:text-accent-neon hover:bg-white/5 rounded-lg transition-all disabled:opacity-50"
            disabled={isPosting}
            title="Add video"
          >
            <span className="material-symbols-outlined">videocam</span>
          </button>
          <button 
            className="p-2 text-slate-400 hover:text-accent-neon hover:bg-white/5 rounded-lg transition-all disabled:opacity-50"
            disabled={isPosting}
            title="Add location"
          >
            <span className="material-symbols-outlined">location_on</span>
          </button>*/}
        </div>
        
        <button
          onClick={handlePost}
          disabled={!postText.trim() || isPosting}
          className="bg-accent-neon text-black font-bold px-8 py-2 rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
        >
          {isPosting ? (
            <>
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              Posting...
            </>
          ) : 'Post'}
        </button>
      </div>
      
      {/*<p className="text-[10px] text-slate-600 text-right">
        Press <kbd className="px-1 py-0.5 bg-white/10 rounded">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-white/10 rounded">Enter</kbd> to post
      </p>*/}
    </div>
  );
}