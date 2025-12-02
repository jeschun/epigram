"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { me } from "@/lib/auth";
import type { User } from "@/src/types/api";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await me();
        if (mounted) setUser(u);
      } catch {
        if (mounted) setUser(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

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
            <Link
              href="/search"
              className="text-gray-500 hover:text-gray-800"
              aria-label="검색 페이지로 이동"
            >
              검색
            </Link>
          </nav>
        </div>

        <nav className="text-sm">
          {user ? (
            <span className="text-gray-600">{user.nickname}</span>
          ) : (
            <Link href="/login" className="text-gray-500 hover:text-gray-800">
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
