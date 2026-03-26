// components/shared/UserSearch.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface UserSearchResult {
  id: string;
  name: string;
  avatar: string;
}

interface UserSearchProps {
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  onSelect?: (user: UserSearchResult) => void;
}

export default function UserSearch({ 
  placeholder = "Search network...", 
  className = "",
  inputClassName = "",
  onSelect
}: UserSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (query.trim().length < 1) {
        setResults([]);
        return;
      }
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.users);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Failed to search users:', err);
      }
    };

    const timeoutId = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative w-full">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
        <input 
          className={`w-full rounded-xl border border-white/10 bg-surface-dark py-2 pl-10 pr-4 text-slate-100 focus:ring-1 focus:ring-accent-neon placeholder:text-slate-500 text-sm outline-none transition-all ${inputClassName}`} 
          placeholder={placeholder} 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length > 0 && setShowDropdown(true)}
        />
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-dark border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
          {results.map((user) => (
            <Link
              key={user.id}
              href={onSelect ? '#' : `/@${user.name}`}
              onClick={(e) => {
                if (onSelect) {
                  e.preventDefault();
                  onSelect(user);
                }
                setShowDropdown(false);
                setQuery('');
              }}
              className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
            >
              <img 
                src={user.avatar || '/avatar.webp'} 
                className="size-10 rounded-full object-cover border border-white/10" 
                alt={user.name} 
              />
              <div>
                <p className="text-sm font-bold text-white leading-tight">{user.name}</p>
                <p className="text-[10px] text-accent-neon uppercase tracking-widest">Go to profile</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
