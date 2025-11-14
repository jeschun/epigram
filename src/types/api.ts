// === 공통 ===
export type ID = number;
export type ISODate = string;

// === Auth ===
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

// === Epigram & Tags ===
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
  isLiked: boolean;
}

// 목록 공통 페이징
export interface Page<T> {
  totalCount: number;
  nextCursor: number | null | 0;
  list: T[];
}

// === Comment ===
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

// === 이미지 업로드 ===
export interface UploadImageResponse {
  url: string;
}
