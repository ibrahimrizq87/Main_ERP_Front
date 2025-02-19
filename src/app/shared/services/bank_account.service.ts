import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class BankAccountService {
  private baseURL = environment.apiUrl;
  constructor(private _HttpClient: HttpClient, private translate: TranslateService) {
  }

  

  private getHeaders(): HttpHeaders {
    const currentLang = this.translate.currentLang || (localStorage.getItem('lang') || 'ar');  
    console.log('lang ',currentLang);

    return new HttpHeaders({
      'Accept-Language': currentLang
    });
  }

  

  private getHeadersWithToken(): HttpHeaders {
    const currentLang = this.translate.currentLang || (localStorage.getItem('lang') || 'ar'); 
    const token = localStorage.getItem('Token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept-Language': currentLang
    });
  }



  // 

  addBankAccounts(bankAccountData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/bank-accounts`, bankAccountData ,{ headers: this.getHeadersWithToken() })
  }
  getAllBankAccounts(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/bank-accounts`,{ headers: this.getHeadersWithToken() })
  }
 
  getBankAccountById(id:any): Observable<any>{
    return this._HttpClient.get(this.baseURL+"/general/bank-accounts/"+id, {  headers: this.getHeadersWithToken()  })
   
  }
  updateBankAccount(bankAccountId: string, bankAccountData: FormData): Observable<any> {
    bankAccountData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/general/bank-accounts/${bankAccountId}`, bankAccountData, { headers: this.getHeadersWithToken()  })
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