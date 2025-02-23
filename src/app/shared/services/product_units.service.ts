import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ProductUnitsService {
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
  
  

  
  addProductUnit(data:FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/product-units`,data,{ headers:this.getHeadersWithToken() })
  }

  getAllProductUnits(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/product-units`,{ headers:this.getHeadersWithToken() });
  }

  deleteProductUnit(product_id:number): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/general/product-units/${product_id}`,{ headers:this.getHeadersWithToken() });
  }


  getAllProductUnitById(product_id:string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/product-units/${product_id}`,{ headers:this.getHeadersWithToken() });
  }
  updateProductUnit(product_id:string , productUnitData:FormData): Observable<any> {
    productUnitData.append('_method', 'PUT');

    return this._HttpClient.post(`${this.baseURL}/general/product-units/${product_id}`,productUnitData,{ headers:this.getHeadersWithToken() });
  }


}


