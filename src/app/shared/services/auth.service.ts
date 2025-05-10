import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseURL = environment.apiUrl;
  constructor(private _HttpClient: HttpClient, private translate: TranslateService) {
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

  private getHeadersWithToken(): HttpHeaders {
    const currentLang = this.translate.currentLang || (localStorage.getItem('lang') || 'ar');
    const token = localStorage.getItem('ClientToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept-Language': currentLang
    });
  }

  setRegister(userData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/client/register`, userData);
  }

  setLogin(userData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/client/login`, userData, { headers: this.getHeadersWithToken() });
  }

  getProductBranch(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/client/get-product-branch`, { headers: this.getHeadersWithToken() });
  }

getProductBranchById(id: string): Observable<any> {
  return this._HttpClient.get(`${this.baseURL}/client/get-product-by-id/${id}`, { headers: this.getHeadersWithToken() });
}

// Route::post('/get-product-branch-by-id', [ProductController::class, 'getProductBranchById']);
  addProductBranchById(id: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/client/get-product-branch-by-id`, { id }, { headers: this.getHeadersWithToken() });
  }



}
