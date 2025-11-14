// lib/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { RefreshTokenResponse } from "@/src/types/api";

const BASE = `${process.env.NEXT_PUBLIC_API_BASE}/${process.env.NEXT_PUBLIC_TEAM_ID}`;

/** 문자열만 다루는 로컬 스토리지 래퍼 */
const storage = {
  get(key: string): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  },
  set(key: string, value: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  },
  remove(key: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  },
};

export const ACCESS = "accessToken";
export const REFRESH = "refreshToken";

/** refresh 재시도 플래그를 추가한 원 요청 설정 */
export interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({ baseURL: BASE });

/**
 * 요청 인터셉터: accessToken이 있으면 Authorization 자동 첨부
 * - headers가 객체/클래스( AxiosHeaders ) 모두인 경우를 대응
 */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const at = storage.get(ACCESS);
  if (at) {
    // 객체 헤더 케이스를 기본으로 처리
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${at}`;
  }
  return config;
});

/**
 * 응답 인터셉터:
 * - 401이면 refresh-token으로 1회 토큰 재발급 후 원 요청 재시도
 * - 헤더는 재설정하지 않음(요청 인터셉터가 새 토큰을 알아서 붙임)
 */
api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const status = err.response?.status;
    const original = err.config as RetryConfig | undefined;

    if (status === 401 && original && !original._retry) {
      const rt = storage.get(REFRESH);
      if (rt) {
        original._retry = true;

        const { data } = await axios.post<RefreshTokenResponse>(
          `${BASE}/auth/refresh-token`,
          { refreshToken: rt }
        );

        // 새 accessToken 저장(다음 요청부터 요청 인터셉터가 자동 첨부)
        storage.set(ACCESS, data.accessToken);

        // ⛔ 여기서 original.headers를 통째로 재할당하지 않는다 (ts2322 방지)
        return axios(original);
      }
    }
    return Promise.reject(err);
  }
);

export { api, storage };
