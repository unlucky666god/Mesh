// components/profile/SidebarNav.tsx
'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarNavProps {
  active?: string;
  trending?: Array<{ tag: string; count: string }>;
  user?: {
    name?: string;
  } | null;
}

export default function SidebarNav({ active, trending, user }: SidebarNavProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getLinkStyles = (href: string) => {
    const isProfileLink = href.includes('@');
    let isActive = false;

    if (isProfileLink) {
      // Если ссылка содержит @, проверяем, есть ли @ в текущем пути
      isActive = pathname.includes('@');
    } else if (href === "/") {
      // Для главной оставляем строгое сравнение
      isActive = pathname === "/";
    } else {
      // Для мессенджера и других разделов
      isActive = pathname.startsWith(href);
    }

    return isActive
      ? "group flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-neon text-black font-bold shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-all"
      : "group flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-accent-neon hover:bg-white/5 transition-all";
  };

  // Пока компонент не примонтирован, рендерим пустой каркас (совпадает на SSR)
  if (!mounted) {
    return <aside className="hidden lg:flex w-64 flex-col gap-6 sticky top-28 self-start" />;
  }

  const profileHref = user?.name ? `/@${user.name}` : null;

  return (
    <aside className="hidden lg:flex w-64 flex-col gap-6 sticky top-28 self-start">
      <nav className="glass-card rounded-2xl p-4 border border-white/10 bg-background-dark/50 backdrop-blur-lg">
        <h3 className="text-xs font-black text-accent-neon uppercase tracking-widest mb-4 px-2">Navigation</h3>
        <div className="flex flex-col gap-1">
          <Link className={getLinkStyles("/")} href="/">
            <span className="material-symbols-outlined">home</span>
            <span className="text-sm font-mono uppercase">Main</span>
          </Link>
          <Link className={getLinkStyles("/messenger")} href="/messenger">
            <span className="material-symbols-outlined">forum</span>
            <span className="text-sm font-mono uppercase">Messages</span>
          </Link>
          {profileHref && (
            <Link className={getLinkStyles(profileHref)} href={profileHref}>
              <span className="material-symbols-outlined">account_circle</span>
              <span className="text-sm font-mono uppercase">Profile</span>
            </Link>
          )}
        </div>
      </nav>
    </aside>
  );
}