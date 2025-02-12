import { Injectable } from '@angular/core';
import { throwError, Observable, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  getData(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/general/accounts`, { headers: this.getHeadersWithToken()  });
  }
  getAllMainAccounts(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/general/accounts/get-all-main`, { headers: this.getHeadersWithToken()  });
  }


  getAllHasChildren(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/accounts/accounts-has-children/get-all`, { headers: this.getHeadersWithToken()  });
  }

  addAccount(accountData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/admin/accounts`, accountData, { headers: this.getHeadersWithToken() })
  }


  getAccountsByParent(id: string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/accounts/get-children/${id}`, { headers: this.getHeadersWithToken() })
  }
  showAccountById(id: any): Observable<any> {
    return this._HttpClient.get(this.baseURL + "/general/accounts/" + id, { headers: this.getHeadersWithToken()  });
  }
  showAccountByIdAllInfo(id: any): Observable<any> {
    return this._HttpClient.get(this.baseURL + "/general/accounts/get-all-info/" + id, { headers: this.getHeadersWithToken()  });
  }

  


  getAllAccounts(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}`, { headers: this.getHeadersWithToken()  });
  }
  getAccountById(id: string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/admin/accounts/${id}`, { headers: this.getHeadersWithToken() });
  }




  getAllChildren(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/accounts/all-children`, { headers });
  }


  viewAllAccounts(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}`, { headers });
  }

 


  getParentForDocument(parent: number[], parent_company: number[]): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.post(this.baseURL + "/accounting/barent/document",
      { "parent": parent, 'parent_company': parent_company }, { headers });
  }



  getChildrenByParentIds(parent: number[]): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.post(this.baseURL + "/accounting/cheldren/byIds",
      { "parent": parent }, { headers });
  }
  updateAccount(accountId: string, accountData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    accountData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/accounting/${accountId}`, accountData, { headers });
  }

  deleteAccount(accountId: number): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this._HttpClient.delete(`${this.baseURL}/accounting/${accountId}`, { headers });
  }


  getAccountByParentAndBank(accountId: number , parentId:number): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    return this._HttpClient.get(`${this.baseURL}/account-banks/get-account-by-bank/${accountId}/${parentId}`, { headers });
    }



  
}
