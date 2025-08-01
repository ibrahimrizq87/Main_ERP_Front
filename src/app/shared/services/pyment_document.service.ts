import { Injectable } from '@angular/core';
import { throwError, Observable, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
@Injectable({
  providedIn: 'root'
})
export class PaymentDocumentService {

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


  addDocument(documentData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/payment-documents`, documentData ,{ headers: this.getHeadersWithToken() });
  }
  getDocumentsByType(type:string , status:string,
      searchTerm: string = '',
      startDate: string = '',
      endDate: string = '',
      priceFrom: string = '',
      priceTo: string = '',
      day: string = '',
  ): Observable<any> {

 let params = new HttpParams();
              if (searchTerm !== '') params = params.set('searchTerm', searchTerm);
              if (priceFrom !== '') params = params.set('total_from', priceFrom);
              if (priceTo !== '') params = params.set('total_to', priceTo);
        
              if (startDate) params = params.set('startDate', startDate);
              if (endDate) params = params.set('endDate', endDate);
              if (day) params = params.set('day', day);

    return this._HttpClient.get(`${this.baseURL}/general/payment-documents/by-type/`+type+'/'+status,{ 
      headers: this.getHeadersWithToken(),
       params: params });
  }

  getDocumentById(id:string ): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/payment-documents/`+id,{ headers: this.getHeadersWithToken()
     });
  }

  updateDocumentById(id:string ,documentData: FormData): Observable<any> {
    documentData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/general/payment-documents/`+id, documentData,{ headers: this.getHeadersWithToken() });
  }
  approveDocument(id:string ): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/payment-documents/approve-document/`+id,{ headers: this.getHeadersWithToken() });
  }
  rejectDocument(id:string ): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/payment-documents/reject-document/`+id,{ headers: this.getHeadersWithToken() });
  }
  UpdateDocumentStatus(id:string,status:string ): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/payment-documents/update-status/${id}/${status}`,{ headers: this.getHeadersWithToken() });
  }
  deleteDocument(id:string ): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/general/payment-documents/${id}`,{ headers: this.getHeadersWithToken() });
  }
  
  // old //

  viewAllDocuments(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/payment_documents`,{ headers });
  }

  

}