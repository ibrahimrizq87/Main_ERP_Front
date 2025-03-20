import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ColorService {

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



  addColor(colorData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/colors`, colorData ,{ headers: this.getHeadersWithToken() })
  }
  viewAllColors(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/colors`,{ headers: this.getHeadersWithToken() })
  }
  getColorById(id:any): Observable<any>{
    return this._HttpClient.get(this.baseURL+"/general/colors/"+id, { headers: this.getHeadersWithToken() })
  }
  updateColor(colorId: string, colorData: FormData): Observable<any> {
    colorData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/general/colors/${colorId}`, colorData, { headers: this.getHeadersWithToken() })
  }
  deleteColor(colorId: number): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/general/colors/${colorId}`, { headers: this.getHeadersWithToken() })
  }
}
