import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  readonly avisoPrivacidadUrl = '/uploads/Avisos%20de%20privacidad.pdf';
  readonly terminosUrl = '/uploads/Terminos%20y%20Condiciones.pdf';

  email = '';
  nombre = '';
  domicilio = '';
  contrasenia = '';
  confirmarContrasenia = '';
  aceptaTerminos = false;
  aceptaPrivacidad = false;
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  register() {
    const email = this.email.trim();
    const nombre = this.nombre.trim();
    const domicilio = this.domicilio.trim();

    if (!email || !nombre || !domicilio || !this.contrasenia || !this.confirmarContrasenia) {
      this.error = 'Por favor completa todos los campos';
      this.cdr.detectChanges();
      return;
    }

    if (!this.isValidEmail(email)) {
      this.error = 'Ingresa un email valido';
      this.cdr.detectChanges();
      return;
    }

    if (this.contrasenia !== this.confirmarContrasenia) {
      this.error = 'Las contrasenas no coinciden';
      this.cdr.detectChanges();
      return;
    }

    if (this.contrasenia.length < 6) {
      this.error = 'La contrasena debe tener al menos 6 caracteres';
      this.cdr.detectChanges();
      return;
    }

    if (!this.aceptaTerminos || !this.aceptaPrivacidad) {
      this.error = 'Debes aceptar los terminos y el aviso de privacidad';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService
      .register(
        email,
        this.contrasenia,
        nombre,
        domicilio,
        this.aceptaTerminos,
        this.aceptaPrivacidad,
      )
      .subscribe({
        next: (response: any) => {
          this.authService.setToken(response.token, response.usuario);
          this.router.navigate(['/catalogo']);
        },
        error: (error) => {
          this.error = error?.error?.error || 'Error al registrarse. El email podria estar en uso.';
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
