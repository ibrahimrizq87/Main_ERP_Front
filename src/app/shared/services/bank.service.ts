import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class BankService {

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

   

  addBank(bankData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/banks`, bankData ,{ headers:this.getHeadersWithToken() });
  }
  viewAllBanks(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/banks`,{ headers:this.getHeadersWithToken() });
  }
  getBankById(id:any): Observable<any>{
    return this._HttpClient.get(this.baseURL+"/general/banks/"+id, { headers:this.getHeadersWithToken()  });
  }
  updateBank(bankId: string, bankData: FormData): Observable<any> {
    bankData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/general/banks/${bankId}`, bankData, { headers:this.getHeadersWithToken() });
  }
  deleteBank(bankId: number): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/general/banks/${bankId}`, { headers:this.getHeadersWithToken()  });
  }


  
  viewAllBankBranches(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/banck_branch`,{ headers });
  }
  getBankBranchesByBank(id:string): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/banck_branch/byBank/${id}`,{ headers })
  }
  addBankBranch(bankBranchData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.post(`${this.baseURL}/banck_branch`, bankBranchData ,{ headers });
  }
  deleteBankBranch(bankBranchId: number): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.delete(`${this.baseURL}/banck_branch/${bankBranchId}`, { headers });
  }
  showBankBranch(id:any): Observable<any>{
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(this.baseURL+"/banck_branch/"+id, { headers });
  }
  updateBankBranch(bankBranchId: string, bankBranchData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    bankBranchData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/banck_branch/${bankBranchId}`, bankBranchData, { headers });
  }
}
