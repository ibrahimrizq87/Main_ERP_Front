import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ProductCategoriesService {
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
  
  

  
  addProductCategory(data:FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/product-categories`,data,{ headers:this.getHeadersWithToken() })
  }

  getAllProductCategories(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/product-categories`,{ headers:this.getHeadersWithToken() });
  }

  deleteProductCategory(product_id:number): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/general/product-categories/${product_id}`,{ headers:this.getHeadersWithToken() });
  }


  getAllProductCategoryById(product_id:string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/product-categories/${product_id}`,{ headers:this.getHeadersWithToken() });
  }
  updateProductCategory(product_id:string , productUnitData:FormData): Observable<any> {
    productUnitData.append('_method', 'PUT');

    return this._HttpClient.post(`${this.baseURL}/general/product-categories/${product_id}`,productUnitData,{ headers:this.getHeadersWithToken() });
  }


}
