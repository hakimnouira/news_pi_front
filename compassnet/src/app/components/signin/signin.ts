import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './signin.html',
  styleUrl: './signin.scss',
})
export class Signin {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  showPassword = false;
  year = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.errorMessage = null;
        this.router.navigate(['/']);  // Redirect after login
      },
      error: (err) => {
        this.errorMessage = err.error?.detail || "Invalid email or password";
      }
    });
  }

  openSignup() {
    this.router.navigate(['/signup']);
  }
}
