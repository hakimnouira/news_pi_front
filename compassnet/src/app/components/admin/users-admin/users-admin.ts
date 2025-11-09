import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { UserService } from '../../../services/user.service';
import { RoleService, RoleOut } from '../../../services/role.service';
import { UserOut } from '../../../models/auth';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-users-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-admin.html',
  styleUrls: ['./users-admin.scss'],
})
export class UsersAdminComponent implements OnInit {
  private usersApi = inject(UserService);
  private rolesApi = inject(RoleService);
  private auth = inject(AuthService);

  users: UserOut[] = [];
  roles: RoleOut[] = [];

  loading = true;
  error: string | null = null;

  // role picker state per user id
  rolePick: Record<number, string> = {};

  // create-role input + state
  newRole = '';
  creating = false;

  // loading maps per user for nice UX
  assignLoading: Record<number, boolean> = {};
  statusLoading: Record<number, boolean> = {};

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      users: this.usersApi.getUsers(),
      roles: this.rolesApi.listRoles(),
    }).subscribe({
      next: ({ users, roles }) => {
        this.users = users || [];
        this.roles = roles || [];

        for (const u of this.users) {
          if (this.roles.length) this.rolePick[u.id] = this.roles[0].name;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Failed to load users/roles.';
        this.loading = false;
      },
    });
  }

  isRole(u: UserOut, name: string): boolean {
    return (u.roles || []).some((r) => r.name === name);
  }

  assignRole(u: UserOut): void {
    const roleName = (this.rolePick[u.id] || '').trim();
    if (!roleName || this.isRole(u, roleName)) return;

    this.assignLoading[u.id] = true;
    this.rolesApi.assignRole(u.id, roleName).subscribe({
      next: () => {
        // update locally to avoid full refresh
        u.roles = [...(u.roles || []), { id: -1, name: roleName }];
        this.assignLoading[u.id] = false;
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Assign role failed.';
        this.assignLoading[u.id] = false;
      },
    });
  }

  revokeRole(u: UserOut, roleName: string): void {
    this.rolesApi.revokeRole(u.id, roleName).subscribe({
      next: () => {
        u.roles = (u.roles || []).filter((r) => r.name !== roleName);
      },
      error: (err) => (this.error = err?.error?.detail || 'Revoke role failed.'),
    });
  }

  toggleActive(u: UserOut): void {
    const desired = !u.is_active;
    this.statusLoading[u.id] = true;
    this.usersApi.setActive(u.id, desired).subscribe({
      next: (updated) => {
        u.is_active = updated.is_active;
        this.statusLoading[u.id] = false;
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Update status failed.';
        this.statusLoading[u.id] = false;
      },
    });
  }

  /** Create a new role (e.g., 'journalist'). Trims & prevents duplicates. */
  createRole(): void {
    const name = (this.newRole || '').trim();
    if (!name) return;
    if (this.roles.some(r => r.name.toLowerCase() === name.toLowerCase())) {
      this.error = `Role "${name}" already exists.`;
      return;
    }

    this.creating = true;
    this.rolesApi.createRole(name).subscribe({
      next: (r) => {
        // add to roles list and clear input
        this.roles = [...this.roles, r];
        this.newRole = '';
        this.creating = false;
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Failed to create role.';
        this.creating = false;
      },
    });
  }

  /** UI guard: don't let me remove my own 'admin' role */
  canRevoke(u: UserOut, roleName: string): boolean {
    const me = this.auth.getCurrentUser();
    if (!me) return true;
    const isSelf = me.id === u.id;
    if (isSelf && roleName === 'admin') return false;
    return true;
  }
}
