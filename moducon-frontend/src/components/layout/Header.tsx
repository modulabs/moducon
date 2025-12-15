'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Home } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const isHome = pathname === '/' || pathname?.startsWith('/home');

  // 이름에서 성(첫 글자) 추출
  const getInitial = (name: string) => {
    return name.charAt(0);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#FF6B9D] via-[#FF8B5A] to-[#FFA94D] shadow-lg">
      <div className="container flex h-14 items-center px-4">
        {/* 왼쪽: 홈 아이콘 */}
        <Link
          href="/home"
          className="flex items-center justify-center transition-all"
        >
          <Home className={`w-6 h-6 ${isHome ? 'text-white scale-110' : 'text-black/60'}`} />
        </Link>

        {/* 가운데: 로고 */}
        <div className="flex-1 flex justify-center">
          <Link href="/home">
            <Image
              src="/images/moducon2025.svg"
              alt="모두콘 2025"
              width={120}
              height={36}
              className="h-7 w-auto"
              style={{ transform: 'scaleX(1.5)' }}
              priority
            />
          </Link>
        </div>

        {/* 오른쪽: 프로필 또는 로그인 버튼 */}
        {user ? (
          <Link
            href="/mypage"
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors border-2 border-white/50"
          >
            <span className="text-white font-bold text-sm">
              {getInitial(user.name)}
            </span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors border border-white/50"
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}
