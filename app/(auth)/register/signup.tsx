'use client';
import { useEffect, useRef, FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
}

const NEON_COLOR = '#39FF14';

export default function RegistrationForm() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    // ... (весь useEffect с анимацией частиц остаётся БЕЗ изменений) ...
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        let width = 0;
        let height = 0;

        const handleResize = () => {
            const dpr = window.devicePixelRatio || 1;
            width = window.innerWidth;
            height = window.innerHeight;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            const particleCount = Math.min(50, Math.floor((width * height) / 30000));
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5
                });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.strokeStyle = NEON_COLOR;
            ctx.lineWidth = 0.5;
            ctx.globalAlpha = 1;

            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 200) {
                        ctx.globalAlpha = 1 - (dist / 200);
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });
            ctx.globalAlpha = 1;
            animationFrameId = requestAnimationFrame(draw);
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        draw();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.get('email'),
                    password: formData.get('password'),
                    name: formData.get('username'), // username → name в БД
                    phone: formData.get('phone'),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            setSuccess(true);
            
            // Редирект через 1.5 сек для показа успеха
            setTimeout(() => {
                router.push('/login');
                router.refresh();
            }, 1500);

        } catch (err: any) {
            setError(err.message || 'Connection error. Check your network.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="min-h-screen flex items-center justify-center p-4 bg-mesh-dark relative overflow-hidden">
            {/* Canvas фон - без изменений */}
            <canvas
                ref={canvasRef}
                id="mesh-bg"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 10,
                    pointerEvents: 'none',
                }}
            />

            {/* Карточка регистрации */}
            <main className="w-full max-w-md bg-mesh-card border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden" data-purpose="registration-card">
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
                        
                        {/* Сообщение об успехе */}
                        {success && (
                            <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-xs font-mono">
                                ✓ Account initialized. Redirecting...
                            </div>
                        )}

                        {/* Username */}
                        <div data-purpose="input-group">
                            <label className="block text-xs font-bold text-mesh-neon uppercase mb-2 tracking-widest" htmlFor="username">
                                Username
                            </label>
                            <input
                                className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:ring-1 focus:ring-mesh-neon focus:border-mesh-neon transition-all placeholder:text-zinc-600 disabled:opacity-50"
                                id="username"
                                name="username"
                                placeholder="username"
                                required
                                type="text"
                                minLength={3}
                                disabled={isLoading || success}
                            />
                        </div>

                        {/* Email */}
                        <div data-purpose="input-group">
                            <label className="block text-xs font-bold text-mesh-neon uppercase mb-2 tracking-widest" htmlFor="email">
                                Email Address
                            </label>
                            <input
                                className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:ring-1 focus:ring-mesh-neon focus:border-mesh-neon transition-all placeholder:text-zinc-600 disabled:opacity-50"
                                id="email"
                                name="email"
                                placeholder="user@mesh.network"
                                required
                                type="email"
                                disabled={isLoading || success}
                            />
                        </div>

                        {/* Phone number */}
                        <div data-purpose="input-group">
                            <label className="block text-xs font-bold text-mesh-neon uppercase mb-2 tracking-widest" htmlFor="number">
                                Phone Number
                            </label>
                            <input
                                className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:ring-1 focus:ring-mesh-neon focus:border-mesh-neon transition-all placeholder:text-zinc-600 disabled:opacity-50"
                                id="phone"
                                name="phone"
                                placeholder="+7"
                                required
                                type="tel"
                                minLength={10}
                                disabled={isLoading || success}
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
                                disabled={isLoading || success}
                            />
                            <p className="mt-2 text-[10px] text-zinc-500 italic">
                                Minimum 8 alphanumeric characters recommended.
                            </p>
                        </div>

                        {/* Terms 
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-mesh-neon focus:ring-mesh-neon focus:ring-offset-mesh-dark cursor-pointer disabled:opacity-50"
                                    id="terms"
                                    name="terms"
                                    required
                                    type="checkbox"
                                    disabled={isLoading || success}
                                />
                            </div>
                            <div className="ml-3 text-xs">
                                <label className="text-zinc-400 leading-normal cursor-pointer" htmlFor="terms">
                                    I agree to the{' '}
                                    <a className="text-mesh-neon hover:underline" href="/terms">
                                        Protocol Terms
                                    </a>{' '}
                                    and{' '}
                                    <a className="text-mesh-neon hover:underline" href="/privacy">
                                        Data Encryption Policy
                                    </a>
                                    .
                                </label>
                            </div>
                        </div>*/}

                        {/* Кнопка */}
                        <button
                            className="w-full bg-mesh-neon text-mesh-dark font-bold py-4 rounded-lg shadow-neon-button hover:bg-white transition-all duration-300 transform active:scale-[0.98] uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            type="submit"
                            disabled={isLoading || success}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-mesh-dark border-t-transparent rounded-full animate-spin"></span>
                                    Initializing...
                                </span>
                            ) : success ? 'Success!' : 'Initialize Account'}
                        </button>
                    </form>
                </section>

                {/* Футер */}
                <footer className="mt-10 pt-6 border-t border-zinc-800 text-center relative z-10">
                    <p className="text-zinc-400 text-sm">
                        Already part of the network?{' '}
                        <a className="text-mesh-neon font-semibold hover:underline decoration-2 underline-offset-4 ml-1" href="/login">
                            Log In
                        </a>
                    </p>
                </footer>
            </main>
        </section>
    );
}