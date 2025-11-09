import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { UserOut, UserUpdate } from '../../../models/auth';

const API_BASE = 'http://127.0.0.1:8000'; // used to prefix avatar_path served from /static

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.scss'],
})
export class UserProfileComponent implements OnInit {
  private userApi = inject(UserService);
  private auth = inject(AuthService);

  me: UserOut | null = null;
  form: UserUpdate = {};

  loading = true;
  saving = false;
  error: string | null = null;
  success = false;

  // avatar upload state
  selectedAvatar: File | null = null;
  previewUrl: string | null = null;

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) {
      this.error = 'You must be logged in to view your profile.';
      this.loading = false;
      return;
    }

    this.userApi.getMe().subscribe({
      next: (u) => {
        this.me = u;
        this.form = {
          username: u.username,
          first_name: u.first_name ?? '',
          last_name: u.last_name ?? '',
          bio: u.bio ?? '',
          // no avatar_url here anymore; avatar handled via separate upload
        };
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Failed to load profile.';
        this.loading = false;
      },
    });
  }

  /** Absolute URL to show avatar: preview (if chosen) else server path */
  avatarPreview(): string | null {
    if (this.previewUrl) return this.previewUrl;
    const path = (this.me as any)?.avatar_path as string | undefined | null;
    if (path) {
      // backend returns a relative path like "/static/avatars/user_12.png"
      return path.startsWith('http') ? path : `${API_BASE}${path}`;
    }
    return null;
    }

  /** Handle local file selection + show live preview */
  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;

    this.selectedAvatar = file;

    // release old preview (if any)
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = URL.createObjectURL(file);
  }

  /** Upload chosen avatar to server and refresh current user */
  uploadAvatar() {
    if (!this.selectedAvatar) return;

    this.error = null;
    this.success = false;
    this.saving = true;

    this.userApi.uploadAvatar(this.selectedAvatar).subscribe({
      next: (u) => {
        // clear local preview and reflect server state
        if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
        this.previewUrl = null;
        this.selectedAvatar = null;

        this.me = u;
        this.auth.updateCurrentUser(u);
        this.saving = false;
        this.success = true;
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Avatar upload failed.';
        this.saving = false;
      },
    });
  }

  /** Save text fields (username, first/last name, bio) */
  save(): void {
    if (!this.me) return;
    this.error = null;
    this.success = false;
    this.saving = true;

    const payload: UserUpdate = {
      username: this.form.username?.trim(),
      first_name: this.form.first_name?.trim() || '',
      last_name: this.form.last_name?.trim() || '',
      bio: this.form.bio || '',
      // avatar_path not set here; avatar handled by uploadAvatar()
    };

    this.userApi.updateMe(payload).subscribe({
      next: (u) => {
        this.me = u;
        this.saving = false;
        this.success = true;
        this.auth.updateCurrentUser(u); // keep local storage in sync
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Update failed.';
        this.saving = false;
      },
    });
  }
}
