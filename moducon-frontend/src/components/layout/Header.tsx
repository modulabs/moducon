'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import ModulabsLogo from '@/imports/Group-53-445';

export function Header() {
  const { user, logout } = useAuthStore();

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
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/90">{user.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-white hover:bg-white/20 hover:text-white"
            >
              로그아웃
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
