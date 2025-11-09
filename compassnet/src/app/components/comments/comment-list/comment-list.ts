import { Component, Input, OnChanges, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentService, CommentOut, CommentUpdate } from '../../../services/comment.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment-list.html',
  styleUrls: ['./comment-list.scss'],
})
export class CommentListComponent implements OnInit, OnChanges {
  private commentsApi = inject(CommentService);
  private auth = inject(AuthService);

  @Input() postId!: number;

  comments: CommentOut[] = [];
  loading = false;
  error: string | null = null;

  // inline edit state per comment id
  editId: number | null = null;
  editText = '';

  ngOnInit(): void { this.reload(); }
  ngOnChanges(): void { this.reload(); }

  reload(): void {
    if (!this.postId) return;
    this.loading = true;
    this.error = null;
    this.commentsApi.listForPost(this.postId).subscribe({
      next: (list) => { this.comments = list; this.loading = false; },
      error: () => { this.error = 'Failed to load comments.'; this.loading = false; }
    });
  }

  isOwner(c: CommentOut): boolean {
    const me = this.auth.getCurrentUser();
    return !!me && me.id === c.author_id;
  }

  startEdit(c: CommentOut): void {
    this.editId = c.id;
    this.editText = c.content;
  }

  cancelEdit(): void {
    this.editId = null;
    this.editText = '';
  }

  saveEdit(c: CommentOut): void {
    const payload: CommentUpdate = { content: this.editText.trim() };
    if (!payload.content) return;
    this.commentsApi.updateComment(c.id, payload).subscribe({
      next: (updated) => {
        const idx = this.comments.findIndex(x => x.id === c.id);
        if (idx >= 0) this.comments[idx] = updated;
        this.cancelEdit();
      },
      error: (err) => { this.error = err?.error?.detail || 'Update failed.'; }
    });
  }

  delete(c: CommentOut): void {
    if (!confirm(`Delete comment #${c.id}?`)) return;
    this.commentsApi.deleteComment(c.id).subscribe({
      next: () => this.comments = this.comments.filter(x => x.id !== c.id),
      error: (err) => { this.error = err?.error?.detail || 'Delete failed.'; }
    });
  }
}
