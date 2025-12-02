import { api, storage, ACCESS, REFRESH } from "./api";
import type { AuthResponse, User } from "@/src/types/api";

export interface SignUpBody {
  email: string;
  nickname: string;
  password: string;
  passwordConfirmation: string;
}

export interface SignInBody {
  email: string;
  password: string;
}

export async function signUp(body: SignUpBody): Promise<User> {
  const { data } = await api.post<AuthResponse>("/auth/signUp", body);
  storage.set(ACCESS, data.accessToken);
  storage.set(REFRESH, data.refreshToken);
  return data.user;
}

export async function signIn(body: SignInBody): Promise<User> {
  const { data } = await api.post<AuthResponse>("/auth/signIn", body);
  storage.set(ACCESS, data.accessToken);
  storage.set(REFRESH, data.refreshToken);
  return data.user;
}

export async function me(): Promise<User> {
  const { data } = await api.get<User>("/users/me");
  return data;
}

export function logout(): void {
  storage.remove(ACCESS);
  storage.remove(REFRESH);
}

/**
 * 클라이언트 로그아웃
 * - 서버 signOut 엔드포인트가 있으면 호출(없어도 무방)
 * - 로컬 토큰 비우기
 * - Authorization 헤더 초기화(axios/커스텀 래퍼 사용 시)
 */
export async function signOut(): Promise<void> {
  try {
    // 서버가 제공하면 사용, 없으면 catch에서 무시
    await api.post("/auth/signOut");
  } catch {
    // noop
  }

  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  } catch {
    // noop
  }

  // 만약 api 래퍼가 전역 Authorization을 기억한다면 여기서 비워 주세요.
  // 예시(axios라면):
  // (api as any).defaults && ((api as any).defaults.headers.common["Authorization"] = undefined);

  // 강제 새로고침으로 헤더 상태도 초기화
  window.location.href = "/";
}
