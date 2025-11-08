import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  currentUser: any = null;  // UserOut type if typed

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Restore from storage on init
    this.currentUser = this.authService.getCurrentUser();
  }

  logout() {
    this.authService.logout();
    this.currentUser = null;  // Clear local state immediately
    this.router.navigate(['/signin']);  // Or '/' if redirect to home
  }

  get displayName(): string {
    return this.currentUser?.first_name || this.currentUser?.username || 'User';
  }
}
