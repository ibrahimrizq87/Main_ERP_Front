import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BankService {

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
  addBank(bankData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.post(`${this.baseURL}/banks`, bankData ,{ headers }).pipe(
      catchError(this.handleError));
  }
  viewAllBanks(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/banks`,{ headers }).pipe(
      catchError(this.handleError));
  }
  getBankById(id:any): Observable<any>{
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(this.baseURL+"/banks/"+id, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  updateBank(bankId: string, bankData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    bankData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/banks/${bankId}`, bankData, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  deleteBank(bankId: number): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.delete(`${this.baseURL}/banks/${bankId}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  viewAllBankBranches(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/banck_branch`,{ headers }).pipe(
      catchError(this.handleError));
  }
  getBankBranchesByBank(id:string): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/banck_branch/byBank/${id}`,{ headers })
  }
  addBankBranch(bankBranchData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.post(`${this.baseURL}/banck_branch`, bankBranchData ,{ headers }).pipe(
      catchError(this.handleError));
  }
  deleteBankBranch(bankBranchId: number): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.delete(`${this.baseURL}/banck_branch/${bankBranchId}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  showBankBranch(id:any): Observable<any>{
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(this.baseURL+"/banck_branch/"+id, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  updateBankBranch(bankBranchId: string, bankBranchData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    bankBranchData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/banck_branch/${bankBranchId}`, bankBranchData, { headers }).pipe(
      catchError(this.handleError)
    );
  }
}
