// app/feed/FeedPage.tsx
'use client';
import { useState, useEffect } from 'react';
import { useSocket } from "@/context/socketContext";

// Типы для постов и сторис
interface Story {
  id: string;
  username: string;
  avatar: string;
  viewed: boolean;
}

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    location: string;
    time: string;
  };
  content: string;
  image?: string;
  aspectRatio?: string;
  stats: {
    likes: string;
    comments: string;
    shares: string;
  };
  liked?: boolean;
  bookmarked?: boolean;
}

// Моковые данные
const STORIES: Story[] = [
  { id: 'new', username: 'Post', avatar: '', viewed: false },
  { id: '1', username: 'Sarah', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPs2uhmoQtzOrNzLMPEwz0wEx-AijkG-eZDwRGzzoy5UuxngIlhnsq_JLB6F5aPGVXh02XX0DYUKXWD-jN2CvjHhomEAH6BiIIWb0Pi8Xx2G_dgirtc2fxZhsMMoR33mJHI_WF1gFfT19MV5d9fB7Ot6bmlkk5RFo41a1FqlraTkOTXfNKaV6O5hiYyQ7iO5wmH-SzEMCDw5JP6rF2JNijoMFpUxTWq4Tj2fLF1jnZRDWn9PY5klB-g-7_KK3Db-WOFaz1kvEGpg7j', viewed: false },
  { id: '2', username: 'Marcus', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4asnqZ2NX2PgrCk0V0t4ctBm4bQ0iIL4BQa9BnuhMPdbbzZqackvgFOziOZZCxGMzDl2WsOKtQmqeEE5NO-_9UhUqlfoX-b09Ru91GAiM1tGwrW6MTMgt3DJRfx3b2VzCebT_M5yx3iiZfMXamYGELF9geyfSK9eZUat-UWkXaspp748_jPlRKYlD1PCGRrJggp_pWRBPcu5Pa9JvDIb6d47ng8af4Kiqsw798ij1MTXNdTUM4yDD5c2Wz-FYvIgM4nO5Eh1Op4xI', viewed: false },
  { id: '3', username: 'Elena', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCd2HX4pYcMkn5cnsf4mxbfFtqxw3Ggt3owg1DGrtMooplpG5LWiV0jNEtcc2jrw08w_5vqq0Lw33irPHI2lfWWa3dYyFiuEFq95Bd2ynQqPT_Qpkz85fOd4IEs422LF2P-0rIpL0M1s96_DGea6PN3oB146CeLu1pEI5_2NCbwXBpGQaGYpqOrDdWCgptQLV0LIhbEz95JSBQVLGWAE2f2_iH0hNdhO0DZ__6UkTVYblDsQV3vUL_gTfZchVI2C_cvbY2lrBLvC8m7', viewed: false },
  { id: '4', username: 'David', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOoFV9K0PVB2kplqr0w68HTg_WjnjsYrwu-5GQA-5BGuI4sN3g8foKjZ-AUj617H8f3xHKh7HG3fCtiHauR45E4QfZ5sAZbQvxCaIjpk0gVZVc1wf9qjT5FVkv6nmGhoKNpbkTDngiGPqJbeObyox2zH1XhygCkelYQJ8ZI8ILVYzu-FKxiaDGowEOszY6BurDpQiK4-I2CgCUTsgpQj4POrwdxPZTN1FFF-Xvj5J60FXCyNt504i81i-XqI_4p9K6QDZ0WNoNlkAg', viewed: true },
];

const POSTS: Post[] = [
  {
    id: '1',
    author: {
      name: 'Elena Rodriguez',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsV4tdQIqS5WFheKdBe-OWXwmAnOope_Xk1GCBdw55BpuI9wUMwW8GhAxVOUtIE08q3OHIZlXvkE57aZsaNqo2mFbvkOsbziid5kD1Oxxcc36qatVdGiEx04TNYiLaVFD_mNOQc-x9pV6_QJtHB0Pz_5SPY487lw4AW5YOMWviBAGBNwz5KLeroApKacdzanfgxcy3-UrrDEObGz8DCzIQOdvOazCwKb-bMymzIZK2axZV-vnsUB7jnaHOnLY17jvhpIv5u-6iu7ai',
      location: 'Berlin, Germany',
      time: '2h ago',
    },
    content: 'Exploring the intersections of technology and urban life. The new #Mesh update feels incredibly smooth. Loving the minimalist direction.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-zrRYNfJbQ6LhhwrTWIA29JrIFnNeb5R0No0mLXvtpEsagTf3ykDQmNcvUbuGiim5xENrCuDQqQBEOI8vvFoNgcmq_Gew1MSrKhTJNHIzO9Sf5Wcc-dporR2aVmDZfo6z3whcfI1XF47puxxfBC0wDeegDv3Jlr3H0WyDz13uA87RDIttLiJF6J8xYzwTntWv_5aW2gagw0TmpVYiOkEzZDYoU0CkmCLLa_465Gyc8XrNd4qsMeNEOihyGCAjbUrK4A_hzIMYxEmd',
    stats: { likes: '1.4k', comments: '42', shares: '128' },
  },
  {
    id: '2',
    author: {
      name: 'Marcus Thorne',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVsuPwfAqB_l1bPUWyqgUWi1bO4cUQey-O_WXTsSLPpdEkQhcO2EDqNUFoiqsLxzzshKf4SS4eIUlDCRrzRd8hpr_Hqa37GOhf2zZT5W3OWWgmTry3NYKKyuIgWhTv05Y5Y2O6ipax6RUT_i2UaJ9d4Ctb4y2W0jBgFt9xfRvrdAvPBoTEhgPLXORIZwyOvDNP91Ntai6nHGsooMCY_oaYR91EPK7scW60VLZ07VHILBD-COp4cHSvnmTVjN3-9lIcXkMJaXwyaThb',
      location: 'Tokyo, Japan',
      time: '5h ago',
    },
    content: 'Midnight walk through Shibuya. There\'s something magical about how the neon reflections hit the wet pavement. 🌃✨',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSS1i1CUclhACQ0Bp2RzRyYDsAYs5DY5ZD6fAul7ovzJKQqECoT4c2LTAIMvoLK0qxL93fTKlUzAC7Q2R2vt_lc0TCmD9NQFD3UpL01sOfEPzr2G5EBLGknSJPQQws9sueAC7DKh2xXu6FzEOjlWRwR7rhxlwSsAHOZUNERjWTelcPTcBOSPWfWM991A1IItnm9JK14iltojSR0osURz-_MhnTPFUqzPR8A8F4dFSJOTPvw29VGAq43ArCOqAFYywMsgLisnDFKdmn',
    stats: { likes: '3.8k', comments: '156', shares: '540' },
  },
];

export default function FeedPage() {
  const { socket, connected } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Слушаем новые сообщения прямо здесь, в ленте!
    socket.on("message:new", (data) => {
      console.log("Новое сообщение пришло, пока ты листал ленту:", data);
      // Тут можно обновить стейт уведомлений
    });

    return () => { socket.off("message:new"); };
  }, [socket]);
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState<Post[]>(POSTS);
  const [stories] = useState<Story[]>(STORIES);

  const handlePost = () => {
    if (!postText.trim()) return;
    // TODO: Отправка поста на сервер
    console.log('Новый пост:', postText);
    setPostText('');
  };

  const toggleLike = (postId: string) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, liked: !post.liked }
        : post
    ));
  };

  const toggleBookmark = (postId: string) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, bookmarked: !post.bookmarked }
        : post
    ));
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">

      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background-dark/80 backdrop-blur-md px-6 lg:px-40 py-4">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">

          {/* Логотип */}
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3">
              <div className="size-10 flex items-center justify-center bg-accent-neon rounded-lg text-black shadow-[0_0_15px_rgba(57,255,20,0.5)]">
                <span className="font-mono font-extrabold text-xl">M</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tighter text-white font-mono">
                MESH<span className="text-accent-neon">.</span>
              </h1>
            </div>
          </div>

          {/* Правая часть: поиск, уведомления, аватар */}
          <div className="flex items-center gap-6">

            {/* Поиск */}
            <div className="hidden sm:flex bg-white/5 border border-white/10 rounded-full px-4 py-1.5 items-center gap-2 focus-within:border-accent-neon transition-all">
              <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-sm w-40 lg:w-64 text-white placeholder:text-slate-500 outline-none"
                placeholder="Explore Mesh..."
                type="text"
              />
            </div>

            {/* Уведомления */}
            <button className="relative p-2 text-slate-400 hover:text-accent-neon transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-accent-neon rounded-full shadow-[0_0_5px_#39ff14]"></span>
            </button>

            {/* Аватар пользователя */}
            <div className="size-10 rounded-full border-2 border-accent-neon/50 p-0.5 hover:border-accent-neon transition-all cursor-pointer">
              <div
                className="w-full h-full rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAy4RRG-bT7iAihY2K0fqJcPvoRu3Spz-z0k5DOMmu2AMoej0LM_vfh7YF0nWITTelm7le9lwaIsxjv3l9PKheCZqR3fupEjovi9jQWCrAaZkVXAGrAaZLjOBna4jnhphQuOyC5MfIdt2fm6DOuuwvrXviq1Hg4VjaSiZ98jSuSta21MJnQuH1d6PuHuHS4cgXsdFJC7XZT782oVXKAMTBmaEWzeL4niP0_rwyBhuXq3SXq6_XQcYH-bODwo0oZuUB8VNhNDKlMW4p6")` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ========== MAIN CONTENT ========== */}
      <div className="mx-auto w-full max-w-[1200px] flex flex-row px-4 lg:px-40 py-8 gap-8">

        {/* Левая колонка: Сторис + Посты */}
        <main className="flex-1 flex flex-col gap-8 max-w-[700px]">

          {/* Сторис */}
          <section className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {stories.map((story) => (
              <div
                key={story.id}
                className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group"
              >
                <div className={`
                  size-16 rounded-full flex items-center justify-center transition-all
                  ${story.id === 'new'
                    ? 'border-2 border-dashed border-slate-700 group-hover:border-accent-neon'
                    : `border-2 ${story.viewed ? 'border-white/20' : 'border-accent-neon'} p-1 shadow-[0_0_10px_rgba(57,255,20,0.3)]`
                  }
                `}>
                  {story.id === 'new' ? (
                    <span className="material-symbols-outlined text-slate-500 group-hover:text-accent-neon">add</span>
                  ) : (
                    <div
                      className={`w-full h-full rounded-full bg-cover bg-center ${story.viewed ? 'grayscale' : ''}`}
                      style={{ backgroundImage: `url("${story.avatar}")` }}
                    />
                  )}
                </div>
                <p className={`text-[11px] font-medium uppercase tracking-widest ${story.viewed && story.id !== 'new' ? 'text-slate-500' : 'text-white'}`}>
                  {story.username}
                </p>
              </div>
            ))}
          </section>

          {/* Форма создания поста */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col gap-4">
            <div className="flex gap-4">
              <div
                className="size-12 rounded-full bg-cover bg-center shrink-0"
                style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDWOcupY-lVeF2m__7xGAxr56tRQ5ybg7P51rG4aHjeAQAsbMv67QF6C8WTkXZFUNxZs7Y5dbGZ7Hhw8BNa_1WIgI9RfJjY6g7qnDf0zsmI4klIlu4Trag-5eYeE1n34u0EWzuzULoXrmHbjvvH99IyXyxkIyW8XB2VHUUmNdV16ZTvH1dZ7MKLVZrerEgW2K47zi_2LK85vZMKdxnOHK0Z_klAi601Y0gMT7fn8m1Z-pHg0zVOFz4gp7GS450pBl-ynhMkeMFjFBCz")` }}
              />
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-slate-500 focus:ring-1 focus:ring-accent-neon focus:border-accent-neon transition-all resize-none min-h-[80px] outline-none"
                placeholder="Share something new..."
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-accent-neon hover:bg-white/5 rounded-lg transition-all">
                  <span className="material-symbols-outlined">image</span>
                </button>
                <button className="p-2 text-slate-400 hover:text-accent-neon hover:bg-white/5 rounded-lg transition-all">
                  <span className="material-symbols-outlined">videocam</span>
                </button>
                <button className="p-2 text-slate-400 hover:text-accent-neon hover:bg-white/5 rounded-lg transition-all">
                  <span className="material-symbols-outlined">location_on</span>
                </button>
              </div>
              <button
                onClick={handlePost}
                disabled={!postText.trim()}
                className="bg-accent-neon text-black font-bold px-8 py-2 rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Post
              </button>
            </div>
          </div>

          {/* Лента постов */}
          <div className="flex flex-col gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="glass-card rounded-2xl border border-white/10 overflow-hidden neon-border-hover transition-all group"
              >
                {/* Шапка поста */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="size-10 rounded-full bg-cover bg-center border border-white/10"
                      style={{ backgroundImage: `url("${post.author.avatar}")` }}
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-accent-neon transition-colors">
                        {post.author.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold">
                        {post.author.location} • {post.author.time}
                      </p>
                    </div>
                  </div>
                  <button className="text-slate-500 hover:text-white transition-colors">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </div>

                {/* Контент поста */}
                <div className="px-4 pb-4">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {post.content.split(' ').map((word, i) =>
                      word.startsWith('#') ? (
                        <span key={i} className="text-accent-neon font-bold">{word} </span>
                      ) : word + ' '
                    )}
                  </p>
                </div>

                {/* Изображение поста */}
                {post.image && (
                  <div className="px-4 pb-4">
                    <div
                      className={`w-full rounded-xl bg-cover bg-center border border-white/5 ${post.aspectRatio || 'aspect-video'}`}
                      style={{ backgroundImage: `url("${post.image}")` }}
                    />
                  </div>
                )}

                {/* Футер поста: лайки, комментарии, шеры */}
                <div className="p-4 flex items-center justify-between border-t border-white/5 bg-white/[0.02]">
                  <div className="flex gap-6">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-2 transition-all ${post.liked ? 'text-accent-neon' : 'text-slate-400 hover:text-accent-neon'}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {post.liked ? 'favorite' : 'favorite_border'}
                      </span>
                      <span className="text-xs font-bold">{post.stats.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-all">
                      <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                      <span className="text-xs font-bold">{post.stats.comments}</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-all">
                      <span className="material-symbols-outlined text-[20px]">share_reviews</span>
                      <span className="text-xs font-bold">{post.stats.shares}</span>
                    </button>
                  </div>
                  <button
                    onClick={() => toggleBookmark(post.id)}
                    className={`transition-all ${post.bookmarked ? 'text-accent-neon' : 'text-slate-400 hover:text-accent-neon'}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {post.bookmarked ? 'bookmark' : 'bookmark_border'}
                    </span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </main>

        {/* ========== SIDEBAR (только desktop) ========== */}
        <aside className="hidden lg:flex w-64 flex-col gap-6 sticky top-28 self-start">

          {/* Навигация */}
          <nav className="glass-card rounded-2xl p-4 border border-white/10">
            <h3 className="text-xs font-black text-accent-neon uppercase tracking-widest mb-4 px-2">Navigation</h3>
            <div className="flex flex-col gap-1">
              <a className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-neon text-black font-bold shadow-neon-glow transition-all" href="/home">
                <span className="material-symbols-outlined">home</span>
                <span className="text-sm">Home</span>
              </a>
              <a className="group flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-accent-neon hover:bg-white/5 transition-all" href="/messenger">
                <span className="material-symbols-outlined">forum</span>
                <span className="text-sm">Messenger</span>
              </a>
              <a className="group flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-accent-neon hover:bg-white/5 transition-all" href="#">
                <span className="material-symbols-outlined">explore</span>
                <span className="text-sm">Discover</span>
              </a>
              <a className="group flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-accent-neon hover:bg-white/5 transition-all" href="#">
                <span className="material-symbols-outlined">settings</span>
                <span className="text-sm">Settings</span>
              </a>
            </div>
          </nav>

          {/* Тренды */}
          <div className="glass-card rounded-2xl p-4 border border-white/10">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 px-2">Trending</h3>
            <div className="flex flex-col gap-4 px-2">
              <div className="flex flex-col">
                <span className="text-[10px] text-accent-neon font-bold uppercase">#MeshNetwork</span>
                <span className="text-xs text-white">2.4k nodes active</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">#Web3Design</span>
                <span className="text-xs text-white">1.8k posts today</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ========== FLOATING ACTION BUTTON ========== */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="size-14 rounded-full bg-accent-neon text-black flex items-center justify-center shadow-[0_0_25px_rgba(57,255,20,0.6)] hover:scale-110 transition-transform active:scale-95">
          <span className="material-symbols-outlined font-bold">edit</span>
        </button>
      </div>
    </div>
  );
}