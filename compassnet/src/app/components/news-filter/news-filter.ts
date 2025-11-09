import { Component } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsFilter as NewsFilterService } from '../../services/news-filter';

@Component({
  selector: 'app-news-filter',
  standalone: true,        // important for Angular 18 standalone component
  imports: [CommonModule, FormsModule, DecimalPipe], // fixes *ngIf, *ngFor, ngModel, number pipe
  templateUrl: './news-filter.html',
  styleUrls: ['./news-filter.scss'],
})
export class NewsFilterComponent {   // ✅ rename component
  inputText: string = '';
  loading: boolean = false;
  results: any[] = [];

  labels = ['toxicity','severe_toxicity','obscene','identity_attack','insult','threat','sexual_explicit'];
  thresholds: Record<string, number> = {
    'toxicity': 0.35,
    'severe_toxicity': 0.10,
    'obscene': 0.25,
    'identity_attack': 0.20,
    'insult': 0.40,
    'threat': 0.20,
    'sexual_explicit': 0.25
  };

  constructor(private newsService: NewsFilterService) {}

analyzeText() {
  if (!this.inputText.trim()) return;
  this.loading = true;

  this.newsService.analyzeText(this.inputText).subscribe({
    next: (res: any) => {
      const explanations: string[] = [];

      for (const label of this.labels) {
        const score = res.scores[label];
        const threshold = this.thresholds[label];

        if (score > threshold) {
          switch (label) {
            case 'toxicity':
              explanations.push('The text contains toxic or harmful language.');
              break;
            case 'severe_toxicity':
              explanations.push('The text shows severe forms of toxicity or hate speech.');
              break;
            case 'obscene':
              explanations.push('Obscene or inappropriate words were detected.');
              break;
            case 'identity_attack':
              explanations.push('The text includes identity-based attacks or discrimination.');
              break;
            case 'insult':
              explanations.push('Insulting or disrespectful language detected.');
              break;
            case 'threat':
              explanations.push('Threatening language was identified.');
              break;
            case 'sexual_explicit':
              explanations.push('Sexually explicit or suggestive content detected.');
              break;
          }
        }
      }

      // Safe explanation if none exceeded thresholds
      const explanation =
        explanations.length > 0
          ? explanations.join(' ')
          : 'This text appears safe and free of harmful or offensive language.';

      this.results = [
        { text: this.inputText, scores: res.scores, status: res.status, explanation }
      ];
      this.loading = false;
    },
    error: (err) => {
      console.error(err);
      this.loading = false;
    }
  });
}




}
