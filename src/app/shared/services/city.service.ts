import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, catchError, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class CityService {
 
  
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
  
 
  addCity(cityData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/cities`, cityData ,{ headers:this.getHeadersWithToken() });
  }


  viewAllCities(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/cities`,{ headers:this.getHeadersWithToken() });
  }
  getCityById(id:any): Observable<any>{
    return this._HttpClient.get(this.baseURL+"/general/cities/"+id, {  headers:this.getHeadersWithToken() });
  }
  updateCity(cityId: string, cityData: FormData): Observable<any> {
    cityData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/general/cities/${cityId}`, cityData, { headers:this.getHeadersWithToken()  });
  }

  deleteCity(cityId: number): Observable<any> {
  
    return this._HttpClient.delete(`${this.baseURL}/general/cities/${cityId}`, { headers:this.getHeadersWithToken() });
  }


  viewAllcitiesByCountry(countryId: string): Observable<any> {
  
    return this._HttpClient.get(`${this.baseURL}/general/cities-by-country/${countryId}`, { headers:this.getHeadersWithToken() });
  }
  
}
