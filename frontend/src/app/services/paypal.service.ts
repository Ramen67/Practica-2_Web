import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { enviorment } from '../../envioroments/envioroments';

@Injectable({
  providedIn: 'root',
})
export class PaypalService {
  private http = inject(HttpClient);
  private apiUrl = `${enviorment.apiUrl}/paypal`;
  crearOrden(payload: { items: any[]; total: number }) {
    return this.http.post<{ id: string; status: string }>(`${this.apiUrl}/create-order`, payload);
  }
  capturarOrden(orderId: string) {
    return this.http.post<any>(`${this.apiUrl}/capturar-order`, { orderId });
  }
}
