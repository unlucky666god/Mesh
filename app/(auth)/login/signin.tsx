'use client';
import { useEffect, useRef, FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BackgroundEffect from '@/components/layout/BackgroundEffect';

export default function AuthorizationForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        
        try {
            // 🔥 Отправка на API логина
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.get('email'),  // ← имя поля должно быть "email"
                    password: formData.get('password'),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Authorization failed');
            }

            // ✅ Cookie с токеном установится автоматически (http-only)
            // 🔥 Редирект на главную
            router.push('/');
            router.refresh(); // Обновляем серверные компоненты

        } catch (err: any) {
            setError(err.message || 'Connection error. Check your network.');
            setIsLoading(false);
        }
    };

    return (
        <section className="min-h-screen flex items-center justify-center p-4 bg-mesh-dark relative overflow-hidden">
            {/* Canvas фон — без изменений */}
            <BackgroundEffect />

            {/* Карточка авторизации */}
            <main className="w-full max-w-md bg-mesh-card border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden" data-purpose="login-card">
                {/* Декоративные элементы */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-mesh-neon/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-mesh-neon/5 rounded-full blur-3xl"></div>

                {/* Заголовок */}
                <header className="text-center mb-10 relative z-10">
                    <div className="inline-flex items-center justify-center mb-4">
                        <div className="w-12 h-12 bg-mesh-neon flex items-center justify-center rounded-lg shadow-neon-glow mr-3">
                            <span className="text-mesh-dark font-extrabold text-2xl font-mono">M</span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tighter text-white font-mono">
                            MESH<span className="text-mesh-neon">.</span>
                        </h1>
                    </div>
                    <p className="text-zinc-400 text-sm tracking-wide uppercase font-medium">
                        Connect to the digital grid
                    </p>
                </header>

                {/* Форма */}
                <section className="relative z-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Сообщение об ошибке */}
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-xs font-mono">
                                ⚠ {error}
                            </div>
                        )}

                        {/* Email (было Username) */}
                        <div data-purpose="input-group">
                            <label className="block text-xs font-bold text-mesh-neon uppercase mb-2 tracking-widest" htmlFor="email">
                                Email Address
                            </label>
                            <input
                                className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:ring-1 focus:ring-mesh-neon focus:border-mesh-neon transition-all placeholder:text-zinc-600 disabled:opacity-50"
                                id="email"
                                name="email"  // ← важно: name="email" для API
                                placeholder="user@mesh.network"
                                required
                                type="email"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Password */}
                        <div data-purpose="input-group">
                            <label className="block text-xs font-bold text-mesh-neon uppercase mb-2 tracking-widest" htmlFor="password">
                                Password
                            </label>
                            <input
                                className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:ring-1 focus:ring-mesh-neon focus:border-mesh-neon transition-all placeholder:text-zinc-600 disabled:opacity-50"
                                id="password"
                                name="password"
                                placeholder="••••••••••••"
                                required
                                type="password"
                                minLength={8}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Кнопка — с состоянием загрузки */}
                        <button
                            className="w-full bg-mesh-neon text-mesh-dark font-bold py-4 rounded-lg shadow-neon-button hover:bg-white transition-all duration-300 transform active:scale-[0.98] uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-mesh-dark border-t-transparent rounded-full animate-spin"></span>
                                    Connecting...
                                </span>
                            ) : 'Entry'}
                        </button>
                    </form>
                </section>

                {/* Футер */}
                <footer className="mt-10 pt-6 border-t border-zinc-800 text-center relative z-10">
                    <p className="text-zinc-400 text-sm">
                        Don't have account?{' '}
                        <Link className="text-mesh-neon font-semibold hover:underline decoration-2 underline-offset-4 ml-1" href="/register">
                            Registration
                        </Link>
                    </p>
                </footer>
            </main>
        </section>
    );
}