import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, catchError, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
 
  
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
  
 
  addCountry(cityData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/countries`, cityData ,{ headers:this.getHeadersWithToken() });
  }


  viewAllcountries(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/countries`,{ headers:this.getHeadersWithToken() });
  }
  deleteCountry(cityId: number): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/general/countries/${cityId}`, { headers:this.getHeadersWithToken()  });
  }

  getCountryById(id:any): Observable<any>{
    return this._HttpClient.get(this.baseURL+"/general/countries/"+id, { headers:this.getHeadersWithToken() });
  }
  updateCountry(cityId: string, cityData: FormData): Observable<any> {
    cityData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/general/countries/${cityId}`, cityData, { headers:this.getHeadersWithToken()  });
  }


}
