'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import ModulabsLogo from '@/imports/Group-53-445';

export function Header() {
  const { user } = useAuthStore();

  // 이름에서 성(첫 글자) 추출
  const getInitial = (name: string) => {
    return name.charAt(0);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#FF6B9D] via-[#FF8B5A] to-[#FFA94D] shadow-lg">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link href="/home/" className="flex items-center gap-3">
          <div className="w-20 h-8">
            <ModulabsLogo />
          </div>
          <span className="text-lg font-bold text-white">모두콘 2025</span>
        </Link>

        {user && (
          <Link
            href="/mypage"
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors border-2 border-white/50"
          >
            <span className="text-white font-bold text-sm">
              {getInitial(user.name)}
            </span>
          </Link>
        )}
      </div>
    </header>
  );
}
