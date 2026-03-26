import Link from 'next/link';

interface EditProfileButtonProps {
  username: string;
}

export function EditProfileButton({ username }: EditProfileButtonProps) {
  return (
    <Link href={`/@${username}/edit`}>
      <button className="group relative flex items-center gap-3 px-6 py-2.5 bg-transparent border border-[#39FF14]/30 hover:border-[#39FF14] transition-all duration-300 overflow-hidden">
        {/* Фоновый эффект при наведении */}
        <div className="absolute inset-0 w-0 bg-[#39FF14]/5 group-hover:w-full transition-all duration-500"></div>
        
        {/* Иконка */}
        <span className="material-symbols-outlined text-sm text-[#39FF14] group-hover:rotate-90 transition-transform duration-500">
          settings
        </span>
        
        {/* Текст */}
        <span className="relative text-[10px] font-bold uppercase tracking-[0.3em] text-[#39FF14] neon-text-glow">
          EDIT_NODE_PARAMS
        </span>

        {/* Декоративный уголок (киберпанк стиль) */}
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#39FF14] translate-x-1 translate-y-1 rotate-45 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform"></div>
      </button>
    </Link>
  );
}