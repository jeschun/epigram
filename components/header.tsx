// src/components/header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { me, signOut } from "@/lib/auth";
import type { User } from "@/src/types/api";

export default function Header() {
  const pathname = usePathname();

  // 훅은 항상 호출
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const u = await me();
        if (alive) setUser(u);
      } catch {
        if (alive) setUser(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [pathname]);

  // 로그인/회원가입 페이지에서는 헤더 숨김
  const hide = pathname === "/login" || pathname === "/signup";
  if (hide) return null;

  return (
    <header className="w-full bg-white">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/logo.svg"
              alt="epigram logo"
              width={112}
              height={28}
              className="h-7 w-auto md:h-8"
              priority
            />
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/epigramlist"
              className="text-gray-500 hover:text-gray-800"
            >
              피드
            </Link>
            <Link href="/search" className="text-gray-500 hover:text-gray-800">
              검색
            </Link>
          </nav>
        </div>

        <div className="text-sm">
          {user ? (
            <div className="relative">
              <details className="group">
                <summary className="list-none cursor-pointer rounded px-2 py-1 text-gray-600 hover:bg-gray-50 hover:text-gray-900 inline-flex items-center gap-1">
                  <span className="max-w-[140px] truncate">
                    {user.nickname}
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 7l5 5 5-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </summary>
                <div className="absolute right-0 z-20 mt-2 w-36 rounded-md border border-gray-100 bg-white p-1 shadow">
                  <button
                    type="button"
                    onClick={async () => {
                      await signOut();
                    }}
                    className="block w-full rounded px-2 py-1 text-left text-red-600 hover:bg-red-50"
                  >
                    로그아웃
                  </button>
                </div>
              </details>
            </div>
          ) : (
            <Link href="/login" className="text-gray-500 hover:text-gray-800">
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
