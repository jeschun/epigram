"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listEpigrams } from "@/lib/epigram";
import type { EpigramBase, Page } from "@/src/types/api";
import { getErrorMessage } from "@/lib/errors";

const PAGE_SIZE = 12;

export default function EpigramListPage() {
  const [items, setItems] = useState<EpigramBase[]>([]);
  const [cursor, setCursor] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async (): Promise<void> => {
    if (loading || cursor === null) return;
    setLoading(true);
    setErr(null);
    try {
      const data: Page<EpigramBase> = await listEpigrams({
        limit: PAGE_SIZE,
        cursor: cursor ?? undefined,
      });
      setItems((prev) => [...prev, ...data.list]);
      setCursor(data.nextCursor);
    } catch (error: unknown) {
      setErr(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto max-w-[1000px] px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">피드</h1>
        <Link
          href="/addepigram"
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white"
        >
          글 쓰기
        </Link>
      </div>

      {err && <p className="mb-3 text-sm text-red-500">{err}</p>}

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((e) => (
          <li
            key={e.id}
            className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
          >
            <Link href={`/epigrams/${e.id}`} className="block">
              <p className="whitespace-pre-line text-gray-800">{e.content}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-400">
                {e.tags.map((t) => (
                  <span key={t.id}>#{t.name}</span>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-400">
                좋아요 {e.likeCount}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 text-center">
        {cursor !== null ? (
          <button
            onClick={() => void load()}
            disabled={loading}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {loading ? "불러오는 중..." : "더 보기"}
          </button>
        ) : (
          <span className="text-sm text-gray-400">끝까지 봤어요</span>
        )}
      </div>
    </main>
  );
}
