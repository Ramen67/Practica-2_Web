import {
  Component,
  ChangeDetectorRef,
  ElementRef,
  PLATFORM_ID,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
  private platformId = inject(PLATFORM_ID);

  @ViewChild('profileMessage') profileMessage?: ElementRef<HTMLElement>;
  @ViewChild('passwordMessage') passwordMessage?: ElementRef<HTMLElement>;

  readonly avisoPrivacidadUrl = '/uploads/Avisos%20de%20privacidad.pdf';
  readonly terminosUrl = '/uploads/Terminos%20y%20Condiciones.pdf';

  perfil = { id: 0, nombre: '', email: '', domicilio: '', rol: '' };
  historial: any[] = [];
  cargando = true;
  cargandoHistorial = false;
  guardando = false;
  cambiandoContrasenia = false;
  nuevaContrasenia = '';
  confirmarNuevaContrasenia = '';
  error = '';
  exito = '';
  passwordError = '';
  passwordExito = '';

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
    this.exito = '';

    this.userService.getProfile().subscribe({
      next: (perfil) => {
        this.perfil = perfil;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cargar tu perfil';
        this.exito = '';
        this.cargando = false;
        this.cdr.detectChanges();
        this.scrollToMessage(this.profileMessage);
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
        this.exito = '';
        this.cargandoHistorial = false;
        this.cdr.detectChanges();
        this.scrollToMessage(this.profileMessage);
      },
    });
  }

  guardarPerfil(): void {
    const nombre = this.perfil.nombre.trim();
    const email = this.perfil.email.trim();
    const domicilio = this.perfil.domicilio.trim();

    if (!nombre || !email || !domicilio) {
      this.error = 'Nombre, correo y domicilio son obligatorios';
      this.exito = '';
      this.cdr.detectChanges();
      this.scrollToMessage(this.profileMessage);
      return;
    }

    if (!this.isValidEmail(email)) {
      this.error = 'Ingresa un correo electronico valido';
      this.exito = '';
      this.cdr.detectChanges();
      this.scrollToMessage(this.profileMessage);
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
        this.error = '';
        this.guardando = false;
        this.cdr.detectChanges();
        this.scrollToMessage(this.profileMessage);
      },
      error: (error) => {
        this.error = error?.error?.error || 'No se pudo actualizar el perfil';
        this.exito = '';
        this.guardando = false;
        this.cdr.detectChanges();
        this.scrollToMessage(this.profileMessage);
      },
    });
  }

  cambiarContrasenia(): void {
    if (!this.nuevaContrasenia || !this.confirmarNuevaContrasenia) {
      this.passwordError = 'Ingresa y confirma tu nueva contrasena';
      this.passwordExito = '';
      this.cdr.detectChanges();
      this.scrollToMessage(this.passwordMessage);
      return;
    }

    if (this.nuevaContrasenia !== this.confirmarNuevaContrasenia) {
      this.passwordError = 'Las nuevas contrasenas no coinciden';
      this.passwordExito = '';
      this.cdr.detectChanges();
      this.scrollToMessage(this.passwordMessage);
      return;
    }

    if (this.nuevaContrasenia.length < 6) {
      this.passwordError = 'La nueva contrasena debe tener al menos 6 caracteres';
      this.passwordExito = '';
      this.cdr.detectChanges();
      this.scrollToMessage(this.passwordMessage);
      return;
    }

    const contraseniaActual = window.prompt('Ingresa tu contrasena anterior');

    if (contraseniaActual === null) {
      return;
    }

    if (!contraseniaActual) {
      this.passwordError = 'La contrasena anterior es obligatoria';
      this.passwordExito = '';
      this.cdr.detectChanges();
      this.scrollToMessage(this.passwordMessage);
      return;
    }

    this.cambiandoContrasenia = true;
    this.passwordError = '';
    this.passwordExito = '';

    this.userService.changePassword(contraseniaActual, this.nuevaContrasenia).subscribe({
      next: (response) => {
        this.passwordExito = response?.mensaje || 'Contrasena actualizada correctamente';
        this.passwordError = '';
        this.nuevaContrasenia = '';
        this.confirmarNuevaContrasenia = '';
        this.cambiandoContrasenia = false;
        this.cdr.detectChanges();
        this.scrollToMessage(this.passwordMessage);
      },
      error: (error) => {
        this.passwordError = error?.error?.error || 'No se pudo cambiar la contrasena';
        this.passwordExito = '';
        this.cambiandoContrasenia = false;
        this.cdr.detectChanges();
        this.scrollToMessage(this.passwordMessage);
      },
    });
  }

  private scrollToMessage(message?: ElementRef<HTMLElement>): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    setTimeout(() => {
      message?.nativeElement?.scrollIntoView?.({
        behavior: 'smooth',
        block: 'center',
      });
    });
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
