import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StocktakingService {

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
getDifference(differenceData: FormData): Observable<any> {
 return this._HttpClient.post(`${this.baseURL}/general/store-stocktakings/get-difference`, differenceData ,{ headers:this.getHeadersWithToken() }) ;
}
save(saveData: FormData): Observable<any> {
  return this._HttpClient.post(`${this.baseURL}/general/store-stocktakings/save`, saveData ,{ headers:this.getHeadersWithToken() }) ;
 }
viewAllStocktakings(): Observable<any> {
 return this._HttpClient.get(`${this.baseURL}/general/store-stocktakings/get-all`,{ headers:this.getHeadersWithToken()  });
}
viewStocktakingsById(id:any): Observable<any>{
 return this._HttpClient.get(this.baseURL+"/general/store-stocktakings/get-by-id/"+id, { headers:this.getHeadersWithToken() });
}

deleteStocktakings(stocktakingsId: number): Observable<any> {
 return this._HttpClient.delete(`${this.baseURL}/general/general/store-stocktakings/delete/${stocktakingsId}`, { headers:this.getHeadersWithToken() });
}

getBranchesByStore(storeId: string): Observable<any> {
 return this._HttpClient.get(`${this.baseURL}/general/store-stocktakings/get-branches-by-store/${storeId}`, { headers:this.getHeadersWithToken() });
}
}
