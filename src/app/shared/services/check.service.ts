import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckService {

  private baseURL = environment.apiUrl;
  constructor(private _HttpClient: HttpClient) { 
  }


  addCheck(checkData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.post(`${this.baseURL}/checks`, checkData ,{ headers });
}

getAllChecks(): Observable<any> {
  const token = localStorage.getItem('Token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this._HttpClient.get(`${this.baseURL}/checks` ,{ headers });
}
getCheckById(id:string): Observable<any> {
  const token = localStorage.getItem('Token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this._HttpClient.get(`${this.baseURL}/checks/${id}` ,{ headers });
}

getChecksForOperations(type:number): Observable<any> {
  const token = localStorage.getItem('Token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this._HttpClient.post(`${this.baseURL}/checks/get-checks/operations` ,{type:type} ,{ headers });
}




}