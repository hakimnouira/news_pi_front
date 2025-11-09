import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ==== Interfaces matching FastAPI schemas ====
export interface CommentOut {
  id: number;
  content: string;
  author_id: number;
  post_id: number;
}

export interface CommentCreate {
  content: string;
}

export interface CommentUpdate {
  content?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/v1/comments';

  constructor(private http: HttpClient) {}

  listAll(): Observable<CommentOut[]> {
    return this.http.get<CommentOut[]>(`${this.apiUrl}/`);
  }

  listForPost(postId: number): Observable<CommentOut[]> {
    return this.http.get<CommentOut[]>(`${this.apiUrl}/post/${postId}`);
  }

  createForPost(postId: number, dto: CommentCreate): Observable<CommentOut> {
    return this.http.post<CommentOut>(`${this.apiUrl}/post/${postId}`, dto);
  }

  updateComment(id: number, dto: CommentUpdate): Observable<CommentOut> {
    return this.http.put<CommentOut>(`${this.apiUrl}/${id}`, dto);
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
