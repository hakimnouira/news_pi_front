import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';

interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;

  translating?: boolean;
  translations?: Record<string, string>; // { 'es': '...', 'fr': '...' }
  translationError?: string;
}

interface Language {
  code: string;
  name: string;
}

@Component({
  selector: 'app-translation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,           // <-- Needed for ngModel
    Sidebar,
    Header,
    Footer
  ],
  templateUrl: './translation.html',
  styleUrls: ['./translation.scss'],
})
export class TranslationComponent implements OnInit {
  articles: Article[] = [];
  loading = true;
  error = '';
  selectedArticle: Article | null = null;

  // --- Language list (add/remove as needed) ---
  languages: Language[] = [
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese (Simplified)' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
  ];

  selectedLang = 'es'; // default

  // --- Mistral AI ---
  private mistralApiUrl = 'https://api.mistral.ai/v1/chat/completions';
  private mistralApiKey = '1X7K499HhPVdqVUJ5TKlkPGXeJDR4omO';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchArticles();
  }

  fetchArticles() {
    const apiKey = '96cbebc85fce46cd9bd1ef99df2aa5b9';
    const apiUrl = `https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=${apiKey}`;

    this.loading = true;
    this.http.get<{ articles: Article[] }>(apiUrl).subscribe({
      next: (data) => {
        this.articles = data.articles.map(a => ({
          ...a,
          translating: false,
          translations: {},
          translationError: undefined,
        }));
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load articles';
        console.error(err);
        this.loading = false;
      },
    });
  }

  openModal(article: Article) {
    this.selectedArticle = article;
  }

  closeModal() {
    this.selectedArticle = null;
  }

  // Optional: reset selected language when modal opens
  onLangChange() {
    // no-op, just for reactivity
  }

  getLangName(code: string): string {
    return this.languages.find(l => l.code === code)?.name ?? code;
  }

  /** Translate article to a specific language */
  translateArticle(article: Article, langCode: string) {
    if (article.translating || article.translations?.[langCode]) return;

    article.translating = true;
    article.translationError = undefined;

    const textToTranslate = `${article.title}\n\n${article.description}`;
    const langName = this.getLangName(langCode);

    const payload = {
      model: 'mistral-small-latest',
      messages: [
        {
          role: 'user',
          content: `Translate the following English text to ${langName}. Keep the structure: title first, then description. Respond ONLY with the translated text, no explanations.\n\nText:\n${textToTranslate}`
        }
      ],
      temperature: 0.1,
      max_tokens: 600,
    };

    this.http
      .post<{ choices: [{ message: { content: string } }] }>(this.mistralApiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${this.mistralApiKey}`,
          'Content-Type': 'application/json'
        },
      })
      .subscribe({
        next: (res) => {
          const translated = res.choices[0].message.content.trim();
          if (!article.translations) article.translations = {};
          article.translations[langCode] = translated;
          article.translating = false;
        },
        error: (err) => {
          console.error('Translation error', err);
          article.translationError = `Failed to translate to ${langName}`;
          article.translating = false;
        },
      });
  }
}