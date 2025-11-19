"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getEpigram,
  likeEpigram,
  unlikeEpigram,
  listComments,
  addComment,
} from "@/lib/epigram";
import type { EpigramDetail, CommentItem, CommentPage } from "@/src/types/api";
import { getErrorMessage } from "@/lib/errors";

export default function EpigramDetailPage() {
  const router = useRouter();
  const params = useParams<{ id?: string | string[] }>();
  const idRaw = Array.isArray(params?.id) ? params?.id?.[0] : params?.id;
  const eid = Number(idRaw);

  useEffect(() => {
    if (!idRaw || Number.isNaN(eid)) router.replace("/epigramlist");
  }, [idRaw, eid, router]);

  const [post, setPost] = useState<EpigramDetail | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [cursor, setCursor] = useState<number | null>(0);
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState("");

  const loadDetail = async (): Promise<void> => {
    const data = await getEpigram(eid);
    setPost(data);
  };

  const loadComments = async (): Promise<void> => {
    if (busy || cursor === null) return;
    setBusy(true);
    try {
      const data: CommentPage = await listComments(
        eid,
        10,
        cursor ?? undefined
      );
      setComments((p) => [...p, ...data.list]);
      setCursor(data.nextCursor);
    } finally {
      setBusy(false);
    }
  };

  const toggleLike = async (): Promise<void> => {
    if (!post) return;
    const data = post.isLiked
      ? await unlikeEpigram(eid)
      : await likeEpigram(eid);
    setPost(data);
  };

  const submitComment = async (): Promise<void> => {
    const body = text.trim();
    if (!body) return;
    try {
      await addComment({ epigramId: eid, content: body, isPrivate: false });
      setText("");
      // 최신 순 보이도록 첫 페이지를 다시 로드
      setComments([]);
      setCursor(0);
      await loadComments();
    } catch (error: unknown) {
      alert(getErrorMessage(error));
    }
  };

  useEffect(() => {
    void loadDetail();
    void loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eid]);

  if (!post) return <main className="p-10">불러오는 중…</main>;

  return (
    <main className="mx-auto max-w-[900px] px-4 py-10">
      <article className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="whitespace-pre-line text-gray-800">{post.content}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-400">
          {post.tags.map((t) => (
            <span key={t.id}>#{t.name}</span>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={() => void toggleLike()}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            {post.isLiked ? "❤️ 좋아요 취소" : "🤍 좋아요"} ({post.likeCount})
          </button>
          {post.referenceTitle && (
            <a
              href={post.referenceUrl ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-gray-500 underline underline-offset-2"
            >
              {post.referenceTitle}
            </a>
          )}
        </div>
      </article>

      {/* 댓글 */}
      <section className="mt-10">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">댓글</h2>

        <div className="mb-4 flex gap-2">
          <input
            value={text}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setText(e.target.value)
            }
            placeholder="댓글을 입력하세요"
            className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400"
          />
          <button
            onClick={() => void submitComment()}
            className="rounded-md bg-gray-900 px-3 py-2 text-sm text-white"
          >
            등록
          </button>
        </div>

        <ul className="space-y-3">
          {comments.map((c) => (
            <li
              key={c.id}
              className="rounded-md border border-gray-100 bg-white p-3"
            >
              <div className="text-xs text-gray-400">{c.writer.nickname}</div>
              <p className="mt-1 text-sm text-gray-800">{c.content}</p>
            </li>
          ))}
        </ul>

        <div className="mt-6 text-center">
          {cursor !== null ? (
            <button
              disabled={busy}
              onClick={() => void loadComments()}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-60"
            >
              {busy ? "불러오는 중…" : "댓글 더 보기"}
            </button>
          ) : (
            <span className="text-sm text-gray-400">모두 확인했어요</span>
          )}
        </div>
      </section>
    </main>
  );
}
