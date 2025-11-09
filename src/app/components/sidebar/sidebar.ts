import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'], // <-- fixed plural
})
export class Sidebar {
  private auth = inject(AuthService);

  open = true;
  toggle() { this.open = !this.open; }

  isAdmin(): boolean {
    const me = this.auth.getCurrentUser();
    return !!me?.roles?.some(r => r.name === 'admin');
  }
}
