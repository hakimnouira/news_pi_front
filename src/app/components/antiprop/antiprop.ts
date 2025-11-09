import { Component } from '@angular/core';
import { PropagandaResponse, AntipropService } from '../../services/antiprop.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-antiprop',
  imports: [CommonModule, FormsModule],
  templateUrl: './antiprop.html',
  styleUrl: './antiprop.scss',
})
export class Antiprop {

  inputText: string = '';
  result?: PropagandaResponse;
  loading = false;
  errorMessage = '';

  constructor(private antipropService: AntipropService) {}

  analyze() {
    if (!this.inputText.trim()) {
      this.errorMessage = "Please enter text to analyze.";
      return;
    }
    this.errorMessage = '';
    this.loading = true;

    this.antipropService.analyze(this.inputText).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = "Analysis failed. Try again.";
      }
    });
  }
}
