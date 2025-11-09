import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostService, PostOut } from '../../../services/post.service';
import { AuthService } from '../../../services/auth.service';
import { CommentFormComponent } from '../../comments/comment-form/comment-form';
import { CommentListComponent } from '../../comments/comment-list/comment-list';


@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CommentListComponent, CommentFormComponent],
  templateUrl: './post-detail.html',
  styleUrls: ['./post-detail.scss'],
})
export class PostDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private postsApi = inject(PostService);
  private auth = inject(AuthService);

  postId!: number;
  post: PostOut | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.postId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load(): void {
    this.loading = true;
    this.postsApi.getPost(this.postId).subscribe({
      next: (p) => { this.post = p; this.loading = false; },
      error: (err) => { this.error = err?.error?.detail || 'Not found.'; this.loading = false; }
    });
  }

  isOwner(): boolean {
    const me = this.auth.getCurrentUser();
    return !!(me && this.post) && me.id === this.post.author_id;
  }

  isAuthed(): boolean {
    return this.auth.isAuthenticated();
  }

  // Called when a comment is added/updated/deleted to refresh list in child
  handleCommentsChanged(listCmp: CommentListComponent) {
    listCmp.reload();
  }
}
