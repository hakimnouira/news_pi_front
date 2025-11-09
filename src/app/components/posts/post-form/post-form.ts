import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostService, PostCreate, PostOut, PostUpdate } from '../../../services/post.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './post-form.html',
  styleUrls: ['./post-form.scss'],
})
export class PostFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postsApi = inject(PostService);
  private auth = inject(AuthService);

  isEdit = false;
  postId: number | null = null;
  loading = false;
  error: string | null = null;

  form: PostCreate = { title: '', content: '' };

  // Media state
  selectedFile: File | null = null;
  selectedPreviewUrl: string | null = null;
  selectedMediaType: 'image' | 'video' | null = null;

  // Existing media (when editing)
  existingMediaUrl: string | null = null;
  existingMediaType: 'image' | 'video' | null = null;

  // If true, clear server-side media on save (only for edit)
  clearExistingMedia = false;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!idParam;
    if (this.isEdit) {
      this.postId = Number(idParam);
      this.loadPost();
    }
  }

  isAuthed(): boolean {
    return this.auth.isAuthenticated();
  }

  private loadPost(): void {
    if (!this.postId) return;
    this.loading = true;
    this.postsApi.getPost(this.postId).subscribe({
      next: (p: PostOut) => {
        this.form.title = p.title;
        this.form.content = p.content;
        this.existingMediaUrl = p.media_url ?? null;
        this.existingMediaType = (p.media_type as any) ?? null;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Failed to load post.';
        this.loading = false;
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;

    this.selectedFile = file;
    if (this.selectedPreviewUrl) {
      URL.revokeObjectURL(this.selectedPreviewUrl);
    }
    this.selectedPreviewUrl = URL.createObjectURL(file);

    // Set the media type based on the file type
    const fileType = file.type.split('/')[0];
    this.selectedMediaType = fileType === 'image' || fileType === 'video' 
      ? fileType as 'image' | 'video'
      : null;

    // If user picks a new file, they implicitly don't want to clear
    this.clearExistingMedia = false;
  }

  removeSelectedFile() {
    if (this.selectedPreviewUrl) URL.revokeObjectURL(this.selectedPreviewUrl);
    this.selectedFile = null;
    this.selectedPreviewUrl = null;
    this.selectedMediaType = null;
  }

  toggleClearExisting() {
    this.clearExistingMedia = !this.clearExistingMedia;
    // If clearing existing, also drop any newly selected file
    if (this.clearExistingMedia) this.removeSelectedFile();
  }

  submit(): void {
    this.error = null;
    if (!this.form.title.trim() || !this.form.content.trim()) {
      this.error = 'Title and content are required.';
      return;
    }
    this.loading = true;

    if (this.isEdit && this.postId) {
      const dto: PostUpdate = { title: this.form.title, content: this.form.content };
      this.postsApi.updatePost(this.postId, dto, {
        file: this.selectedFile ?? undefined,
        clearMedia: this.clearExistingMedia,
      }).subscribe({
        next: (p) => {
          this.cleanupPreview();
          this.router.navigate(['/posts', p.id]);
        },
        error: (err) => {
          this.error = err?.error?.detail || 'Update failed.';
          this.loading = false;
        },
      });
    } else {
      this.postsApi.createPost(this.form, this.selectedFile ?? undefined).subscribe({
        next: (p) => {
          this.cleanupPreview();
          this.router.navigate(['/posts', p.id]);
        },
        error: (err) => {
          this.error = err?.error?.detail || 'Create failed.';
          this.loading = false;
        },
      });
    }
  }

  private cleanupPreview() {
    if (this.selectedPreviewUrl) {
      URL.revokeObjectURL(this.selectedPreviewUrl);
      this.selectedPreviewUrl = null;
    }
  }
}
