import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductInternalMovesService {
  private baseURL = environment.apiUrl;
  constructor(private _HttpClient: HttpClient, private translate: TranslateService) {
  }
  private getHeaders(): HttpHeaders {
    const currentLang = this.translate.currentLang || (localStorage.getItem('lang') || 'ar');
    console.log('lang ', currentLang);

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

  addProductInternalMoves(productMovesData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/product-internal-moves`, productMovesData, { headers: this.getHeadersWithToken() })
  }
  updateProductMovesByStatus(id: string, status: string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/product-internal-moves/update-status/${id}/${status}`, { headers: this.getHeadersWithToken() })
  }
  getProductMovesByStatus(status: string,
         fromStore: string = '',
          toStore: string = '',
          startDate: string = '',
          endDate: string = '',
          day: string = '',
      ): Observable<any>{
                  let params = new HttpParams();
                  if (fromStore !== '') params = params.set('fromStore', fromStore);
                  if (toStore !== '') params = params.set('toStore', toStore);
                  if (startDate !== '') params = params.set('startDate', startDate);
                  if (endDate !== '') params = params.set('endDate', endDate);
                  if (day !== '') params = params.set('day', day);
    
    
 
    return this._HttpClient.get(`${this.baseURL}/general/product-internal-moves/get-by-status/${status}`, { 
      headers: this.getHeadersWithToken(),
      params: params})
  }
  getProductMovesById(id: string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/product-internal-moves/${id}`, { headers: this.getHeadersWithToken() })
  }
  updateProductMovesById(productMoveId: string, productMoveData: FormData): Observable<any> {
    productMoveData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/general/product-internal-moves/${productMoveId}`, productMoveData, { headers: this.getHeadersWithToken() })
  }
  deleteProductMoves(productMoveId: number): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/general/product-internal-moves/${productMoveId}`, { headers: this.getHeadersWithToken() })
  }
  viewAllProductMoves(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/general/product-internal-moves`, { headers });
  }
}
