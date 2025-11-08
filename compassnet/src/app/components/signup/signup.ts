import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
signupForm: FormGroup;
  errorMessage: string | null = null;
  showPassword = false;
  year = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.signupForm.invalid) return;

    this.authService.register(this.signupForm.value).subscribe({
      next: () => {
        this.errorMessage = null;
        this.router.navigate(['/signin']);
      },
      error: (err) => {
        this.errorMessage = err.error?.detail || "Registration failed";
      }
    });
  }

  goToSignIn() {
    this.router.navigate(['/signin']);
  }
}
