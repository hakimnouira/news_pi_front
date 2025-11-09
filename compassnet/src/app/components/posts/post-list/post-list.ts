import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostService, PostOut } from '../../../services/post.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './post-list.html',
  styleUrls: ['./post-list.scss'],
})
export class PostListComponent implements OnInit {
  private postsApi = inject(PostService);
  private auth = inject(AuthService);

  posts: PostOut[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.error = null;
    this.postsApi.listPosts().subscribe({
      next: (data) => {
        this.posts = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Failed to load posts.';
        this.loading = false;
      },
    });
  }

  isOwner(p: PostOut): boolean {
    const me = this.auth.getCurrentUser();
    return !!me && me.id === p.author_id;
  }

  isAuthed(): boolean {
    return this.auth.isAuthenticated();
  }

  deletePost(p: PostOut): void {
    if (!confirm(`Delete post #${p.id}?`)) return;
    this.postsApi.deletePost(p.id).subscribe({
      next: () => {
        this.posts = this.posts.filter(x => x.id !== p.id);
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Delete failed.';
      }
    });
  }
}
