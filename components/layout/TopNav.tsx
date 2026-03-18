// components/layout/TopNav.tsx
'use client';
import Link from 'next/link';
import UserSearch from '@/components/shared/UserSearch';

export default function TopNav() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-background-dark/80 backdrop-blur-md px-6 py-3 lg:px-20">
      
      {/* Логотип */}
      <Link href="/" className="flex items-center gap-4 text-accent-neon hover:opacity-80 transition-opacity">
        <div className="size-8 flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl">grid_view</span>
        </div>
        <h2 className="text-xl font-bold leading-tight tracking-tight hidden sm:block">Mesh</h2>
      </Link>

      {/* Поиск */}
      <UserSearch
        placeholder="Search the mesh..."
        className="flex-1 max-w-xl px-4"
      />

      {/* Правая часть */}
      <div className="flex items-center gap-4">
        <button className="flex size-10 items-center justify-center rounded-xl bg-surface-dark border border-white/10 text-slate-100 hover:text-accent-neon transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 size-2 bg-accent-neon rounded-full shadow-[0_0_5px_#39ff14]"></span>
        </button>
        <div className="size-10 rounded-full border-2 border-accent-neon overflow-hidden cursor-pointer hover:scale-105 transition-transform">
          <img 
            className="h-full w-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcF8aZerBNY50HF8ItgdsKL2_xC92i-RuluGbg3a3dJWw-3sl8ARFLahKr2D5nwgl2ZSd7ycKAicQmuZinAymN-_L8NH6A8J_P9YihIYo9xDIxbp-Iq0rgvpftALx02eb97LlCceFVCo8WKzAmFIJHLRz6FZ5DgurJuUhRlM479rnj1FRrW4nWRz815gNDareCgf_RKlGQ1zjuNAdZBmHZSbqlQmZSSVPv6SXH45JlgqadxXEb1sbhYQlIp36LxDqjui5n9FHOQru0"
            alt="User avatar"
          />
        </div>
      </div>
    </header>
  );
}
