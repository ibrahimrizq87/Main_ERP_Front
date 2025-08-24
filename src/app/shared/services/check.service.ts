import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class CheckService {

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

  addCheck(checkData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/checks`, checkData, { headers: this.getHeadersWithToken() });
  }

  getAllChecks(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/checks`, { headers: this.getHeadersWithToken() });
  }


  getCheckById(id: string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/checks/${id}`, { headers: this.getHeadersWithToken() });
  }



  getCheckByPayedToAccount(id: string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/checks/get-check-by-payed-to-account/${id}`, { headers: this.getHeadersWithToken() });
  }



  getCheckBystatus(status: string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/checks/by-status/${status}`, { headers: this.getHeadersWithToken() });
  }

  updateCheckStatus(status: string, id: string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/checks/update-status/${status}/${id}`, { headers: this.getHeadersWithToken() });
  }
  deleteCheck(id: number): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/general/checks/${id}`, { headers: this.getHeadersWithToken() });
  }


  getChecksForOperations(type: number,

    searchTerm: string = '',
    page: number = 1,
    perPage: number = 10

  ): Observable<any> {

    let params = new HttpParams();
    if (searchTerm !== '') params = params.set('searchTerm', searchTerm);
    if (page !== 1) params = params.set('page', page);
    if (perPage !== 10) params = params.set('per_page', perPage);




    return this._HttpClient.get(`${this.baseURL}/general/checks/get-for-operations/${type}`, {
      headers: this.getHeadersWithToken(),
      params: params
    });
  }

  AddOperationOnCheck(operationData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/checks/add-operation-on-check`, operationData, { headers: this.getHeadersWithToken() });
  }



}