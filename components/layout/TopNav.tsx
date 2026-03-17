// components/layout/TopNav.tsx
'use client';

export default function TopNav() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border-dark bg-background-dark/80 backdrop-blur-md px-6 py-3 lg:px-20">
      
      {/* Логотип */}
      <div className="flex items-center gap-4 text-primary">
        <div className="size-8 flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl">grid_view</span>
        </div>
        <h2 className="text-xl font-bold leading-tight tracking-tight hidden sm:block">Mesh</h2>
      </div>

      {/* Поиск */}
      <div className="flex flex-1 justify-center max-w-xl px-4">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
          <input 
            className="w-full rounded-xl border-none bg-surface-dark py-2 pl-10 pr-4 text-slate-100 focus:ring-1 focus:ring-primary placeholder:text-slate-500 text-sm outline-none" 
            placeholder="Search the mesh..." 
            type="text"
          />
        </div>
      </div>

      {/* Правая часть */}
      <div className="flex items-center gap-4">
        <button className="flex size-10 items-center justify-center rounded-xl bg-surface-dark text-slate-100 hover:text-primary transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 size-2 bg-primary rounded-full"></span>
        </button>
        <div className="size-10 rounded-full border-2 border-primary overflow-hidden cursor-pointer">
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