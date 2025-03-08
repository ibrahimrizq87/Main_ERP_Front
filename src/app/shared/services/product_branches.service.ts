import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ProductBranchesService {
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
   



  addProductBranch(productData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/product-branches`, productData ,{ headers:this.getHeadersWithToken() }) ;
  }
  viewAllProductBranches(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/product-branches`,{ headers:this.getHeadersWithToken()  });
  }


  viewProductBranchById(id:any): Observable<any>{
    return this._HttpClient.get(this.baseURL+"/general/product-branches/"+id, { headers:this.getHeadersWithToken() });
  }

  getProductBranchesByProductId(id:any): Observable<any>{
    return this._HttpClient.get(this.baseURL+"/general/product-branches/by-product-id/"+id, { headers:this.getHeadersWithToken() });
  }
  

  updateProductBranch(productId: string, productData: FormData): Observable<any> {
    productData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/general/product-branches/${productId}`, productData, { headers:this.getHeadersWithToken() });
  }

    
  deleteProductBranch(productId: number): Observable<any> {
  
    return this._HttpClient.delete(`${this.baseURL}/general/product-branches/${productId}`, { headers:this.getHeadersWithToken() });
  }


  getProductBranchByStoreId(storeId:any): Observable<any>{
    return this._HttpClient.get(this.baseURL+"/general/product-branches/by-store/"+storeId, { headers:this.getHeadersWithToken() });
  }

  




}
