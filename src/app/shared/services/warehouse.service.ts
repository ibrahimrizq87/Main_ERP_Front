import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private baseURL = environment.apiUrl;
  constructor(private _HttpClient: HttpClient) {
  }

  // Get token to send it with each request
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return headers;
  }

  private handleError(error: any) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {

      errorMessage = `Error: ${error.error.message}`;
    } else {

      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  // addProduct(productData: FormData): Observable<any> {
  //   const token = localStorage.getItem('Token');
  //   const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  //   return this._HttpClient.post(`${this.baseURL}/products`, productData, { headers }).pipe(
  //     catchError(this.handleError));
  // }

  indexProductsGroups(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/products-group`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  indexProductsBarcodes(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/products-barcode`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  indexProductsPrices(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/products-price`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }
}
