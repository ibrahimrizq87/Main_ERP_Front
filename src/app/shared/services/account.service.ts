import { Injectable } from '@angular/core';
import { throwError, Observable, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

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



  getData(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/accounts`, { headers: this.getHeadersWithToken() });
  }
  getAllMainAccounts(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/accounts/get-all-main`, { headers: this.getHeadersWithToken() });
  }

  getAllHasChildren(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/accounts/accounts-has-children/get-all`, { headers: this.getHeadersWithToken() });
  }

  addAccount(accountData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/admin/accounts`, accountData, { headers: this.getHeadersWithToken() })
  }

  getAccountsByParent(id: string,

      searchTerm: string = '',
      page: number = 1,
      perPage: number = 20

  ): Observable<any> {
 let params = new HttpParams();
              if (searchTerm !== '') params = params.set('searchTerm', searchTerm);
              if (page !== 1) params = params.set('page', page);
              if (perPage !== 20) params = params.set('per_page', perPage);



    return this._HttpClient.get(`${this.baseURL}/general/accounts/get-children/${id}`, { 
      headers: this.getHeadersWithToken(),
      params: params})
  }



  getAccountsByParentIndex(id: string,

      searchTerm: string = '',
      page: number = 1,
      perPage: number = 20

  ): Observable<any> {
 let params = new HttpParams();
              if (searchTerm !== '') params = params.set('searchTerm', searchTerm);
              if (page !== 1) params = params.set('page', page);
              if (perPage !== 20) params = params.set('per_page', perPage);



    return this._HttpClient.get(`${this.baseURL}/general/accounts/get-children-index/${id}`, { 
      headers: this.getHeadersWithToken(),
      params: params})
  }


  showAccountById(id: any): Observable<any> {
    return this._HttpClient.get(this.baseURL + "/general/accounts/" + id, { headers: this.getHeadersWithToken() });
  }

  showAccountByIdAllInfo(id: any): Observable<any> {
    return this._HttpClient.get(this.baseURL + "/general/accounts/get-all-info/" + id, { headers: this.getHeadersWithToken() });
  }

  deleteAccount(accountId: number): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/admin/accounts/${accountId}`, { headers: this.getHeadersWithToken() });
  }
  // getParentForDocument(parent: number[], parent_company: number[]): Observable<any> {
  //   return this._HttpClient.post(this.baseURL + "  ",
  //     { "parent": parent, 'parent_company': parent_company }, { headers });
  // }

  getAllChildren(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/accounts/all-children`, { headers: this.getHeadersWithToken() });
  }

  getParentForDocument(parent: number[], parent_company: number[]): Observable<any> {
    return this._HttpClient.post(this.baseURL + "/general/accounts/get-accounts-for-document",
      { "parent": parent, 'parent_company': parent_company }, { headers: this.getHeadersWithToken() });
  }




  updateAccount(accountId: string, accountData: FormData): Observable<any> {
    accountData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/general/accounts/${accountId}`, accountData, { headers: this.getHeadersWithToken() });
  }

  getAllAccounts(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}`, { headers: this.getHeadersWithToken() });
  }
  getAccountById(id: string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/admin/accounts/${id}`, { headers: this.getHeadersWithToken() });
  }




  getBankAccountAccounts(bankAccountId: string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/accounts/get-bank-account-accounts/${bankAccountId}`, { headers: this.getHeadersWithToken() });
  }


  addBankAccountAccount(data: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/accounts/store-bank-account-account`, data, { headers: this.getHeadersWithToken() });
  }





  getChildrenByParentIds(parent: number[]): Observable<any> {
    return this._HttpClient.post(this.baseURL + "/general/accounts/get-accounts-by-parent-list", { "parent": parent }, { headers: this.getHeadersWithToken() });
  }





  getAccountByParentAndBank(accountId: number, parentId: number): Observable<any> {

    return this._HttpClient.get(`${this.baseURL}/general/accounts/get-account-by-bank-account/${accountId}/${parentId}`, { headers: this.getHeadersWithToken() });
  }


  getCurrencyTracking(): Observable<any> {

    return this._HttpClient.get(`${this.baseURL}/general/accounts/get-currency-tracking-data`, { headers: this.getHeadersWithToken() });
  }

  exportAccountsData(): Observable<Blob> {
    return this._HttpClient.get(`${this.baseURL}/general/accounts/export-accounts-data`, {
      headers: this.getHeadersWithToken(),
      responseType: 'blob'
    });
  }
  importAccountsData(data: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/accounts/import-accounts-data`, data, { headers: this.getHeadersWithToken() });
  }


}
