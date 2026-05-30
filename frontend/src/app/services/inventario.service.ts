import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InventarioService {
  private apiUrl = 'http://localhost:3000/api/inventario';

  constructor(private http: HttpClient) {}

  crearProducto(payload: {
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    imageUrl: string;
    category: string;
    detalles: string;
    inStock: boolean;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}`, payload);
  }

  actualizarProducto(
    id: number,
    payload: {
      nombre: string;
      descripcion: string;
      precio: number;
      stock: number;
      imageUrl: string;
      category: string;
      detalles: string;
      inStock: boolean;
    },
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  obtenerProductos(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  subirImagen(archivo: File): Observable<{ filename: string; imageUrl?: string }> {
    const formData = new FormData();
    formData.append('image', archivo);
    return this.http.post<{ filename: string; imageUrl: string }>(
      `${this.apiUrl}/upload`,
      formData,
    );
  }
}
