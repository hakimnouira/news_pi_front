// src/app/services/role.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RoleOut { id: number; name: string; }

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly apiUrl = 'http://127.0.0.1:8002/api/v1/roles';

  constructor(private http: HttpClient) {}

  listRoles(): Observable<RoleOut[]> {
    return this.http.get<RoleOut[]>(`${this.apiUrl}/`);
  }

  createRole(name: string): Observable<RoleOut> {
    return this.http.post<RoleOut>(`${this.apiUrl}/`, { name });
  }

  assignRole(userId: number, roleName: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/assign/${userId}/${roleName}`, {});
  }

  revokeRole(userId: number, roleName: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/assign/${userId}/${roleName}`);
  }
}
