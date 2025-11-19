import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

function Block({
  title,
  description,
  imageSrc,
  imageLeft = true,
}: {
  title: ReactNode;
  description?: ReactNode;
  imageSrc: string;
  imageLeft?: boolean;
}) {
  return (
    <section className="w-full py-16">
      <div className="mx-auto grid max-w-[1000px] grid-cols-1 items-center gap-10 px-4 md:grid-cols-2">
        {/* 이미지 */}
        <div className={imageLeft ? "order-1" : "order-2 md:order-2"}>
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <Image
              src={imageSrc} // 예: "/landing-1.png"
              alt="landing visual"
              width={880}
              height={560}
              className="h-auto w-full"
              priority
            />
          </div>
        </div>
        {/* 텍스트 */}
        <div className={imageLeft ? "order-2" : "order-1 md:order-1"}>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-gray-500">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-[#fbfcfe]">
      {/* ───── 헤더: 로고 + 피드(왼쪽), 로그인(오른쪽) ───── */}
      <header className="w-full bg-white">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center">
              {/* 로고 자체에 'epigram' 텍스트 포함되어 있으므로 별도 텍스트 제거 */}
              <Image
                src="/logo.svg"
                alt="epigram logo"
                width={112}
                height={28}
                className="h-7 w-auto md:h-8"
                priority
              />
            </Link>
            <Link
              href="/feed"
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              피드
            </Link>
          </div>
          <nav className="text-sm">
            <Link href="/login" className="text-gray-500 hover:text-gray-800">
              로그인
            </Link>
          </nav>
        </div>
      </header>

      {/* ───── 히어로: 줄무늬 배경 유지 ───── */}
      <section
        className="w-full py-24"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, rgba(17,24,39,0.04) 0, rgba(17,24,39,0.04) 28px, transparent 29px, transparent 58px)",
        }}
      >
        <div className="mx-auto max-w-[760px] px-4 text-center">
          <h1 className="text-2xl leading-relaxed text-gray-800 md:text-[28px]">
            나만 갖고 있기에
            <br />
            아까운 글이 있지 않나요?
          </h1>
          <p className="mt-4 text-sm text-gray-400">
            다른 사람들에게 감정을 공유해 보세요.
          </p>
        </div>
      </section>

      {/* ───── 섹션 1: 이미지 왼쪽 ───── */}
      <Block
        imageSrc="/landing-1.png"
        imageLeft
        title={
          <>
            명언이나 글귀,
            <br />
            또는 소소한 감정을 공유해 보세요.
          </>
        }
        description={
          <>
            나만 알던 소중한 문장을
            <br />
            다른 사람들에게 전해 보세요.
          </>
        }
      />

      {/* ───── 섹션 2: 이미지 오른쪽 ───── */}
      <Block
        imageSrc="/landing-2.png"
        imageLeft={false}
        title={
          <>
            감정 상태에 따라,
            <br />
            알맞은 위로를 받을 수 있어요.
          </>
        }
        description={<>태그를 통해 글을 모아 볼 수 있어요.</>}
      />

      {/* ───── 섹션 3: 이미지 왼쪽 ───── */}
      <Block
        imageSrc="/landing-3.png"
        imageLeft
        title={
          <>
            내가 요즘 어떤 감정 상태인지
            <br />
            통계로 한눈에 볼 수 있어요.
          </>
        }
        description={
          <>
            감정 다이어리로
            <br />내 마음에 담긴 감정을 확인해보세요.
          </>
        }
      />

      {/* ───── 사용자 에피그램 카드 3개 ───── */}
      <section className="w-full py-16">
        <div className="mx-auto max-w-[1000px] px-4">
          <h3 className="text-center text-base font-semibold text-gray-700">
            사용자들이 직접 인용한 에피그램들
          </h3>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {["/card-1.png", "/card-2.png", "/card-3.png"].map((src) => (
              <figure
                key={src}
                className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"
              >
                <Image
                  src={src}
                  alt="epigram card"
                  width={380}
                  height={240}
                  className="h-auto w-full rounded-xl"
                />
                <figcaption className="mt-3 text-[12px] text-gray-400">
                  #나아가야할때 #꿈을이루고싶을때
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ───── 푸터: 흰 배경 + 넉넉한 행간 ───── */}
      <footer className="w-full bg-white">
        <div className="mx-auto flex h-[260px] max-w-[1200px] items-center justify-center px-4">
          <div className="text-center leading-[1.45] space-y-2">
            <p className="text-2xl font-extrabold tracking-wide text-gray-800">
              날마다
            </p>
            <p className="text-2xl font-extrabold tracking-wide text-gray-800">
              에피그램
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
