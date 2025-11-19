// src/types/api.ts
// ─────────────────────────────────────────────────────────────────────────────
// Shared primitives
export type ID = number;
/** ISO 8601 formatted date string */
export type ISODate = string;

// ─────────────────────────────────────────────────────────────────────────────
// Auth
export interface User {
  id: ID;
  email: string;
  nickname: string;
  teamId: string;
  image: string | null;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

// Request DTOs
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

export interface RefreshTokenBody {
  refreshToken: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Epigram & Tags
export interface Tag {
  id: ID;
  name: string;
}

export interface EpigramBase {
  id: ID;
  content: string;
  author: string;
  referenceTitle?: string;
  referenceUrl?: string;
  writerId: ID;
  tags: Tag[];
  likeCount: number;
}

export interface EpigramDetail extends EpigramBase {
  /** 현재 로그인 사용자의 좋아요 여부 */
  isLiked: boolean;
}

// Request DTOs
export interface CreateEpigramBody {
  content: string;
  author: string;
  referenceTitle?: string;
  referenceUrl?: string;
  tags?: string[]; // swagger: string[]
}

// 목록 공통 페이징
export interface Page<T> {
  totalCount: number;
  nextCursor: number | null;
  list: T[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Comment
export interface CommentWriter {
  id: ID;
  nickname: string;
  image: string | null;
}

export interface CommentItem {
  id: ID;
  epigramId: ID;
  content: string;
  isPrivate: boolean;
  createdAt: ISODate;
  updatedAt: ISODate;
  writer: CommentWriter;
}

export type CommentPage = Page<CommentItem>;

// Request DTO
export interface CreateCommentBody {
  epigramId: ID;
  content: string;
  isPrivate: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Image upload
export interface UploadImageResponse {
  url: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Convenience aliases for specific endpoints
export type MeResponse = User;
/** 좋아요/좋아요 취소 응답은 상세 에피그램 객체를 반환 */
export type LikeResponse = EpigramDetail;
