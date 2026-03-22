// components/layout/MobileNav.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileNav() {
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => data && setUsername(data.user.name));
  }, []);

  if (!mounted || ['/login', '/register'].includes(pathname)) return null;

  const items = [
    { id: 'home', icon: 'home', href: '/' },
    { id: 'messenger', icon: 'chat_bubble', href: '/messenger' },
    { id: 'profile', icon: 'person', href: username ? `/profile/${username}` : '#' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-black/80 backdrop-blur-xl border-t border-white/10 pb-6 pt-3 px-4">
      {items.map((item) => (
        <Link key={item.id} href={item.href} className="flex flex-col items-center p-2">
          <span className={`material-symbols-outlined ${pathname === item.href ? 'text-accent-neon' : 'text-slate-500'}`}>
            {item.icon}
          </span>
        </Link>
      ))}
    </nav>
  );
}