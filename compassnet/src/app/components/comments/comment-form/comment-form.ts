import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentService, CommentCreate } from '../../../services/comment.service';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment-form.html',
  styleUrls: ['./comment-form.scss'],
})
export class CommentFormComponent {
  private commentsApi = inject(CommentService);

  @Input() postId!: number;
  @Output() created = new EventEmitter<void>();

  text = '';
  loading = false;
  error: string | null = null;

  submit(): void {
    this.error = null;
    const content = this.text.trim();
    if (!content) return;

    this.loading = true;
    const dto: CommentCreate = { content };
    this.commentsApi.createForPost(this.postId, dto).subscribe({
      next: () => {
        this.text = '';
        this.loading = false;
        this.created.emit();
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Failed to add comment.';
        this.loading = false;
      }
    });
  }
}
