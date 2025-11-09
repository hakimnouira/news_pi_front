import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserMini {
  id: number;
  username: string;
  avatar_url?: string | null;
}

export interface PostOut {
  id: number;
  title: string;
  content: string;
  author_id: number;
  media_url?: string | null;                 // absolute URL now from API
  media_type?: 'image' | 'video' | null;
  author?: UserMini | null;                  // ✅ username available
}

export interface PostCreate {
  title: string;
  content: string;
}

export interface PostUpdate {
  title?: string;
  content?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/v1/posts';

  constructor(private http: HttpClient) {}

  listPosts(): Observable<PostOut[]> {
    return this.http.get<PostOut[]>(`${this.apiUrl}/`);
  }

  getPost(id: number): Observable<PostOut> {
    return this.http.get<PostOut>(`${this.apiUrl}/${id}`);
  }

  createPost(dto: PostCreate, file?: File): Observable<PostOut> {
    const form = new FormData();
    form.append('title', dto.title);
    form.append('content', dto.content);
    if (file) form.append('file', file);
    return this.http.post<PostOut>(`${this.apiUrl}/`, form);
  }

  updatePost(
    id: number,
    dto: PostUpdate,
    opts?: { file?: File; clearMedia?: boolean }
  ): Observable<PostOut> {
    const form = new FormData();
    if (dto.title !== undefined) form.append('title', dto.title);
    if (dto.content !== undefined) form.append('content', dto.content);
    if (opts?.file) form.append('file', opts.file);
    if (opts?.clearMedia) form.append('clear_media', String(true));
    return this.http.put<PostOut>(`${this.apiUrl}/${id}`, form);
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
