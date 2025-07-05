import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CashierService {


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



  addBillCasier(storeData: any): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/cashier-invoices`, storeData, {
      headers: this.getHeadersWithToken()
    });
  }

  getBillCashierById(id: string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/cashier-invoices/${id}`, {
      headers: this.getHeadersWithToken()
    });
  }
  
  getMyInvoices(date: string, page: number = 1, perPage: number = 10): Observable<any> {

             let params = new HttpParams();
                      if (date !== '') params = params.set('date', date);
                      if (page !== 1) params = params.set('page', page);
                      if (perPage !== 10) params = params.set('per_page', perPage);
    
    return this._HttpClient.get(`${this.baseURL}/general/cashier-invoices/get-my-invoices`, {
          headers: this.getHeadersWithToken(),
          params
        });
  }
  getBillCashier(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/cashier-invoices`, { headers: this.getHeadersWithToken() });
  }

  addCashier(cashierData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/manage-cashiers`, cashierData, { headers: this.getHeadersWithToken() });
  }


  getAllCashier(): Observable<any> {

    return this._HttpClient.get(`${this.baseURL}/general/manage-cashiers`, { headers: this.getHeadersWithToken() });
  }

  deleteCashier(cashierId: string): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/general/manage-cashiers/${cashierId}`, { headers: this.getHeadersWithToken() });
  }

  showCashierById(id: any): Observable<any> {
    return this._HttpClient.get(this.baseURL + "/general/manage-cashiers/" + id, { headers: this.getHeadersWithToken() });
  }

  
  getMyStoreProducts(searchTerm?: string): Observable<any> {
    const params: any = {};
    if (searchTerm && searchTerm.trim()) {
      params.searchTerm = searchTerm;
    }
    return this._HttpClient.get(`${this.baseURL}/general/cashier/search-store-products`, {
      headers: this.getHeadersWithToken(),
      params: params
    });
  }

 
  
  addCashierToMyself(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/cashier/add-cashier-to-myself`, {
      headers: this.getHeadersWithToken(),
    });
  }

  addRecentProducts(productData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/cashier/add-recent-products`, productData, { headers: this.getHeadersWithToken() });
  }
  deleteRecentProducts(productId: string): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/general/cashier/delete-recent-products/${productId}`, { headers: this.getHeadersWithToken() });
  }

  getAllRecent(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/cashier/get-recent-products`, { headers: this.getHeadersWithToken() });
  }

  updateMyDefaultStore(storeId: string): Observable<any> {
    return this._HttpClient.put(`${this.baseURL}/general/cashier/update-default-store/${storeId}`, {}, { headers: this.getHeadersWithToken() });
  }

  getMyInfo(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/cashier/get-my-info`, { headers: this.getHeadersWithToken() });
  }

  getProductSerialNumbersForReturnSales(productId: string, storeId: string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/products/get-serial-numbers-for-return-sales/${productId}/${storeId}`, { headers: this.getHeadersWithToken() });
  }

}









