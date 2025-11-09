import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SummarizerApiService, BotStats, GlobalStats } from '../../../services/summarizer-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private readonly apiService = inject(SummarizerApiService);

  // Signals
  botStats = signal<BotStats | null>(null);
  globalStats = signal<GlobalStats | null>(null);
  loading = signal(true);
  message = signal<{ text: string; type: 'success' | 'error' } | null>(null);
  triggeringBot = signal(false);

  ngOnInit(): void {
    this.loadAllStats();
  }

  loadAllStats(): void {
    this.loading.set(true);

    this.apiService.getBotStats().subscribe({
      next: (data) => this.botStats.set(data),
      error: (err) => {
        console.error('Error loading bot stats:', err);
        this.botStats.set(null);
      }
    });

    this.apiService.getGlobalStats().subscribe({
      next: (data) => {
        this.globalStats.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading global stats:', err);
        this.loading.set(false);
      }
    });
  }

  triggerScraping(): void {
    this.triggeringBot.set(true);
    this.message.set(null);

    this.apiService.triggerScraping().subscribe({
      next: (response) => {
        this.showMessage('Success: ' + response.message, 'success');
        this.triggeringBot.set(false);
        setTimeout(() => this.loadAllStats(), 30000);
      },
      error: (err) => {
        this.showMessage('Error: ' + err.message, 'error');
        this.triggeringBot.set(false);
      }
    });
  }

  refreshStats(): void {
    this.loadAllStats();
    this.showMessage('Statistics refreshed', 'success');
  }

  showMessage(text: string, type: 'success' | 'error'): void {
    this.message.set({ text, type });
    setTimeout(() => this.message.set(null), 5000);
  }

  getBotStatusClass(): string {
    return this.botStats()?.status === 'active' 
      ? 'bg-green-600 text-white' 
      : 'bg-red-600 text-white';
  }

  getBotStatusText(): string {
    return this.botStats()?.status === 'active' ? 'ACTIVE' : 'INACTIVE';
  }
}
