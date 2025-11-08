import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserOut, UserUpdate } from '../models/auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/v1/users';  // Adjusted prefix

  constructor(private http: HttpClient) {}  // No AuthService needed

  getMe(): Observable<UserOut> {
    return this.http.get<UserOut>(`${this.apiUrl}/me`);  // Interceptor adds token
  }

  updateMe(updates: UserUpdate): Observable<UserOut> {
    return this.http.put<UserOut>(`${this.apiUrl}/me`, updates);  // Interceptor adds token
  }

  getUsers(): Observable<UserOut[]> {
    return this.http.get<UserOut[]>(`${this.apiUrl}/`);  // Interceptor adds token
  }
}