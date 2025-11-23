"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";

function isEmail(v: string): boolean {
  // 간단한 이메일 형식 검증
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function LoginPage() {
  const r = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPw, setShowPw] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  // 필드별 에러 상태
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);

  const validateEmailOnBlur = (): void => {
    if (!email.trim()) {
      setEmailErr("이메일은 필수 입력입니다.");
    } else if (!isEmail(email.trim())) {
      setEmailErr("이메일 형식으로 작성해 주세요.");
    } else {
      setEmailErr(null);
    }
  };

  const validatePwOnBlur = (): void => {
    if (!password.trim()) {
      setPwErr("비밀번호는 필수 입력입니다.");
    } else {
      setPwErr(null);
    }
  };

  const canSubmit = (): boolean => {
    // blur 없이 바로 제출해도 방어
    const eErr = !email.trim()
      ? "이메일은 필수 입력입니다."
      : !isEmail(email.trim())
      ? "이메일 형식으로 작성해 주세요."
      : null;
    const pErr = !password.trim() ? "비밀번호는 필수 입력입니다." : null;

    setEmailErr(eErr);
    setPwErr(pErr);

    return !eErr && !pErr;
  };

  const onSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setErr(null);

    if (!canSubmit()) return;

    setBusy(true);
    try {
      await signIn({ email: email.trim(), password });
      // 요구사항: 성공 시 홈(/)
      r.push("/");
    } catch (error: unknown) {
      setErr(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      {/* Top bar */}
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

      {/* Center */}
      <main className="mx-auto flex max-w-[720px] flex-col items-center px-6 py-10">
        <div className="mb-6">
          <Image src="/logo.svg" alt="Epigram" width={140} height={32} />
        </div>

        <form
          onSubmit={onSubmit}
          className="w-full max-w-[520px] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="space-y-3">
            <label className="block text-sm text-gray-600">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
                if (emailErr) setEmailErr(null);
              }}
              onBlur={validateEmailOnBlur}
              placeholder="이메일"
              required
              aria-invalid={!!emailErr}
              aria-describedby={emailErr ? "email-error" : undefined}
              className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                emailErr
                  ? "border-red-300 focus:ring-red-200"
                  : "border-gray-200 focus:border-gray-300 focus:ring-gray-200"
              }`}
            />
            {emailErr && (
              <p id="email-error" className="text-xs text-red-500">
                {emailErr}
              </p>
            )}

            <label className="mt-4 block text-sm text-gray-600">비밀번호</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setPassword(e.target.value);
                  if (pwErr) setPwErr(null);
                }}
                onBlur={validatePwOnBlur}
                placeholder="비밀번호"
                required
                aria-invalid={!!pwErr}
                aria-describedby={pwErr ? "pw-error" : undefined}
                className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                  pwErr
                    ? "border-red-300 focus:ring-red-200"
                    : "border-gray-200 focus:border-gray-300 focus:ring-gray-200"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
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
                  {showPw ? (
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
            {pwErr && (
              <p id="pw-error" className="text-xs text-red-500">
                {pwErr}
              </p>
            )}
          </div>

          {err && <p className="mt-3 text-sm text-red-500">{err}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-5 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition-opacity disabled:opacity-60"
          >
            {busy ? "로그인 중…" : "로그인"}
          </button>

          <p className="mt-3 text-center text-sm text-gray-500">
            회원이 아니신가요?{" "}
            <Link href="/signup" className="underline underline-offset-2">
              가입하기
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
