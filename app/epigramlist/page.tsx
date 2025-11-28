"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { listEpigrams } from "@/lib/epigram";
import type { EpigramBase, Page } from "@/src/types/api";
import { getErrorMessage } from "@/lib/errors";

const PAGE_SIZE = 12;

export default function EpigramListPage() {
  const r = useRouter();
  const sp = useSearchParams();
  const keyword = sp.get("keyword") ?? "";

  const [items, setItems] = useState<EpigramBase[]>([]);
  const [cursor, setCursor] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // id 중복 방지
  const dedupedItems = useMemo(() => {
    const m = new Map<number, EpigramBase>();
    for (const it of items) if (!m.has(it.id)) m.set(it.id, it);
    return Array.from(m.values());
  }, [items]);

  const load = async () => {
    if (loading || cursor === null) return;
    setLoading(true);
    setErr(null);
    try {
      const data: Page<EpigramBase> = await listEpigrams({
        limit: PAGE_SIZE,
        cursor: cursor ?? undefined,
        keyword: keyword || undefined,
      });
      setItems((prev) => [...prev, ...data.list]);
      setCursor(data.nextCursor);
    } catch (e: unknown) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  // 키워드가 바뀌면 리셋 후 재조회
  useEffect(() => {
    setItems([]);
    setCursor(0);
  }, [keyword]);

  useEffect(() => {
    if (cursor === 0) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor]);

  const goWrite = () => r.push("/addepigram");

  return (
    <main className="mx-auto w-full max-w-[1120px] px-6 py-6">
      {/* 페이지 타이틀 */}
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">피드</h1>

      {/* 에러 */}
      {err && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {err}
        </p>
      )}

      {/* 카드 그리드 */}
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dedupedItems.map((e, idx) => (
          <li
            key={`${e.id}-${idx}`}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            {/* 본문 링크 */}
            <Link href={`/epigrams/${e.id}`} className="block">
              <p className="mb-4 whitespace-pre-line text-[15px] leading-7 text-gray-900">
                {e.content}
              </p>
              <div className="mt-6 text-right text-xs text-gray-400">
                {e.author ? `- ${e.author} -` : ""}
              </div>
            </Link>

            {/* 태그 링크들 (중첩 a 방지) */}
            <div className="mt-4 flex flex-wrap gap-2">
              {e.tags.map((t) => (
                <Link
                  key={`${e.id}-tag-${t.id}`}
                  href={`/epigramlist?keyword=${encodeURIComponent(t.name)}`}
                  className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50"
                >
                  #{t.name}
                </Link>
              ))}
            </div>

            <div className="mt-3 text-xs text-gray-400">
              좋아요 {e.likeCount}
            </div>
          </li>
        ))}
      </ul>

      {/* 하단 '더 보기' 버튼 (더 불러올 게 있을 때만 노출) */}
      {cursor !== null && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-gray-800 shadow ring-1 ring-gray-200 hover:bg-gray-50 disabled:cursor-default disabled:opacity-60"
          >
            {loading ? "불러오는 중…" : "＋ 에피그램 더보기"}
          </button>
        </div>
      )}

      {/* 우하단 플로팅 작성 버튼: 어두운 배경 + 흰 글자 + 포인터 */}
      <button
        type="button"
        onClick={goWrite}
        aria-label="에피그램 만들기"
        className="fixed bottom-8 right-8 cursor-pointer rounded-full bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-lg transition hover:brightness-110"
      >
        ＋ 에피그램 만들기
      </button>
    </main>
  );
}
