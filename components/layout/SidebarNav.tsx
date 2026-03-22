// components/profile/SidebarNav.tsx
'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarNavProps {
  active: string;
  trending: Array<{ tag: string; count: string }>;
}

export default function SidebarNav({ active, trending }: SidebarNavProps) {
  const pathname = usePathname(); // Получаем текущий путь (например, "/" или "/messenger")

  // Вспомогательная функция для стилей
  const getLinkStyles = (href: string) => {
    const isActive = pathname === href;
    
    return isActive
      ? "group flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-neon text-black font-bold shadow-neon-glow transition-all"
      : "group flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-accent-neon hover:bg-white/5 transition-all";
  };
  return (
    <>
      {/* ========== SIDEBAR (только desktop) ========== */}
      <aside className="hidden lg:flex w-64 flex-col gap-6 sticky top-28 self-start">

        {/* Навигация */}
        <nav className="glass-card rounded-2xl p-4 border border-white/10">
          <h3 className="text-xs font-black text-accent-neon uppercase tracking-widest mb-4 px-2">Navigation</h3>
          <div className="flex flex-col gap-1">
            <Link className={getLinkStyles("/")} href="/">
              <span className="material-symbols-outlined">home</span>
              <span className="text-sm">Home</span>
            </Link>
            <Link className={getLinkStyles("/messenger")} href="/messenger">
              <span className="material-symbols-outlined">forum</span>
              <span className="text-sm">Messenger</span>
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
}