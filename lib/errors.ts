// lib/errors.ts
import { AxiosError, isAxiosError } from "axios";

/** 서버 에러 메시지 안전 추출 */
export function getErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    // err as AxiosError<{ message?: string }>
    const msg = (err.response?.data as { message?: string } | undefined)
      ?.message;
    return msg ?? err.message ?? "요청 처리에 실패했어요.";
  }
  if (err instanceof Error) return err.message;
  return "알 수 없는 오류가 발생했어요.";
}
