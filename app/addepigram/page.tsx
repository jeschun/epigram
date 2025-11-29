"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createEpigram, getEpigram } from "@/lib/epigram";
import { getErrorMessage } from "@/lib/errors";
import { api } from "@/lib/api";

type AuthorMode = "direct" | "unknown" | "me";

export default function AddEpigramPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const editId = sp.get("edit");

  const [content, setContent] = useState("");
  const [authorMode, setAuthorMode] = useState<AuthorMode>("direct");
  const [author, setAuthor] = useState("");
  const [referenceTitle, setReferenceTitle] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const overflow = content.length > 500;

  // edit 모드 로드
  useEffect(() => {
    const load = async () => {
      if (!editId) return;
      try {
        const eid = Number(editId);
        const d = await getEpigram(eid);
        setContent(d.content);
        setAuthor(d.author);
        setAuthorMode("direct");
        setReferenceTitle(d.referenceTitle ?? "");
        setReferenceUrl(d.referenceUrl ?? "");
        setTags(d.tags.map((t) => t.name).slice(0, 3));
      } catch (error: unknown) {
        setErr(getErrorMessage(error));
      }
    };
    void load();
  }, [editId]);

  // authorMode 반영
  const effectiveAuthor = useMemo(() => {
    if (authorMode === "unknown") return "알 수 없음";
    if (authorMode === "me") return "본인";
    return author.trim();
  }, [authorMode, author]);

  // 태그 추가
  const addTag = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    if (v.length > 10) {
      alert("태그는 최대 10자까지 가능합니다.");
      return;
    }
    if (tags.includes(v)) return;
    if (tags.length >= 3) {
      alert("태그는 최대 3개까지 가능합니다.");
      return;
    }
    setTags((p) => [...p, v]);
  };

  const onTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
      setTagInput("");
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    if (overflow) {
      setErr("내용은 500자 이내로 작성해 주세요.");
      return;
    }
    if (!effectiveAuthor) {
      setErr("작성자를 입력해 주세요.");
      return;
    }

    setBusy(true);
    try {
      if (editId) {
        // 서버에 수정 API가 없으면 안내
        try {
          const { data } = await api.put(`/epigrams/${Number(editId)}`, {
            content,
            author: effectiveAuthor,
            referenceTitle: referenceTitle || undefined,
            referenceUrl: referenceUrl || undefined,
            tags,
          });
          const id = data?.id ?? Number(editId);
          router.push(`/epigrams/${id}`);
          return;
        } catch {
          alert("수정 API가 없거나 오류가 발생했습니다. 새 글로 등록합니다.");
        }
      }

      const created = await createEpigram({
        content,
        author: effectiveAuthor,
        referenceTitle: referenceTitle || undefined,
        referenceUrl: referenceUrl || undefined,
        tags,
      });
      router.push(`/epigrams/${created.id}`);
    } catch (error: unknown) {
      setErr(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-[720px] px-4 py-10">
      <h1 className="mb-8 text-[20px] font-semibold text-gray-800">
        {editId ? "에피그램 수정" : "에피그램 만들기"}
      </h1>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* 내용 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            내용 <span className="text-red-500">*</span>
          </label>
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={7}
              maxLength={600}
              placeholder="500자 이내로 입력해 주세요."
              className="w-full resize-none rounded-2xl bg-transparent px-4 py-3 text-[15px] leading-7 text-gray-800 placeholder:text-gray-400 focus:outline-none"
            />
            <div className="flex items-center justify-between px-4 pb-3 text-xs">
              <span className={overflow ? "text-red-500" : "text-gray-400"}>
                {content.length}/500
              </span>
              {overflow && (
                <span className="text-red-500">
                  내용은 500자 이내여야 합니다.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 저자 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            저자 <span className="text-red-500">*</span>
          </label>
          <div className="mb-3 flex flex-wrap items-center gap-5 text-sm text-gray-700">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="authorMode"
                checked={authorMode === "direct"}
                onChange={() => setAuthorMode("direct")}
              />
              직접 입력
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="authorMode"
                checked={authorMode === "unknown"}
                onChange={() => setAuthorMode("unknown")}
              />
              알 수 없음
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="authorMode"
                checked={authorMode === "me"}
                onChange={() => setAuthorMode("me")}
              />
              본인
            </label>
          </div>
          {authorMode === "direct" && (
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="저자 이름 입력"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-gray-400"
            />
          )}
        </div>

        {/* 출처 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-gray-600">
              출처 제목
            </label>
            <input
              value={referenceTitle}
              onChange={(e) => setReferenceTitle(e.target.value)}
              placeholder="블로그/책 등 제목"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-gray-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">URL</label>
            <input
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              placeholder="URL (ex. https://...)"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-gray-400"
            />
          </div>
        </div>

        {/* 태그 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            태그 (최대 3개, 태그당 10자)
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 shadow-sm"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => setTags((p) => p.filter((x) => x !== t))}
                  className="ml-1 rounded px-1 hover:bg-gray-50"
                  title="태그 삭제"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={onTagKey}
              placeholder="엔터/쉼표로 추가"
              className="min-w-[220px] flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-gray-400"
            />
            <button
              type="button"
              onClick={() => {
                addTag(tagInput);
                setTagInput("");
              }}
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 shadow-sm hover:bg-gray-50"
            >
              추가
            </button>
          </div>
        </div>

        {err && <p className="text-sm text-red-500">{err}</p>}

        <button
          type="submit"
          disabled={busy || overflow}
          className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-sm hover:opacity-95 disabled:opacity-60"
        >
          {busy ? "저장 중…" : editId ? "수정 완료" : "작성 완료"}
        </button>
      </form>
    </main>
  );
}
