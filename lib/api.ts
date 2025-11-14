import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { RefreshTokenResponse } from "@/src/types/api";

const BASE = `${process.env.NEXT_PUBLIC_API_BASE}/${process.env.NEXT_PUBLIC_TEAM_ID}`;

// 로컬 스토리지 래퍼(문자열 only)
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

export interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({ baseURL: BASE });

// 요청: accessToken 자동 첨부
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const at = storage.get(ACCESS);
  if (at) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${at}`;
  }
  return config;
});

// 응답: 401 시 refresh-token로 1회 재시도
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
        storage.set(ACCESS, data.accessToken);
        // 재시도 시 새 토큰 부착
        original.headers = {
          ...(original.headers ?? {}),
          Authorization: `Bearer ${data.accessToken}`,
        };
        return axios(original);
      }
    }
    return Promise.reject(err);
  }
);

export { api, storage };
