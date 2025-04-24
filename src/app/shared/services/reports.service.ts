import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {


  
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
   



  
     getSaleReports(
      clientId: string = 'all',
      delegateId: string = 'all',
      paymentType: string = 'all',
      startDate: string = '',
      endDate: string = '',
      priceFrom: string = '',
      priceTo: string = '',
      day: string = '',
      month: string = '',
      year: string = ''
    ): Observable<any> {
      let params = new HttpParams();
    
      if (clientId !== 'all') params = params.set('client_id', clientId);
      if (delegateId !== 'all') params = params.set('delegate_id', delegateId);
      if (paymentType !== 'all') params = params.set('payment_type', paymentType);
      if (startDate) params = params.set('startDate', startDate);
      if (endDate) params = params.set('endDate', endDate);
      if (day) params = params.set('day', day);
      if (month) params = params.set('month', month);
      if (year) params = params.set('year', year);
      if (priceFrom) params = params.set('price_from', priceFrom);
      if (priceTo) params = params.set('price_to', priceTo);
    
      return this._HttpClient.get(`${this.baseURL}/reports/sales/get-total-sales`, {
        headers: this.getHeadersWithToken(),
        params: params
      });
    }


      
    getPurchaseReports(
      vendorId: string = 'all',
      paymentType: string = 'all',
      startDate: string = '',
      endDate: string = '',
      priceFrom: string = '',
      priceTo: string = '',
      day: string = '',
      month: string = '',
      year: string = ''
    ): Observable<any> {
      let params = new HttpParams();
    
      if (vendorId !== 'all') params = params.set('vendor_id', vendorId);
      if (paymentType !== 'all') params = params.set('payment_type', paymentType);
      if (startDate) params = params.set('startDate', startDate);
      if (endDate) params = params.set('endDate', endDate);
      if (day) params = params.set('day', day);
      if (month) params = params.set('month', month);
      if (year) params = params.set('year', year);
      if (priceFrom) params = params.set('price_from', priceFrom);
      if (priceTo) params = params.set('price_to', priceTo);
    
      return this._HttpClient.get(`${this.baseURL}/reports/purchases/get-total-purchases`, {
        headers: this.getHeadersWithToken(),
        params: params
      });
    }
    
  

    getProductMovesReports(
      moveType: string = 'all',
      eventType: string = 'all',
      storeId: string = 'all',
      branchId: string = 'all',

      startDate: string = '',
      endDate: string = '',

      day: string = '',
      month: string = '',
      year: string = ''
    ): Observable<any> {
      let params = new HttpParams();
    
      if (moveType !== 'all') params = params.set('move_type', moveType);
      if (eventType !== 'all') params = params.set('event_type', eventType);
      if (storeId !== 'all') params = params.set('store_id', storeId);
      if (branchId !== 'all') params = params.set('branch_id', branchId);

      if (startDate) params = params.set('startDate', startDate);
      if (endDate) params = params.set('endDate', endDate);
      if (day) params = params.set('day', day);
      if (month) params = params.set('month', month);
      if (year) params = params.set('year', year);

    
      return this._HttpClient.get(`${this.baseURL}/reports/product-moves/get-product-moves`, {
        headers: this.getHeadersWithToken(),
        params: params
      });
    }





    // $startDate = $request->input('startDate');
    // $endDate = $request->input('endDate');
    // $day = $request->input('day');
    // $month = $request->input('month');
    // $year = $request->input('year');
    // $accountId = $request->input('account_id');
    // $moveType = $request->input('move_type');
    // $eventType = $request->input('event_type');
    // $amountFrom = $request->input('amount_from');
    // $amountTo = $request->input('amount_to');
    // $query = AccountMove::with(['account']);



    getAccountMovesReports(
      moveType: string = 'all',
      eventType: string = 'all',
      storeId: string = 'all',
      branchId: string = 'all',

      startDate: string = '',
      endDate: string = '',

      day: string = '',
      month: string = '',
      year: string = ''
    ): Observable<any> {
      let params = new HttpParams();
    
      if (moveType !== 'all') params = params.set('move_type', moveType);
      if (eventType !== 'all') params = params.set('event_type', eventType);
      if (storeId !== 'all') params = params.set('store_id', storeId);
      if (branchId !== 'all') params = params.set('branch_id', branchId);

      if (startDate) params = params.set('startDate', startDate);
      if (endDate) params = params.set('endDate', endDate);
      if (day) params = params.set('day', day);
      if (month) params = params.set('month', month);
      if (year) params = params.set('year', year);
      return this._HttpClient.get(`${this.baseURL}/reports/product-moves/get-product-moves`, {
        headers: this.getHeadersWithToken(),
        params: params
      });
    }
    
}