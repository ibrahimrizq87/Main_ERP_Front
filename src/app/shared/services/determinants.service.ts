import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class DeterminantService {

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
  

    
  addDeterminant(determinantData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/determinants`, determinantData ,{ headers:this.getHeadersWithToken() });
  }

    
  getDeterminantsByProduct(productId: string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/determinants/get-by-product-id/${productId}` ,{ headers:this.getHeadersWithToken() });
  }


 
  getAllDeterminants(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/determinants` ,{ headers:this.getHeadersWithToken() });
  }
  deleteDeterminant(determinantId: number): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/general/determinants/${determinantId}`, { headers:this.getHeadersWithToken() });
  }
  showDeterminantById(id:any): Observable<any>{
    return this._HttpClient.get(this.baseURL+"/general/determinants/"+id, { headers:this.getHeadersWithToken()  });
  }
  updateDeterminant(determinantId: string, determinantData: FormData): Observable<any> {
    determinantData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/general/determinants/${determinantId}`, determinantData, { headers:this.getHeadersWithToken()  });
  }
}
