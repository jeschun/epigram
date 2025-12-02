import { api } from "./api";
import type { EpigramListPage } from "@/src/types/api";
import type {
  EpigramBase,
  EpigramDetail,
  Page,
  UploadImageResponse,
  CommentPage,
  CommentItem,
} from "@/src/types/api";

export interface ListParams {
  limit: number;
  cursor?: number;
  keyword?: string;
  writerId?: number;
}

export async function listEpigrams(
  params: ListParams
): Promise<Page<EpigramBase>> {
  const { data } = await api.get<Page<EpigramBase>>("/epigrams", { params });
  return data;
}

export async function getEpigram(id: number): Promise<EpigramDetail> {
  const { data } = await api.get<EpigramDetail>(`/epigrams/${id}`);
  return data;
}

export interface CreateEpigramBody {
  content: string;
  author: string;
  referenceTitle?: string;
  referenceUrl?: string;
  tags: string[]; // swagger에서 문자열 배열
}

export async function createEpigram(
  body: CreateEpigramBody
): Promise<EpigramDetail> {
  const { data } = await api.post<EpigramDetail>("/epigrams", body);
  return data;
}

export async function likeEpigram(id: number): Promise<EpigramDetail> {
  const { data } = await api.post<EpigramDetail>(`/epigrams/${id}/like`);
  return data;
}

export async function unlikeEpigram(id: number): Promise<EpigramDetail> {
  const { data } = await api.delete<EpigramDetail>(`/epigrams/${id}/like`);
  return data;
}

export async function listComments(
  epigramId: number,
  limit: number,
  cursor?: number
): Promise<CommentPage> {
  const { data } = await api.get<CommentPage>(
    `/epigrams/${epigramId}/comments`,
    {
      params: { limit, cursor },
    }
  );
  return data;
}

export interface AddCommentBody {
  epigramId: number;
  content: string;
  isPrivate: boolean;
}

export async function addComment(body: AddCommentBody): Promise<CommentItem> {
  const { data } = await api.post<CommentItem>("/comments", body);
  return data;
}

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("image", file);
  const { data } = await api.post<UploadImageResponse>("/images/upload", form);
  return data.url;
}

// (기존) export interface ListParams { limit: number; cursor?: number; keyword?: string; writerId?: number; }
// (기존) export async function listEpigrams(params: ListParams): Promise<Page<EpigramBase>> { ... }  ← 그대로 OK

export interface UpdateEpigramBody {
  content: string;
  author: string;
  referenceTitle?: string;
  referenceUrl?: string;
  tags: string[];
}

export async function updateEpigram(
  id: number,
  body: UpdateEpigramBody
): Promise<EpigramDetail> {
  // 서버 스펙에 따라 put/patch가 다를 수 있음. 없으면 404/405 발생 → UI에서 안내.
  const { data } = await api.put<EpigramDetail>(`/epigrams/${id}`, body);
  return data;
}

export async function deleteEpigram(id: number): Promise<void> {
  await api.delete(`/epigrams/${id}`);
}

// 댓글 수정/삭제 (서버에 없을 수 있음 → 실패 시 에러로 안내)
export async function updateComment(
  id: number,
  content: string
): Promise<CommentItem> {
  const { data } = await api.put<CommentItem>(`/comments/${id}`, { content });
  return data;
}

export async function deleteComment(id: number): Promise<void> {
  await api.delete(`/comments/${id}`);
}



export async function searchEpigrams(params: {
  keyword: string;
  limit?: number;
  cursor?: number | null;
}): Promise<EpigramListPage> {
  const { keyword, limit = 12, cursor } = params;
  const { data } = await api.get("/epigrams", {
    params: { keyword, limit, cursor: cursor ?? undefined },
  });
  return data;
}