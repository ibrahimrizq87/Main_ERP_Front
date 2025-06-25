import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrdersService {

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




  addPurchaseOrder(purchasesData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/purchases-orders`, purchasesData ,{headers: this.getHeadersWithToken()  })
  }



  getAllPurchaseOrder(
          vendorName: string = '',
      startDate: string = '',
      endDate: string = '',
      priceFrom: string = '',
      priceTo: string = '',
      day: string = '',
  ): Observable<any> {

          let params = new HttpParams();
              if (vendorName !== '') params = params.set('vendor_name', vendorName);
              if (priceFrom !== '') params = params.set('total_from', priceFrom);
              if (priceTo !== '') params = params.set('total_to', priceTo);
        
              if (startDate) params = params.set('startDate', startDate);
              if (endDate) params = params.set('endDate', endDate);
              if (day) params = params.set('day', day);


    return this._HttpClient.get(`${this.baseURL}/general/purchases-orders` ,{
      headers: this.getHeadersWithToken(),
      params:params
      })
  }







  getPurchaseOrderById(id:any): Observable<any>{
    return this._HttpClient.get(this.baseURL+"/general/purchases-order/"+id, { headers: this.getHeadersWithToken() })
    
  }


  updatePurchase(purchaseId: string, PurchaseData: FormData): Observable<any> {
    PurchaseData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/general/purchases-bills/${purchaseId}`, PurchaseData, {  headers: this.getHeadersWithToken() })
  }

  deletePurchase(branchId: number): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/general/purchases-bills/${branchId}`, { headers: this.getHeadersWithToken() })
  }

  approveBill(billId: string): Observable<any> {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    return this._HttpClient.post(
      `${this.baseURL}/purchases-bills/status/${billId}`, formData, { headers: this.getHeaders() }
    );
  }



  viewAllPurchases(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/purchases-bills`,{ headers });
  }




   exportAllDataToSheet(): Observable<Blob> {
    return this._HttpClient.get(`${this.baseURL}/general/purchases-bills/export-all-data-to-sheet`, {
      headers: this.getHeadersWithToken(),
      responseType: 'blob' 
    });
  }
  exportItemsDataToSheet(): Observable<Blob> {
    return this._HttpClient.get(`${this.baseURL}/general/purchases-bills/export-items-data-to-sheet`, {
      headers: this.getHeadersWithToken(),
      responseType: 'blob' 
    });
  }

  importProducts(data:FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/purchases-bills/import-excell-all-data`,data ,{headers: this.getHeadersWithToken() });
  }








  addReturnPurchase(purchasesData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/return-purchase-bills`, purchasesData ,{headers: this.getHeadersWithToken()  })
  }


  getReturnPurchaseBillsByStatus(status:string,
     vendorName: string = '',
      paymentType: string = 'all',
      startDate: string = '',
      endDate: string = '',
      priceFrom: string = '',
      priceTo: string = '',
      day: string = '',
  ): Observable<any>{
              let params = new HttpParams();
              if (vendorName !== '') params = params.set('vendor_name', vendorName);
              if (paymentType !== 'all') params = params.set('payment_type', paymentType);
              if (priceFrom !== '') params = params.set('total_form', priceFrom);
              if (priceTo !== '') params = params.set('total_to', priceTo);
        
              if (startDate) params = params.set('startDate', startDate);
              if (endDate) params = params.set('endDate', endDate);
              if (day) params = params.set('day', day);



    return this._HttpClient.get(`${this.baseURL}/general/return-purchase-bills/get-bill-by-status/${status}`, { 
      headers: this.getHeadersWithToken(),
      params:params
     })
  }


  UpdateReturnPurchaseBillStatus(id:string , status: string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/return-purchase-bills/update-status/${id}/${status}` ,{headers: this.getHeadersWithToken()  })
  }


  getReturnPurchaseById(id:any): Observable<any>{
    return this._HttpClient.get(this.baseURL+"/general/return-purchase-bills/"+id, { headers: this.getHeadersWithToken() })
    
  }



}
