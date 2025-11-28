"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header"; // 파일명을 header.tsx로 쓰고 있다고 했으니 소문자 경로 사용

const HIDE_HEADER: string[] = ["/login", "/signup"];

export default function HeaderGate() {
  const pathname = usePathname();
  const shouldHide = HIDE_HEADER.includes(pathname);
  return shouldHide ? null : <Header />;
}
