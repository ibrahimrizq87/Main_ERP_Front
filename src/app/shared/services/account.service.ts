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
    return this._HttpClient.get(`${this.baseURL}/general/accounts`, { headers: this.getHeadersWithToken()  });
  }
  getAllMainAccounts(): Observable<any> {
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

  deleteAccount(accountId: number): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/admin/accounts/${accountId}`, { headers: this.getHeadersWithToken()  });
  }
  // getParentForDocument(parent: number[], parent_company: number[]): Observable<any> {
  //   return this._HttpClient.post(this.baseURL + "  ",
  //     { "parent": parent, 'parent_company': parent_company }, { headers });
  // }

  getAllChildren(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/accounts/all-children`, { headers: this.getHeadersWithToken()  });
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
    return this._HttpClient.get(`${this.baseURL}`, { headers: this.getHeadersWithToken()  });
  }
  getAccountById(id: string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/admin/accounts/${id}`, { headers: this.getHeadersWithToken() });
  }




  viewAllAccounts(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}`, { headers });
  }

 


  



  getChildrenByParentIds(parent: number[]): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.post(this.baseURL + "/accounting/cheldren/byIds",
      { "parent": parent }, { headers });
  }





  getAccountByParentAndBank(accountId: number , parentId:number): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    return this._HttpClient.get(`${this.baseURL}/account-banks/get-account-by-bank/${accountId}/${parentId}`, { headers });
    }



  
}
