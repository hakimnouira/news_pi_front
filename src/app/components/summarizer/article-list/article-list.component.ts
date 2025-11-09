import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SummarizerApiService, Summary } from '../../../services/summarizer-api.service';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.scss']
})
export class ArticleListComponent implements OnInit {
  private readonly apiService = inject(SummarizerApiService);
  private readonly router = inject(Router);

  // Signals (Angular 20)
  summaries = signal<Summary[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  currentMethod = signal('hybrid');
  searchQuery = signal('');

  ngOnInit(): void {
    this.loadSummaries();
  }

  loadSummaries(): void {
    this.loading.set(true);
    this.error.set(null);

    this.apiService.getSummaries(
      20,
      0,
      this.currentMethod() !== 'all' ? this.currentMethod() : undefined,
      this.searchQuery() || undefined
    ).subscribe({
      next: (data) => {
        this.summaries.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(`Loading error: ${err.message}`);
        this.loading.set(false);
      }
    });
  }

  filterByMethod(method: string): void {
    this.currentMethod.set(method);
    this.loadSummaries();
  }

  performSearch(): void {
    this.loadSummaries();
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  viewArticle(articleId: string): void {
    this.router.navigate(['/summarizer/article', articleId]);
  }

  truncateText(text: string, length: number): string {
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  trackBySummaryId(index: number, summary: Summary): string {
    return summary.summary_id;
  }
}