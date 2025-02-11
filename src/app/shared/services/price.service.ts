import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class PriceService {

 private baseURL = environment.apiUrl;
   constructor(private _HttpClient: HttpClient , private translate: TranslateService) { 
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



  addCategory(categoryData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/price-categories`, categoryData ,{ headers: this.getHeadersWithToken() })
  }
  viewAllCategory(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/price-categories`,{ headers: this.getHeadersWithToken() })
  }
  getCategoryById(id:any): Observable<any>{
    return this._HttpClient.get(this.baseURL+"/general/price-categories/"+id, { headers: this.getHeadersWithToken() })
  }
  updateCategory(categoryId: string, cityData: FormData): Observable<any> {
    cityData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/general/price-categories/${categoryId}`, cityData, { headers: this.getHeadersWithToken() })
  }
  deleteCategory(categoryId: number): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/general/price-categories/${categoryId}`, { headers: this.getHeadersWithToken() })
  }
}
