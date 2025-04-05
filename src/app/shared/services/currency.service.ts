import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

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


  addCurrency(currencyData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/currencies`, currencyData ,{ headers: this.getHeadersWithToken()  });
  }
  viewAllCurrency(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/currencies`,{ headers: this.getHeadersWithToken()  });
  }
  getCurrencyById(id:any): Observable<any>{
    return this._HttpClient.get(this.baseURL+"/general/currencies/"+id, { headers: this.getHeadersWithToken()  });
  }
  updateCurrency(currencyId: string, currencyData: FormData): Observable<any> {
    currencyData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/general/currencies/${currencyId}`, currencyData, { headers: this.getHeadersWithToken()  });
  }
  deleteCurrency(currencyId: number): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/general/currencies/${currencyId}`, { headers: this.getHeadersWithToken()  });
  }

  setCurrencyAsDefault(currencyId: string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/currencies/set-as-default/${currencyId}`, { headers: this.getHeadersWithToken()  });
  }
  getDefultCurrency(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/currencies/get-default`, { headers: this.getHeadersWithToken()  });
  }
  
  
}
