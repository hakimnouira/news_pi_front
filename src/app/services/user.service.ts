import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserOut, UserUpdate } from '../models/auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // If you have environments, move this to environment.ts
  private readonly apiUrl = 'http://127.0.0.1:8000/api/v1/users';

  constructor(private http: HttpClient) {}

  /** Get the currently authenticated user */
  getMe(): Observable<UserOut> {
    return this.http.get<UserOut>(`${this.apiUrl}/me`);
  }

  /** Update profile text fields (username, first_name, last_name, bio) */
  updateMe(data: UserUpdate): Observable<UserOut> {
    return this.http.put<UserOut>(`${this.apiUrl}/me`, data);
  }

  /** Upload avatar (file upload, multipart/form-data) */
  uploadAvatar(file: File): Observable<UserOut> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put<UserOut>(`${this.apiUrl}/avatar`, formData);
  }

  /** List all users (requires authentication; ideally admin sees all) */
  getUsers(): Observable<UserOut[]> {
    return this.http.get<UserOut[]>(`${this.apiUrl}/`);
  }

  /** Get a single user by id (optional helper) */
  getUser(userId: number): Observable<UserOut> {
    return this.http.get<UserOut>(`${this.apiUrl}/${userId}`);
  }

  /** Admin: ban/unban a user by toggling is_active */
  setActive(userId: number, isActive: boolean): Observable<UserOut> {
    // Backend route: PUT /api/v1/users/{user_id}/active  body: { is_active: true/false }
    return this.http.put<UserOut>(`${this.apiUrl}/${userId}/active`, { is_active: isActive });
  }
}
