import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  contrasenia = '';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  login() {
    const email = this.email.trim();

    if (!email || !this.contrasenia) {
      this.error = 'Por favor completa todos los campos';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(email, this.contrasenia).subscribe({
      next: (response: any) => {
        this.authService.setToken(response.token, response.usuario);
        this.router.navigate(['/catalogo']);
      },
      error: (error) => {
        this.error = error?.error?.error || 'Email o contraseña incorrectos';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}

