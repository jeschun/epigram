"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";

export default function LoginPage() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await signIn({ email, password });
      r.push("/epigramlist");
    } catch (error: unknown) {
      setErr(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-[420px] px-4 py-10">
      <h1 className="mb-6 text-xl font-semibold text-gray-800">로그인</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          placeholder="이메일"
          required
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400"
        />
        <input
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          placeholder="비밀번호"
          required
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400"
        />
        {err && <p className="text-sm text-red-500">{err}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm text-white disabled:opacity-60"
        >
          {busy ? "로그인 중…" : "로그인"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        계정이 없으신가요?{" "}
        <a href="/signup" className="underline">
          회원가입
        </a>
      </p>
    </main>
  );
}
