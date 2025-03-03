import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class AccountCategoriesService {
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
  
  
    
  
  addAccountCategory(data:FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/account-categories`,data,{ headers:this.getHeadersWithToken() })
  }

  getAllAccountCategories(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/account-categories`,{ headers:this.getHeadersWithToken() });
  }

  deleteAccountCategory(product_id:number): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/general/account-categories/${product_id}`,{ headers:this.getHeadersWithToken() });
  }

 
  getAllAccountCategoryByType(type:string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/account-categories/get-by-type/${type}`,{ headers:this.getHeadersWithToken() });
  }
  getAllAccountCategoryById(product_id:string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/account-categories/${product_id}`,{ headers:this.getHeadersWithToken() });
  }
  updateAccountCategory(product_id:string , productUnitData:FormData): Observable<any> {
    productUnitData.append('_method', 'PUT');

    return this._HttpClient.post(`${this.baseURL}/general/account-categories/${product_id}`,productUnitData,{ headers:this.getHeadersWithToken() });
  }


}
