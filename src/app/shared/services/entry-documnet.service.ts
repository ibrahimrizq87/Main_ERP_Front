import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class EntryDocumentService {

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

    //   const startDate = this.filters.startDate || '';
    // const endDate = this.filters.endDate || '';
    // const priceFrom = this.filters.priceFrom || '';
    // const priceTo = this.filters.priceTo || '';
    // const day = this.filters.day || '';

  viewAllDocumentEntry(status:string,
      startDate: string = '',
      endDate: string = '',
      priceFrom: string = '',
      priceTo: string = '',
      day: string = '',

  ): Observable<any> {

    let params = new HttpParams();
      if (priceFrom !== '') params = params.set('total_from', priceFrom);
      if (priceTo !== '') params = params.set('total_to', priceTo);
        
      if (startDate) params = params.set('startDate', startDate);
      if (endDate) params = params.set('endDate', endDate);
      if (day) params = params.set('day', day);

    return this._HttpClient.get(`${this.baseURL}/general/entry-documents/all-by-status/${status}`,{ 
      headers: this.getHeadersWithToken(),
     params:params})
  }
  
  addEntryDocument(entryData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/entry-documents`, entryData,{ headers: this.getHeadersWithToken() })
  }

  getEntryDocumentById(id: string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/entry-documents/${id}`,{ headers: this.getHeadersWithToken() })
  }

  updateEntryDocument(entryData: FormData,id: string): Observable<any> {
    entryData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/general/entry-documents/${id}`, entryData,{ headers: this.getHeadersWithToken() })
  }
  UpdateEntryDocumentStatus(id:string,status:string ): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/entry-documents/update-status/${id}/${status}`,{ headers: this.getHeadersWithToken() });
  }
  deleteEntryDocument(id: number): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/general/entry-documents/${id}`,{ headers: this.getHeadersWithToken() })
  }
  
  


  getEntryDocumentByType(type: string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/entry-documents/get-by-type/${type}`,{ headers: this.getHeadersWithToken() })
  }

}