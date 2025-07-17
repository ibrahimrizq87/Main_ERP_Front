import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ProductBranchStoresService {
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
   




  
  getByStoreId(id:string,
      searchQuery: string = '',
      page: number = 1,
      perPage: number = 10
  ): Observable<any> {


              let params = new HttpParams();
                      // if (type !== 'all') params = params.set('filter[type]', type);
                      if (searchQuery !== '') params = params.set('searchTerm', searchQuery);
                      if (page !== 1) params = params.set('page', page);
                      if (perPage !== 10) params = params.set('per_page', perPage);
    
    return this._HttpClient.get(`${this.baseURL}/general/product-branch-stores/get-by-store/${id}`,{ 
      headers: this.getHeadersWithToken(),
    params:params })
  }



    getByStoreIdWithoutPrices(id:string,
      searchQuery: string = '',
      page: number = 1,
      perPage: number = 10
  ): Observable<any> {


              let params = new HttpParams();
                      // if (type !== 'all') params = params.set('filter[type]', type);
                      if (searchQuery !== '') params = params.set('searchTerm', searchQuery);
                      if (page !== 1) params = params.set('page', page);
                      if (perPage !== 10) params = params.set('per_page', perPage);
    
    return this._HttpClient.get(`${this.baseURL}/general/product-branch-stores/get-by-store-without-prices/${id}`,{ 
      headers: this.getHeadersWithToken(),
    params:params })
  }
}