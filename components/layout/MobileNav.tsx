// components/layout/MobileNav.tsx
'use client';

interface MobileNavProps {
  active: string;
}

export default function MobileNav({ active }: MobileNavProps) {
  const items = [
    { id: 'home', icon: 'home', href: '/' },
    { id: 'discover', icon: 'explore', href: '/discover' },
    { id: 'profile', icon: 'person', href: '#' },
    { id: 'messenger', icon: 'chat_bubble', href: '/messenger' },
    { id: 'settings', icon: 'settings', href: '/settings' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-background-dark/95 backdrop-blur-md border-t border-border-dark py-3 px-6">
      {items.map(item => (
        <button 
          key={item.id}
          className={`transition-colors ${
            active === item.id ? 'text-primary' : 'text-slate-400 hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
        </button>
      ))}
    </nav>
  );
}