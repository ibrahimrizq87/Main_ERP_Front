import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class VendorService {

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
  

    
  addVendor(storeData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/vendors`, storeData ,{ headers:this.getHeadersWithToken() });
  }
  getAllVendors(
        searchTerm: string = '',
          page: number = 1,
          perPage: number = 10

  ): Observable<any> {
     let params = new HttpParams();
              if (searchTerm !== '') params = params.set('searchTerm', searchTerm);
              if (page !== 1) params = params.set('page', page);
              if (perPage !== 10) params = params.set('per_page', perPage);
    return this._HttpClient.get(`${this.baseURL}/general/vendors` ,{ headers:this.getHeadersWithToken(),
      params:params
     });
  }
  deleteVendor(storeId: number): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/general/vendors/${storeId}`, { headers:this.getHeadersWithToken() });
  }
  showVendorById(id:any): Observable<any>{
    return this._HttpClient.get(this.baseURL+"/general/vendors/"+id, { headers:this.getHeadersWithToken()  });
  }
  updateVendor(store_id: string, storeData: FormData): Observable<any> {
    storeData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/general/vendors/${store_id}`, storeData, { headers:this.getHeadersWithToken()  });
  }
}
