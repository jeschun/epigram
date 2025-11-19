"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEpigram, uploadImage } from "@/lib/epigram";
import { getErrorMessage } from "@/lib/errors";

export default function AddEpigramPage() {
  const r = useRouter();
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [referenceTitle, setReferenceTitle] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onUpload = async (file?: File): Promise<void> => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setImageUrl(url);
    } catch (error: unknown) {
      setErr(getErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const tagArr = tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await createEpigram({
        content,
        author,
        referenceTitle: referenceTitle || undefined,
        referenceUrl: referenceUrl || undefined,
        tags: tagArr,
      });
      r.push("/epigramlist");
    } catch (error: unknown) {
      setErr(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-[720px] px-4 py-10">
      <h1 className="mb-6 text-xl font-semibold text-gray-800">
        에피그램 작성
      </h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용"
          rows={5}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400"
          required
        />
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="작성자(출처)"
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400"
          required
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            value={referenceTitle}
            onChange={(e) => setReferenceTitle(e.target.value)}
            placeholder="참고 제목(선택)"
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400"
          />
          <input
            value={referenceUrl}
            onChange={(e) => setReferenceUrl(e.target.value)}
            placeholder="참고 URL(선택)"
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400"
          />
        </div>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="태그(쉼표로 구분)"
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400"
        />

        <div className="rounded-md border border-gray-200 p-3">
          <label className="block text-sm text-gray-600">
            이미지 업로드(선택)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onUpload(e.target.files?.[0])
            }
            className="mt-2 text-sm"
            disabled={uploading}
          />
          {imageUrl && (
            <p className="mt-2 truncate text-xs text-gray-500">
              업로드 URL:{" "}
              <a
                href={imageUrl}
                target="_blank"
                className="underline"
                rel="noreferrer"
              >
                {imageUrl}
              </a>
            </p>
          )}
        </div>

        {err && <p className="text-sm text-red-500">{err}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm text-white disabled:opacity-60"
        >
          {busy ? "등록 중…" : "등록"}
        </button>
      </form>
    </main>
  );
}
