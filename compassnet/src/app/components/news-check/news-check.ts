import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-news-check',
      imports: [CommonModule, FormsModule],
      standalone: true,
  templateUrl: './news-check.html',
  styleUrl: './news-check.scss',
})
export class NewsCheck {
 isTextMode = true;
  headline: string = '';
  currentFile: File | null = null;

  // Result area bindings
  verdictBadge: string = 'Ready';
  verdictText: string = 'Paste text or upload an image to get a verdict.';
  scoreLabel: string = '—';
  scoreBar: number = 0;
  contextText: string = 'A short, human-friendly explanation appears here to make the verdict easy to act on.';

  // XAI Section bindings
  xaiSectionVisible: boolean = false;
  xaiClaims: string = '—';
  xaiSourceEval: string = '—';
  xaiFactors: string[] = [];
  xaiEvidence: string = '—';
  xaiCalculation: string = '—';

  setTab(mode: 'text' | 'image'): void {
    this.isTextMode = (mode === 'text');
    this.clearInput();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.currentFile = input.files[0];
    }
  }

  checkNow(): void {
    if (this.isTextMode) {
      if (!this.headline.trim()) {
        this.showError('Please enter some text to verify');
        return;
      }
      this.verifyText(this.headline.trim());
    } else {
      if (!this.currentFile) {
        this.showError('Please upload an image first');
        return;
      }
      this.verifyImage(this.currentFile);
    }
  }

  clearInput(): void {
    this.headline = '';
    this.currentFile = null;
    this.verdictBadge = 'Ready';
    this.verdictText = 'Paste text or upload an image to get a verdict.';
    this.scoreLabel = '—';
    this.scoreBar = 0;
    this.contextText = 'A short, human-friendly explanation appears here to make the verdict easy to act on.';
    this.xaiSectionVisible = false;
    this.xaiClaims = '—';
    this.xaiSourceEval = '—';
    this.xaiFactors = [];
    this.xaiEvidence = '—';
    this.xaiCalculation = '—';
  }

  showError(message: string): void {
    this.verdictBadge = 'Error';
    this.verdictText = message;
    this.scoreBar = 0;
    this.scoreLabel = '—';
    this.contextText = 'Please try again or check your connection.';
    this.xaiSectionVisible = false;
  }

  // Replace with your actual API endpoints & return shape!
  async verifyText(text: string): Promise<void> {
    // Example, adapt for your API:
    try {
      // TODO: Replace with real API endpoint and request!
      const response = await fetch('http://localhost:8050/verify/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!response.ok) {
        throw new Error('Verification failed');
      }
      const data = await response.json();
      this.displayResult(data);
    } catch (error: any) {
      this.showError(error.message ?? 'Error');
    }
  }

  async verifyImage(file: File): Promise<void> {
    try {
      // TODO: Replace with real API endpoint and request!
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8050/verify/image', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        throw new Error('Verification failed');
      }
      const data = await response.json();
      this.displayResult(data);
    } catch (error: any) {
      this.showError(error.message ?? 'Error');
    }
  }

  displayResult(data: any): void {
    // Parse result shape and bind to variables
    const verdictMap: any = {
      support: { badge: 'ok', text: 'Supported', message: 'Evidence supports this claim' },
      contradict: { badge: 'bad', text: 'Contradicted', message: 'Evidence contradicts this claim' },
      unrelated: { badge: 'warn', text: 'Mixed', message: 'Limited or unclear evidence' }
    };
    const verdictInfo = verdictMap[data.verdict] ?? verdictMap.unrelated;
    this.verdictBadge = verdictInfo.text;
    this.verdictText = verdictInfo.message;
    this.scoreLabel = this.formatScore(data.final_credibility_score);
    this.scoreBar = Math.round((data.final_credibility_score / 5) * 100);
    this.contextText = data.best_evidence || 'A short, human-friendly explanation appears here to make the verdict easy to act on.';

    // XAI Section
    if (data.explanation) {
      this.xaiSectionVisible = true;
      const exp = data.explanation;
      this.xaiClaims = exp.claim_extraction ? `Identified ${exp.claim_extraction.claims_analyzed ?? 1} verifiable claim(s).` : '—';
      this.xaiSourceEval = exp.source_credibility ? `${exp.source_credibility.explanation} – Rated ${this.formatScore(exp.source_credibility.score)}` : '—';
      this.xaiFactors = exp.source_credibility?.contributing_factors ?? [];
      this.xaiEvidence = exp.best_evidence_selection?.verdict_explanation ?? '—';
      this.xaiCalculation = exp.final_calculation?.explanation ?? '—';
    } else {
      this.xaiSectionVisible = false;
    }
  }

  formatScore(score: number): string {
    const percentage = Math.round(score * 20); // Convert 0-5 to 0-100
    if (percentage >= 80) return `${percentage}% (Excellent)`;
    if (percentage >= 60) return `${percentage}% (Good)`;
    if (percentage >= 40) return `${percentage}% (Fair)`;
    return `${percentage}% (Low)`;
  }
}