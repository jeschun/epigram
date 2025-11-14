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
