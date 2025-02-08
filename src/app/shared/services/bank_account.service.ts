import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BankAccountService {

  private baseURL = environment.apiUrl;
  constructor(private _HttpClient: HttpClient) { 
  }
  getAllBankAccounts(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/bank_accounts`,{ headers })
  }
  addBankAccounts(bankAccountData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.post(`${this.baseURL}/bank_accounts`, bankAccountData ,{ headers })
  }
  getBankAccountById(id:any): Observable<any>{
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(this.baseURL+"/bank_accounts/"+id, { headers })
   
  }
  updateBankAccount(bankAccountId: string, bankAccountData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    bankAccountData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/bank_accounts/${bankAccountId}`, bankAccountData, { headers })
  }
  deleteBankAccount(bankAccountId: number): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.delete(`${this.baseURL}/bank_accounts/${bankAccountId}`, { headers })
  }
  addAddtionalBankAccount(bankAccountData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.post(`${this.baseURL}/store-account-bank`, bankAccountData ,{ headers })
  }
  getBankAddAccountById(id:any): Observable<any>{
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(this.baseURL+"/accounts-by-bank/"+id, { headers })
   
  }
}