"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signUp } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";

interface SignUpForm {
  email: string;
  nickname: string;
  password: string;
  passwordConfirmation: string;
}

export default function SignUpPage() {
  const r = useRouter();
  const [form, setForm] = useState<SignUpForm>({
    email: "",
    nickname: "",
    password: "",
    passwordConfirmation: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await signUp(form);
      r.push("/epigramlist");
    } catch (error: unknown) {
      setErr(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-[480px] px-4 py-10">
      <h1 className="mb-6 text-xl font-semibold text-gray-800">회원가입</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="이메일"
          required
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400"
        />
        <input
          name="nickname"
          value={form.nickname}
          onChange={onChange}
          placeholder="닉네임"
          required
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400"
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          placeholder="비밀번호"
          required
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400"
        />
        <input
          name="passwordConfirmation"
          type="password"
          value={form.passwordConfirmation}
          onChange={onChange}
          placeholder="비밀번호 확인"
          required
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-gray-400"
        />
        {err && <p className="text-sm text-red-500">{err}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm text-white disabled:opacity-60"
        >
          {busy ? "가입 중…" : "가입하기"}
        </button>
      </form>
    </main>
  );
}
