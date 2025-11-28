"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { me, logout } from "@/lib/auth";
import { storage, ACCESS } from "@/lib/api";
import type { User } from "@/src/types/api";

/**
 * 고정 상단 네비게이션
 * - 로고(왼쪽), 피드 링크
 * - 오른쪽: 로그인 OR 닉네임 드롭(간단 버전: 닉네임만 표시, 클릭 시 로그아웃 예시)
 * - 토큰 변화(storage/focus) 감지하여 닉네임 즉시 갱신
 */
export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchMe = useCallback(async () => {
    const token = storage.get(ACCESS);
    if (!token) {
      setUser(null);
      return;
    }
    try {
      setLoading(true);
      const u = await me();
      setUser(u);
    } catch {
      // 토큰 만료 등: 사용자 초기화
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 초기 진입 시
    void fetchMe();

    // 다른 탭/페이지에서 로그인/로그아웃 감지
    const onStorage = (e: StorageEvent) => {
      if (e.key === ACCESS) void fetchMe();
    };
    // 탭 포커스 시 재검사(로그인 직후 빠른 반영)
    const onFocus = () => void fetchMe();

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchMe]);

  const onLogout = async (): Promise<void> => {
    logout();
    setUser(null);
  };

  return (
    <header className="w-full bg-white">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center"
            aria-label="Epigram Home"
          >
            <Image
              src="/logo.svg"
              alt="epigram logo"
              width={112}
              height={28}
              className="h-7 w-auto md:h-8"
              priority
            />
          </Link>
          <Link
            href="/epigramlist"
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            피드
          </Link>
        </div>

        <nav className="text-sm">
          {loading ? (
            <span className="text-gray-400">확인 중…</span>
          ) : user ? (
            <div className="flex items-center gap-3">
              {/* 닉네임 표시 (필요하면 드롭다운으로 확장 가능) */}
              <span className="text-gray-700">{user.nickname}</span>
              <button
                type="button"
                onClick={() => void onLogout()}
                className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50"
                title="로그아웃"
              >
                로그아웃
              </button>
            </div>
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
