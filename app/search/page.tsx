"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { searchEpigrams } from "@/lib/epigram";
import type { Epigram, EpigramListPage } from "@/src/types/api";

const RECENT_KEY = "epigram_recent_keywords";
const MAX_RECENTS = 8;

function readRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function writeRecents(list: string[]) {
  try {
    localStorage.setItem(
      RECENT_KEY,
      JSON.stringify(list.slice(0, MAX_RECENTS))
    );
  } catch {
    // ignore
  }
}
function pushRecent(k: string) {
  const v = k.trim();
  if (!v) return;
  const cur = readRecents().filter((x) => x !== v);
  cur.unshift(v);
  writeRecents(cur);
}

export default function SearchPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const initialQ = sp.get("q") ?? "";

  const [q, setQ] = useState(initialQ);
  const [recents, setRecents] = useState<string[]>([]);
  const [items, setItems] = useState<Epigram[]>([]);
  const [cursor, setCursor] = useState<number | null | undefined>(0);
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(false); // 첫 로딩 감지

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // 최근 검색어 로드
  useEffect(() => {
    setRecents(readRecents());
  }, []);

  // 쿼리 변경 → 새 검색
  useEffect(() => {
    const nq = sp.get("q") ?? "";
    setQ(nq);
    setItems([]);
    setCursor(0);
    setTouched(false);
  }, [sp]);

  const title = useMemo(() => (q ? q : "검색"), [q]);

  const load = async () => {
    if (busy) return;
    if (cursor === null) return;
    if (!q.trim()) {
      setItems([]);
      setCursor(null);
      setTouched(true);
      return;
    }
    setBusy(true);
    try {
      const page: EpigramListPage = await searchEpigrams({
        keyword: q.trim(),
        limit: 12,
        cursor: cursor ?? undefined,
      });
      setItems((prev) => [...prev, ...page.list]);
      setCursor(page.nextCursor);
      setTouched(true);
    } finally {
      setBusy(false);
    }
  };

  // 처음 및 cursor 변할 때 로드
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, q]);

  // 무한 스크롤 옵저버
  useEffect(() => {
    if (!sentinelRef.current) return;

    const io = new IntersectionObserver((ents) => {
      if (!ents[0]?.isIntersecting) return;

      // 다음 페이지 커서 갱신: 0(초기) -> undefined(로드 트리거) -> number|null 유지
      setCursor((c) => (c === null ? null : c === 0 ? undefined : c));
    });

    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, []);

  const submit = (keyword: string) => {
    const v = keyword.trim();
    router.replace(v ? `/search?q=${encodeURIComponent(v)}` : "/search");
    if (v) {
      pushRecent(v);
      setRecents(readRecents());
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(q);
  };

  return (
    <main className="mx-auto max-w-[900px] px-4 py-8">
      {/* 제목 + 입력 */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
        <form onSubmit={onFormSubmit} className="relative w-[360px] max-w-full">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="태그/키워드 검색"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400"
            aria-label="검색어 입력"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 rounded-md px-3 py-1.5 text-sm text-white bg-gray-900 hover:opacity-90"
            aria-label="검색"
          >
            검색
          </button>
        </form>
      </div>

      {/* 최근 검색어 */}
      <section className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-700">최근 검색어</h2>
          {recents.length > 0 && (
            <button
              onClick={() => {
                writeRecents([]);
                setRecents([]);
              }}
              className="text-xs text-red-500 hover:underline"
            >
              모두 지우기
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {recents.length === 0 ? (
            <span className="text-sm text-gray-400">
              최근 검색어가 없습니다.
            </span>
          ) : (
            recents.map((r) => (
              <button
                key={r}
                onClick={() => submit(r)}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 hover:bg-gray-200"
                title={`${r} 검색`}
              >
                {r}
              </button>
            ))
          )}
        </div>
      </section>

      {/* 결과 리스트 */}
      <section className="space-y-6">
        {touched && items.length === 0 && q.trim() ? (
          <p className="px-1 text-sm text-gray-400">검색 결과가 없습니다.</p>
        ) : null}

        {items.map((it) => (
          <article
            key={it.id}
            className="border-b border-gray-100 pb-6 last:border-b-0"
          >
            <Link
              href={`/epigrams/${it.id}`}
              className="group block"
              title="상세 보기"
            >
              <p className="mb-2 whitespace-pre-line text-[15px] leading-7 text-gray-800 group-hover:opacity-90">
                {it.content}
              </p>
            </Link>

            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
              {/* 저자 */}
              {it.author ? <span>— {it.author}</span> : null}

              {/* 출처 */}
              {it.referenceTitle ? (
                <>
                  <span>·</span>
                  {it.referenceUrl ? (
                    <a
                      href={it.referenceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 underline underline-offset-2"
                      title="새 창으로 열기"
                    >
                      {it.referenceTitle} ↗
                    </a>
                  ) : (
                    <span>{it.referenceTitle}</span>
                  )}
                </>
              ) : null}
            </div>

            {/* 태그 */}
            <div className="mt-2 flex flex-wrap gap-2">
              {it.tags?.map((t) => (
                <button
                  key={t.id}
                  onClick={() => submit(t.name)}
                  className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-200"
                  title={`#${t.name} 검색`}
                >
                  #{t.name}
                </button>
              ))}
            </div>
          </article>
        ))}
      </section>

      {/* 무한 스크롤 센티넬 */}
      <div ref={sentinelRef} className="h-10" />

      {/* 로딩/더보기 */}
      <div className="mt-6 text-center">
        {cursor !== null ? (
          <button
            disabled={busy}
            onClick={() => void load()}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {busy ? "불러오는 중…" : "더 보기"}
          </button>
        ) : touched && items.length > 0 ? (
          <span className="text-sm text-gray-400">모두 확인했어요</span>
        ) : null}
      </div>
    </main>
  );
}
