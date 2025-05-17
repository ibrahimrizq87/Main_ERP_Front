import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VectionService {

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
  

    
  addVecation(storeData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/employee/vecations`, storeData ,{ headers:this.getHeadersWithToken() });
  }
  getAllVecations(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/employee/vecations` ,{ headers:this.getHeadersWithToken() });
  }
  deleteVecation(storeId: number): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/employee/vecations/${storeId}`, { headers:this.getHeadersWithToken() });
  }
  showVecationById(id:any): Observable<any>{
    return this._HttpClient.get(this.baseURL+"/employee/vecations/"+id, { headers:this.getHeadersWithToken()  });
  }
  updateVecation(store_id: string, storeData: FormData): Observable<any> {
    storeData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/employee/vecations/${store_id}`, storeData, { headers:this.getHeadersWithToken()  });
  }
}
