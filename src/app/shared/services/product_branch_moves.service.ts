import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ProductBranchMovesService {
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
   



  addProductBranchMove(productData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/product-branch-moves`, productData ,{ headers:this.getHeadersWithToken() }) ;
  }
  viewAllProductBranchMoves(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/product-branch-moves`,{ headers:this.getHeadersWithToken()  });
  }


  viewProductBranchMoveById(id:any): Observable<any>{
    return this._HttpClient.get(this.baseURL+"/general/product-branch-moves/"+id, { headers:this.getHeadersWithToken() });
  }




  updateProductBranchMove(productId: string, productData: FormData): Observable<any> {
    productData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/general/product-branch-moves/${productId}`, productData, { headers:this.getHeadersWithToken() });
  }

    
  deleteProductBranchMove(productId: number): Observable<any> {
  
    return this._HttpClient.delete(`${this.baseURL}/general/product-branch-moves/${productId}`, { headers:this.getHeadersWithToken() });
  }



  




}
