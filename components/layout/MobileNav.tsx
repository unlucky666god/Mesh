// components/layout/MobileNav.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function MobileNav() {
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);

  const hideOnPaths = ['/login', '/register'];

  if (hideOnPaths.includes(pathname)) {
    return null;
  }

  // Получаем данные пользователя при монтировании
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUsername(data.user.name);
        }
      } catch (err) {
        console.error('Failed to fetch user for nav:', err);
      }
    };
    fetchUser();
  }, []);

  const items = [
    { id: 'home', icon: 'home', href: '/' },
    { id: 'messenger', icon: 'chat_bubble', href: '/messenger' },
    { 
      id: 'profile', 
      icon: 'person', 
      // Если имя загружено — ведем в профиль, если нет — на заглушку или логин
      href: username ? `/profile/${username}` : '/profile' 
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-black/80 backdrop-blur-xl border-t border-white/10 pb-6 pt-3 px-4">
      {items.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.id}
            href={item.href}
            className="relative flex flex-col items-center justify-center w-12 h-12 transition-all"
          >
            <span 
              className={`material-symbols-outlined text-[28px] transition-all duration-300 ${
                isActive ? 'text-accent-neon scale-110' : 'text-slate-500'
              }`}
              style={{
                textShadow: isActive ? '0 0 15px rgba(57,255,20,0.6)' : 'none'
              }}
            >
              {item.icon}
            </span>

            {isActive && (
              <motion.div 
                layoutId="activeTabMobile"
                className="absolute -bottom-1 w-1.5 h-1.5 bg-accent-neon rounded-full shadow-[0_0_10px_#39FF14]"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}