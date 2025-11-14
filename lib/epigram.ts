import { api } from "./api";
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
