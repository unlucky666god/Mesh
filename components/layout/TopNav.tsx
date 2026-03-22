'use client';

import { useState, useEffect } from "react";
import Link from 'next/link';
import UserSearch from '@/components/shared/UserSearch';

interface User {
    id: string;
    name: string;
    avatar: string;
}

interface HeaderProps {
    user?: User | null;
}

export default function TopNav({ user: initialUser }: HeaderProps) {
    const [user, setUser] = useState<User | null>(initialUser || null);

    useEffect(() => {
        if (!initialUser) {
            fetch('/api/auth/me')
                .then(res => res.ok ? res.json() : null)
                .then(data => data && setUser(data.user));
        }
    }, [initialUser]);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background-dark/80 backdrop-blur-md px-6 lg:px-40 py-4" >
            <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">

                {/* Логотип */}
                <div className="flex items-center shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Квадрат с буквой M — виден всегда */}
                        <div className="size-10 flex items-center justify-center bg-accent-neon rounded-lg text-black shadow-[0_0_15px_rgba(57,255,20,0.5)]">
                            <span className="font-mono font-extrabold text-xl">M</span>
                        </div>
                        <Link
                            className="hidden sm:block text-3xl font-extrabold tracking-tighter text-white font-mono"
                            href="/"
                        >
                            MESH<span className="text-accent-neon">.</span>
                        </Link>
                    </div>
                </div>

                {/* Правая часть: поиск и аватар */}
                <div className="flex flex-1 justify-end items-center gap-6">

                    {/* Поиск: 
                        На мобилках (маленьких экранах) он виден ВСЕГДА.
                        На больших экранах он также остается. 
                    */}
                    <div className="w-full max-w-[300px] sm:max-w-none sm:w-auto">
                        <UserSearch
                            placeholder="Search..."
                            className="block" // Теперь поиск виден всегда
                            inputClassName="w-full sm:w-40 lg:w-64 rounded-full py-1.5 bg-white/5 border-white/10 focus:border-accent-neon/50 transition-all"
                        />
                    </div>

                    {user && (
                        <Link
                            href={`/profile/${user.name}`}
                            className="hidden sm:flex size-10 rounded-full border-2 border-accent-neon/50 p-0.5 hover:border-accent-neon transition-all cursor-pointer overflow-hidden shrink-0"
                        >
                            <img
                                src={user.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuDWOcupY-lVeF2m__7xGAxr56tRQ5ybg7P51rG4aHjeAQAsbMv67QF6C8WTkXZFUNxZs7Y5dbGZ7Hhw8BNa_1WIgI9RfJjY6g7qnDf0zsmI4klIlu4Trag-5eYeE1n34u0EWzuzULoXrmHbjvvH99IyXyxkIyW8XB2VHUUmNdV16ZTvH1dZ7MKLVZrerEgW2K47zi_2LK85vZMKdxnOHK0Z_klAi601Y0gMT7fn8m1Z-pHg0zVOFz4gp7GS450pBl-ynhMkeMFjFBCz"}
                                alt={`${user.name}'s avatar`}
                                className="w-full h-full rounded-full object-cover"
                            />
                        </Link>
                    )}
                </div>
            </div>
        </header >
    );
}