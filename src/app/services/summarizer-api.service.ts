import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Summary {
  summary_id: string;
  article_id: string;
  method: string;
  title: string;
  summary: string;
  date_published: string;
  overall_score?: number;
  created_at: string;
  image_url?: string;
  source_name?: string;
  source_url?: string;
  structure_5w1h?: any;
}

export interface Article {
  article_id: string;
  original_text: string;
  summaries: Summary[];
  created_at: string;
  image_url?: string;
  source_name?: string;
  source_url?: string;
  xai_explanation?: any;
  xai_cached: boolean;
}

export interface BotStats {
  total_runs: number;
  successful_articles: number;
  failed_articles: number;
  last_run?: string;
  status: string;
}

export interface GlobalStats {
  total_articles: number;
  total_summaries: number;
  articles_by_source: Array<{ _id: string; count: number }>;
  articles_with_images: number;
  recent_24h: number;
}

@Injectable({
  providedIn: 'root'
})
export class SummarizerApiService {
  private readonly http = inject(HttpClient);
  
  // Configuration de l'API 
  private readonly apiUrl = 'http://localhost:8000/api/v1/summarizer';

  // ===== SUMMARIES =====
  getSummaries(
    limit: number = 20,
    skip: number = 0,
    method?: string,
    search?: string,
    source?: string
  ): Observable<Summary[]> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('skip', skip.toString());

    if (method && method !== 'all') {
      params = params.set('method', method);
    }

    if (search) {
      params = params.set('search', search);
    }

    if (source) {
      params = params.set('source', source);
    }

    return this.http.get<Summary[]>(`${this.apiUrl}/summaries`, { params });
  }

  // ===== ARTICLE =====
  getArticle(articleId: string): Observable<Article> {
    return this.http.get<Article>(`${this.apiUrl}/articles/${articleId}`);
  }

  // ===== XAI =====
  generateXAI(articleId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/articles/${articleId}/generate-xai`, {});
  }

  // ===== BOT STATS =====
  getBotStats(): Observable<BotStats> {
    return this.http.get<BotStats>(`${this.apiUrl}/bot/stats`);
  }

  triggerScraping(): Observable<any> {
    return this.http.post(`${this.apiUrl}/bot/trigger`, {});
  }

  // ===== GLOBAL STATS =====
  getGlobalStats(): Observable<GlobalStats> {
    return this.http.get<GlobalStats>(`${this.apiUrl}/stats`);
  }

  // ===== HEALTH CHECK =====
  healthCheck(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }
}