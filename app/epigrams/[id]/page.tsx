"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getEpigram,
  likeEpigram,
  unlikeEpigram,
  listComments,
  addComment,
} from "@/lib/epigram";
import type {
  EpigramDetail,
  CommentItem,
  CommentPage,
  User,
} from "@/src/types/api";
import { getErrorMessage } from "@/lib/errors";
import { me } from "@/lib/auth";
import { api } from "@/lib/api";

export default function EpigramDetailPage() {
  const router = useRouter();
  const params = useParams<{ id?: string | string[] }>();
  const idRaw = Array.isArray(params?.id) ? params?.id?.[0] : params?.id;
  const eid = Number(idRaw);

  const [post, setPost] = useState<EpigramDetail | null>(null);
  const [meUser, setMeUser] = useState<User | null>(null);

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [cursor, setCursor] = useState<number | null>(0);
  const [busy, setBusy] = useState(false);

  const [text, setText] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const [err, setErr] = useState<string | null>(null);

  // profile modal
  const [profile, setProfile] = useState<{
    nickname: string;
    image: string | null;
  } | null>(null);

  // 안전 가드
  useEffect(() => {
    if (!idRaw || Number.isNaN(eid)) router.replace("/epigramlist");
  }, [idRaw, eid, router]);

  const loadDetail = async (): Promise<void> => {
    const data = await getEpigram(eid);
    setPost(data);
  };

  const loadMe = async (): Promise<void> => {
    try {
      const u = await me();
      setMeUser(u);
    } catch {
      setMeUser(null);
    }
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
      // 최신순(서버가 최신순이면 그대로, 아니라면 정렬)
      const merged = [...comments, ...data.list].sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
      );
      setComments(merged);
      setCursor(data.nextCursor);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void loadMe();
    void loadDetail();
    setComments([]);
    setCursor(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eid]);

  useEffect(() => {
    void loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eid]);

  const isMine = useMemo(
    () => !!post && !!meUser && post.writerId === meUser.id,
    [post, meUser]
  );

  const share = async (): Promise<void> => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      alert("링크가 복사되었어요.");
    } catch {
      alert("복사에 실패했어요.");
    }
  };

  const toggleLike = async (): Promise<void> => {
    if (!post) return;
    try {
      const data = post.isLiked
        ? await unlikeEpigram(eid)
        : await likeEpigram(eid);
      setPost(data);
    } catch (error: unknown) {
      alert(getErrorMessage(error));
    }
  };

  const submitComment = async (): Promise<void> => {
    const body = text.trim();
    if (!body) return;
    try {
      await addComment({ epigramId: eid, content: body, isPrivate });
      setText("");
      setComments([]);
      setCursor(0);
      await loadComments();
    } catch (error: unknown) {
      alert(getErrorMessage(error));
    }
  };

  // 댓글 수정/삭제 (엔드포인트는 일반 REST 가정)
  const updateComment = async (
    c: CommentItem,
    nextText: string
  ): Promise<void> => {
    try {
      await api.put(`/comments/${c.id}`, {
        content: nextText,
        isPrivate: c.isPrivate,
      });
      setComments((prev) =>
        prev.map((x) => (x.id === c.id ? { ...x, content: nextText } : x))
      );
    } catch (error: unknown) {
      alert(getErrorMessage(error));
    }
  };

  const deleteComment = async (c: CommentItem): Promise<void> => {
    if (!confirm("댓글을 삭제할까요?")) return;
    try {
      await api.delete(`/comments/${c.id}`);
      setComments((prev) => prev.filter((x) => x.id !== c.id));
    } catch (error: unknown) {
      alert(getErrorMessage(error));
    }
  };

  // 글 수정/삭제 (엔드포인트는 일반 REST 가정)
  const deleteEpigram = async (): Promise<void> => {
    if (!post) return;
    if (!confirm("이 에피그램을 삭제할까요?")) return;
    try {
      await api.delete(`/epigrams/${post.id}`);
      alert("삭제했어요.");
      router.replace("/epigramlist");
    } catch (error: unknown) {
      alert(getErrorMessage(error));
    }
  };

  // 무한 스크롤 보조: sentinel 관찰
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!sentinelRef.current) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && cursor !== null && !busy) {
        void loadComments();
      }
    });
    io.observe(sentinelRef.current);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, busy, sentinelRef.current]);

  if (!post) return <main className="p-10">불러오는 중…</main>;

  return (
    <main className="mx-auto max-w-[900px] px-4 py-10">
      {/* 헤더 영역 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-wrap gap-2 text-xs">
          {post.tags.map((t) => (
            <button
              key={`top-tag-${t.id}`}
              type="button"
              onClick={() =>
                router.push(
                  `/epigramlist?keyword=${encodeURIComponent(t.name)}`
                )
              }
              className="rounded bg-gray-100 px-2 py-0.5 text-gray-500 hover:bg-gray-200"
            >
              #{t.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => void share()}
            className="rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50"
            title="공유"
          >
            공유
          </button>

          {isMine && (
            <div className="relative">
              <details className="group">
                <summary className="cursor-pointer rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50 list-none">
                  …
                </summary>
                <div className="absolute right-0 z-10 mt-1 w-28 rounded-md border border-gray-100 bg-white p-1 text-xs shadow">
                  <button
                    onClick={() => router.push(`/addepigram?edit=${post.id}`)}
                    className="block w-full rounded px-2 py-1 text-left hover:bg-gray-50"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => void deleteEpigram()}
                    className="block w-full rounded px-2 py-1 text-left text-red-600 hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>

      {/* 본문 */}
      <article className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="whitespace-pre-line text-gray-800 text-[17px]">
          {post.content}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <button
            onClick={() => void toggleLike()}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            {post.isLiked ? "❤️ 좋아요 취소" : "🤍 좋아요"} ({post.likeCount})
          </button>

          {/* 저자 / 출처 */}
          <span className="ml-2 text-gray-400">— {post.author}</span>

          {post.referenceTitle && (
            <span className="inline-flex items-center gap-1 text-gray-400">
              ·
              {post.referenceUrl ? (
                // 단일 a (중첩 방지)
                <a
                  href={post.referenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 underline underline-offset-2"
                  title="새 창으로 열기"
                >
                  {post.referenceTitle} ↗
                </a>
              ) : (
                <span>{post.referenceTitle}</span>
              )}
            </span>
          )}
        </div>
      </article>

      {/* 댓글 */}
      <section className="mt-10">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">댓글</h2>

        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="댓글을 입력하세요"
            className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400"
          />
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            비공개
          </label>
          <button
            onClick={() => void submitComment()}
            className="rounded-md bg-gray-900 px-3 py-2 text-sm text-white"
          >
            저장
          </button>
        </div>

        <ul className="space-y-3">
          {comments.map((c) => {
            const mine = meUser?.id === c.writer.id;
            return (
              <li
                key={c.id}
                className="rounded-md border border-gray-100 bg-white p-3"
              >
                <div className="flex items-center justify-between">
                  <button
                    className="flex items-center gap-2"
                    onClick={() =>
                      setProfile({
                        nickname: c.writer.nickname,
                        image: c.writer.image,
                      })
                    }
                    title="프로필 보기"
                  >
                    <span className="inline-block h-8 w-8 overflow-hidden rounded-full bg-gray-100">
                      {c.writer.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.writer.image}
                          alt={c.writer.nickname}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </span>
                    <span className="text-xs text-gray-500">
                      {c.writer.nickname}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                    {c.isPrivate && (
                      <span className="rounded bg-gray-100 px-1 text-[10px] text-gray-500">
                        비공개
                      </span>
                    )}
                  </button>

                  {mine && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          const next = prompt("댓글 수정", c.content);
                          if (
                            next !== null &&
                            next.trim() &&
                            next !== c.content
                          ) {
                            await updateComment(c, next.trim());
                          }
                        }}
                        className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-50"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => void deleteComment(c)}
                        className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>

                <p className="mt-2 text-sm text-gray-800">{c.content}</p>
              </li>
            );
          })}
        </ul>

        {/* 무한 스크롤 관찰 지점 */}
        <div ref={sentinelRef} className="h-6" />

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

      {/* 프로필 모달 */}
      {profile && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          onClick={() => setProfile(null)}
        >
          <div
            className="w-full max-w-xs rounded-xl bg-white p-5 shadow"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full bg-gray-100">
              {profile.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.image}
                  alt={profile.nickname}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <p className="text-center text-sm text-gray-700">
              {profile.nickname}
            </p>
            <div className="mt-4 text-center">
              <button
                onClick={() => setProfile(null)}
                className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
