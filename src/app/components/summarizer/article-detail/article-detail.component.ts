import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SummarizerApiService, Article } from '../../../services/summarizer-api.service';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.scss']
})
export class ArticleDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly apiService = inject(SummarizerApiService);

  // Signals
  article = signal<Article | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  generatingXAI = signal(false);

  // Expose article as 'art' for template (non-nullable in template context)
  get art(): Article {
    const value = this.article();
    if (!value) {
      throw new Error('Article is null');
    }
    return value;
  }

  ngOnInit(): void {
    const articleId = this.route.snapshot.paramMap.get('id');
    if (articleId) {
      this.loadArticle(articleId);
    } else {
      this.error.set('No article specified');
      this.loading.set(false);
    }
  }

  loadArticle(articleId: string): void {
    this.apiService.getArticle(articleId).subscribe({
      next: (data) => {
        this.article.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(`Loading error: ${err.message}`);
        this.loading.set(false);
      }
    });
  }

  generateXAI(): void {
    const currentArticle = this.article();
    if (!currentArticle) return;

    this.generatingXAI.set(true);
    
    this.apiService.generateXAI(currentArticle.article_id).subscribe({
      next: (response) => {
        if (response.status === 'generated' || response.status === 'cached') {
          this.loadArticle(currentArticle.article_id);
        }
        this.generatingXAI.set(false);
      },
      error: (err) => {
        alert('Error generating XAI analysis. Please try again.');
        this.generatingXAI.set(false);
      }
    });
  }

  getWordCount(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  goBack(): void {
    this.router.navigate(['/summarizer']);
  }

  // ===== TEMPLATE HELPERS =====
  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  objectEntries(obj: any): Array<{key: string, value: any}> {
    return obj ? Object.entries(obj).map(([key, value]) => ({ key, value })) : [];
  }

  trackBySummaryId(index: number, summary: any): any {
    return summary?.id || index;
  }

  renderXAI(xai: any): string {
    let html = '<div class="space-y-6">';
    
    if (xai.method_explanation) {
      const me = xai.method_explanation;
      html += `
        <div class="p-4 bg-[#1b1b2d] rounded-lg border border-gray-700">
          <h4 class="text-lg font-bold text-gray-100 mb-2">Method: ${me.name}</h4>
          <p class="text-gray-300 mb-2">${me.description}</p>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div class="text-gray-400"><strong>Speed:</strong> ${me.speed}</div>
            <div class="text-gray-400"><strong>Accuracy:</strong> ${me.accuracy}</div>
          </div>
        </div>
      `;
    }
    
    if (xai.key_insights && xai.key_insights.length > 0) {
      html += `
        <div class="p-4 bg-[#1b1b2d] rounded-lg border border-gray-700">
          <h4 class="text-lg font-bold text-gray-100 mb-2">Key Insights</h4>
          <ul class="space-y-1">
            ${xai.key_insights.map((insight: string) => `<li class="text-gray-300">• ${insight}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    if (xai.visualizations) {
      html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
      
      if (xai.visualizations.token_importance) {
        html += `
          <div class="p-4 bg-[#1b1b2d] rounded-lg border border-gray-700">
            <h5 class="font-bold text-gray-100 mb-2">Token Importance</h5>
            <img src="${xai.visualizations.token_importance}" alt="Token Importance" class="w-full rounded">
          </div>
        `;
      }
      
      if (xai.visualizations.compression_gauge) {
        html += `
          <div class="p-4 bg-[#1b1b2d] rounded-lg border border-gray-700">
            <h5 class="font-bold text-gray-100 mb-2">Compression</h5>
            <img src="${xai.visualizations.compression_gauge}" alt="Compression" class="w-full rounded">
          </div>
        `;
      }
      
      html += '</div>';
    }
    
    if (xai.attention_analysis?.available) {
      const aa = xai.attention_analysis;
      html += `
        <div class="p-4 bg-[#1b1b2d] rounded-lg border border-gray-700">
          <h4 class="text-lg font-bold text-gray-100 mb-2">Attention Analysis (BART)</h4>
          <p class="text-sm text-gray-400 mb-3">${aa.explanation}</p>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
            ${aa.important_tokens.slice(0, 9).map((token: any) => `
              <div class="p-2 bg-[#24243a] rounded border border-gray-600">
                <div class="font-bold text-gray-100">${token.token}</div>
                <div class="text-sm text-orange-400">${(token.attention_weight * 100).toFixed(1)}%</div>
                <div class="text-xs text-gray-400">${token.impact}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    if (xai.shap_analysis?.available) {
      const shap = xai.shap_analysis;
      html += `
        <div class="p-4 bg-[#1b1b2d] rounded-lg border border-gray-700">
          <h4 class="text-lg font-bold text-gray-100 mb-2">SHAP Analysis</h4>
          <p class="text-sm text-gray-400 mb-3">${shap.explanation}</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            ${shap.top_features.slice(0, 6).map((feature: any) => `
              <div class="p-2 bg-[#24243a] rounded border border-gray-600 flex justify-between items-center">
                <span class="font-medium text-gray-200">${feature.feature}</span>
                <div class="flex gap-2 items-center">
                  <span class="px-2 py-1 rounded text-xs ${feature.impact === 'Positif' ? 'bg-green-600' : 'bg-red-600'} text-white">
                    ${feature.impact}
                  </span>
                  <span class="text-sm text-gray-400">${(feature.shap_value * 100).toFixed(2)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    if (xai.lime_analysis?.available) {
      const lime = xai.lime_analysis;
      html += `
        <div class="p-4 bg-[#1b1b2d] rounded-lg border border-gray-700">
          <h4 class="text-lg font-bold text-gray-100 mb-2">LIME Analysis</h4>
          <p class="text-sm text-gray-400 mb-3">${lime.explanation}</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            ${lime.top_features.slice(0, 6).map((feature: any) => `
              <div class="p-2 bg-[#24243a] rounded border border-gray-600 flex justify-between items-center">
                <span class="font-medium text-gray-200">${feature.word}</span>
                <div class="flex gap-2 items-center">
                  <span class="text-sm text-gray-400">${feature.weight}</span>
                  <span class="text-lg ${feature.impact.includes('Positif') ? 'text-green-500' : 'text-red-500'}">
                    ${feature.impact.includes('Positif') ? 'Positive' : 'Negative'}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    if (xai.recommendations && xai.recommendations.length > 0) {
      html += `
        <div class="p-4 bg-[#1b1b2d] rounded-lg border border-gray-700">
          <h4 class="text-lg font-bold text-gray-100 mb-2">Recommendations</h4>
          <ul class="space-y-1">
            ${xai.recommendations.map((rec: string) => `<li class="text-gray-300">• ${rec}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    html += '</div>';
    return html;
  }
}