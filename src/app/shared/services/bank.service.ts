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


  addBankBranch(bankBranchData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/bank-branches`, bankBranchData ,{  headers:this.getHeadersWithToken() });
  }

  viewAllBankBranches(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/bank-branches`,{ headers:this.getHeadersWithToken() });
  }

  updateBankBranch(bankBranchId: string, bankBranchData: FormData): Observable<any> {
    bankBranchData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/general/bank-branches/${bankBranchId}`, bankBranchData, { headers:this.getHeadersWithToken() });
  }
  showBankBranch(id:any): Observable<any>{
    return this._HttpClient.get(this.baseURL+"/general/bank-branches/"+id, { headers:this.getHeadersWithToken() });
  }

  deleteBankBranch(bankBranchId: number): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/general/bank-branches/${bankBranchId}`, { headers:this.getHeadersWithToken()  });
  }


  
  getBankBranchesByBank(id:string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/bank-branches/get-all-by-bank/${id}`,{ headers:this.getHeadersWithToken() })
  }



}
