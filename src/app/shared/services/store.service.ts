import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

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
  

    
  addStore(storeData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/stores`, storeData ,{ headers:this.getHeadersWithToken() });
  }
  getAllStores(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/stores` ,{ headers:this.getHeadersWithToken() });
  }
 // src/app/shared/services/store.service.ts
getAllStoresByType(type?: string, page: number = 1, perPage: number = 10): Observable<any> {
  let url = `${this.baseURL}/general/stores?page=${page}&per_page=${perPage}`;
  if (type) {
    url += `&filter[type]=${type}`;
  }
  return this._HttpClient.get(url, { headers: this.getHeadersWithToken() });
}
  deleteStore(storeId: number): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/general/stores/${storeId}`, { headers:this.getHeadersWithToken() });
  }
  showStoreById(id:any): Observable<any>{
    return this._HttpClient.get(this.baseURL+"/general/stores/"+id, { headers:this.getHeadersWithToken()  });
  }
  updateStore(store_id: string, storeData: FormData): Observable<any> {
    storeData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/general/stores/${store_id}`, storeData, { headers:this.getHeadersWithToken()  });
  }

getProductBranchStoreByStoreId(storeId: string): Observable<any> {
  return this._HttpClient.get(`${this.baseURL}/general/product-branch-stores/get-by-store/${storeId}`, { headers:this.getHeadersWithToken() });
}
}