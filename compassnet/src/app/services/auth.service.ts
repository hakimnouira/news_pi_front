import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, tap } from 'rxjs';
import { UserRegister, Login, Token, UserOut } from '../models/auth';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/v1/auth';  // Adjust prefix if different (e.g., /auth)

  constructor(private http: HttpClient, private userService: UserService) {}

  register(user: UserRegister): Observable<UserOut> {
    return this.http.post<UserOut>(`${this.apiUrl}/register`, user);
  }

  login(credentials: Login): Observable<UserOut> {  // Return UserOut instead of Token for convenience
    return this.http.post<Token>(`${this.apiUrl}/login`, credentials).pipe(
      tap((token: Token) => {
        localStorage.setItem('access_token', token.access_token);
      }),
      switchMap((token: Token) => this.userService.getMe()),  // Fetch user after token storage
      tap((user: UserOut) => {
        localStorage.setItem('current_user', JSON.stringify(user));  // Store user info
      })
    );
  }

  // Helper to get stored user (with fallback to fetch if missing/expired)
  getCurrentUser(): UserOut | null {
    const stored = localStorage.getItem('current_user');
    return stored ? JSON.parse(stored) : null;
  }

  // Update user after profile changes (e.g., from updateMe)
  updateCurrentUser(user: UserOut): void {
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');  // Clear user too
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}