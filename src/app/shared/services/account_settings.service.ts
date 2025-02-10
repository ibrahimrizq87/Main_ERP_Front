import { Injectable } from '@angular/core';
import { throwError, Observable, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class AccountSettingService {

  private baseURL = environment.apiUrl+'/general';
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



  getMainAccountNav(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/main-account-nav-setting`, { headers: this.getHeadersWithToken()  });
  }



  addMainAccountNav(data:FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/main-account-nav-setting`, data,{ headers: this.getHeadersWithToken()  });
  }

  


  deleteMainNav(id:number): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/main-account-nav-setting/${id}`, { headers: this.getHeadersWithToken()  });
  }



  addChildAccountNav(data:FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/main-account-nav-setting-child`,data, { headers: this.getHeadersWithToken()  });
  }
  addChildAccountNavByParent(id:number): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/main-account-nav-setting-child/get-by-parent/${id}`, { headers: this.getHeadersWithToken()  });
  }

  deleteChildAccountNav(id:number): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/main-account-nav-setting-child/${id}`, { headers: this.getHeadersWithToken()  });
  }







 



  
  
}
