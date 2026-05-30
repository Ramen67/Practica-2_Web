import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  readonly avisoPrivacidadUrl = '/uploads/Avisos%20de%20privacidad.pdf';
  readonly terminosUrl = '/uploads/Terminos%20y%20Condiciones.pdf';

  perfil = { id: 0, nombre: '', email: '', domicilio: '', rol: '' };
  historial: any[] = [];
  cargando = true;
  cargandoHistorial = false;
  guardando = false;
  error = '';
  exito = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {
    this.cargarPerfil();
    this.cargarHistorial();
  }

  cargarPerfil(): void {
    this.cargando = true;
    this.error = '';

    this.userService.getProfile().subscribe({
      next: (perfil) => {
        this.perfil = perfil;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cargar tu perfil';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  cargarHistorial(): void {
    this.cargandoHistorial = true;
    this.error = '';

    this.userService.getOrderHistory().subscribe({
      next: (hist) => {
        this.historial = hist || [];
        this.cargandoHistorial = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cargar el historial';
        this.cargandoHistorial = false;
        this.cdr.detectChanges();
      },
    });
  }

  guardarPerfil(): void {
    const nombre = this.perfil.nombre.trim();
    const email = this.perfil.email.trim();
    const domicilio = this.perfil.domicilio.trim();

    if (!nombre || !email || !domicilio) {
      this.error = 'Nombre, correo y domicilio son obligatorios';
      this.cdr.detectChanges();
      return;
    }

    if (!this.isValidEmail(email)) {
      this.error = 'Ingresa un correo electronico valido';
      this.cdr.detectChanges();
      return;
    }

    this.guardando = true;
    this.error = '';
    this.exito = '';

    this.userService.updateProfile(nombre, email, domicilio).subscribe({
      next: (response) => {
        this.perfil = response.usuario;
        this.authService.setUsuario(response.usuario);
        this.exito = 'Perfil actualizado correctamente';
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = error?.error?.error || 'No se pudo actualizar el perfil';
        this.guardando = false;
        this.cdr.detectChanges();
      },
    });
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
