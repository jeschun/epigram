"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signUp } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";
import type { AxiosError } from "axios";

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
  const [showPw1, setShowPw1] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [busy, setBusy] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setErr(null);

    if (form.password !== form.passwordConfirmation) {
      setErr("비밀번호가 일치하지 않아요.");
      return;
    }

    setBusy(true);
    try {
      await signUp(form);
      // 요구사항: 성공 시 홈(/)
      r.push("/");
    } catch (error: unknown) {
      // 닉네임 중복 시 500 처리
      const ax = error as AxiosError<{ message?: string }>;
      if (ax?.response?.status === 500) {
        setErr("이미 사용 중인 닉네임이에요.");
      } else {
        setErr(getErrorMessage(error));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <header className="h-14 flex items-center justify-center">
        <Link href="/" aria-label="홈으로 이동">
          <Image
            src="/logo.svg"
            alt="Epigram"
            width={108}
            height={24}
            priority
          />
        </Link>
      </header>

      <main className="mx-auto flex max-w-[760px] flex-col items-center px-6 py-10">
        <div className="mb-6">
          <Image src="/logo.svg" alt="Epigram" width={140} height={32} />
        </div>

        <form
          onSubmit={onSubmit}
          className="w-full max-w-[560px] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-gray-600">이메일</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="이메일"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">
                비밀번호
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPw1 ? "text" : "password"}
                  value={form.password}
                  onChange={onChange}
                  placeholder="비밀번호"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-11 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPw1((v) => !v)}
                  aria-label={showPw1 ? "비밀번호 숨기기" : "비밀번호 보기"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:bg-gray-50"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {showPw1 ? (
                      <>
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-10.94-8 .58-1.78 1.56-3.36 2.84-4.64M6.1 6.1A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 10.94 8-.59 1.8-1.58 3.39-2.87 4.68" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">
                비밀번호 확인
              </label>
              <div className="relative">
                <input
                  name="passwordConfirmation"
                  type={showPw2 ? "text" : "password"}
                  value={form.passwordConfirmation}
                  onChange={onChange}
                  placeholder="비밀번호 확인"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-11 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPw2((v) => !v)}
                  aria-label={showPw2 ? "비밀번호 숨기기" : "비밀번호 보기"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:bg-gray-50"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {showPw2 ? (
                      <>
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-10.94-8 .58-1.78 1.56-3.36 2.84-4.64M6.1 6.1A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 10.94 8-.59 1.8-1.58 3.39-2.87 4.68" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">닉네임</label>
              <input
                name="nickname"
                value={form.nickname}
                onChange={onChange}
                placeholder="닉네임"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          {err && <p className="mt-3 text-sm text-red-500">{err}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition-opacity disabled:opacity-60"
          >
            {busy ? "가입 중…" : "가입하기"}
          </button>
        </form>
      </main>
    </div>
  );
}
