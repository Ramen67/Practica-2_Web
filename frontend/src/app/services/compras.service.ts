import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ComprasService {
  private apiUrl = 'http://localhost:3000/api/compras';

  constructor(private http: HttpClient) {}

  registrarCompra(productos: any[], subtotal: number, iva: number, total: number): Observable<any> {
    return this.http.post(`${this.apiUrl}`, { productos, subtotal, iva, total });
  }
}
