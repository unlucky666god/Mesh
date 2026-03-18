// components/profile/SidebarNav.tsx
'use client';

interface SidebarNavProps {
  active: string;
  trending: Array<{ tag: string; count: string }>;
}

export default function SidebarNav({ active, trending }: SidebarNavProps) {
  const navItems = [
    { id: 'home', icon: 'home', label: 'Home', href: '/' },
    { id: 'messenger', icon: 'chat_bubble', label: 'Messenger', href: '/messenger', badge: 4 },
    { id: 'discover', icon: 'explore', label: 'Discover', href: '/discover' },
    { id: 'profile', icon: 'person', label: 'Profile', href: '#' },
    { id: 'settings', icon: 'settings', label: 'Settings', href: '/settings' },
  ];

  return (
    <>
      {/* Навигация */}
      <nav className="flex flex-col gap-2 rounded-2xl bg-surface-dark p-4 border border-border-dark">
        {navItems.map(item => (
          <a 
            key={item.id}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
              active === item.id 
                ? 'bg-primary/10 text-primary border border-primary/20' 
                : 'text-slate-400 hover:bg-border-dark hover:text-primary'
            }`}
            href={item.href}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-background-dark">
                {item.badge}
              </span>
            )}
          </a>
        ))}
      </nav>

      {/* Тренды */}
      <div className="rounded-2xl bg-surface-dark p-5 border border-border-dark">
        <h4 className="font-bold text-slate-100 mb-4">Trending Nodes</h4>
        <div className="flex flex-col gap-4">
          {trending.map((item, i) => (
            <div key={i} className="flex flex-col cursor-pointer hover:opacity-80 transition-opacity">
              <span className="text-xs text-slate-500">{item.tag}</span>
              <span className="text-sm font-semibold text-slate-200">{item.count}</span>
            </div>
          ))}
        </div>
        <button className="mt-4 text-primary text-xs font-bold uppercase tracking-widest hover:underline">
          View All
        </button>
      </div>
    </>
  );
}