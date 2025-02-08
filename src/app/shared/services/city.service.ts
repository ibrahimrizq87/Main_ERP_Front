import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CityService {
  private baseURL = environment.apiUrl;
  constructor(private _HttpClient: HttpClient) { 
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
  addCity(cityData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.post(`${this.baseURL}/city`, cityData ,{ headers }).pipe(
      catchError(this.handleError));
  }
  viewAllCities(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/city`,{ headers }).pipe(
      catchError(this.handleError));
  }
  getCityById(id:any): Observable<any>{
    const token = localStorage.getItem('Token');

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this._HttpClient.get(this.baseURL+"/city/"+id, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  updateCity(cityId: string, cityData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    cityData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/city/${cityId}`, cityData, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  deleteCity(cityId: number): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    return this._HttpClient.delete(`${this.baseURL}/city/${cityId}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }
}
