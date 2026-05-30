import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/user';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  updateProfile(nombre: string, email: string, domicilio: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-profile`, { nombre, email, domicilio });
  }

  getOrderHistory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/order-history`);
  }
}
