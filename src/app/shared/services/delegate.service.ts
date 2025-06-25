import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class DelegateService {

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
  

    
  addDelegate(storeData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/delegates`, storeData ,{ headers:this.getHeadersWithToken() });
  }
  getAllDelegates(
          searchTerm: string = '',
          page: number = 1,
          perPage: number = 10
  ): Observable<any> {
          let params = new HttpParams();
          if (searchTerm !== '') params = params.set('searchTerm', searchTerm);
          if (page !== 1) params = params.set('page', page);
          if (perPage !== 10) params = params.set('per_page', perPage);
          
    return this._HttpClient.get(`${this.baseURL}/general/delegates` ,{ headers:this.getHeadersWithToken(),
      params:params
     });
  }
  deleteDelegate(storeId: number): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/general/delegates/${storeId}`, { headers:this.getHeadersWithToken() });
  }
  showDelegateById(id:any): Observable<any>{
    return this._HttpClient.get(this.baseURL+"/general/delegates/"+id, { headers:this.getHeadersWithToken()  });
  }
  updateDelegate(store_id: string, storeData: FormData): Observable<any> {
    storeData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/general/delegates/${store_id}`, storeData, { headers:this.getHeadersWithToken()  });
  }
}
