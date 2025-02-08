import { Injectable } from '@angular/core';
import { throwError, Observable, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private baseURL = environment.apiUrl;
  constructor(private _HttpClient: HttpClient) {
  }
  private handleError(error: any) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {

      errorMessage = `Error: ${error.error.message}`;
    } else {

      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
  getData(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/getData`, { headers }).pipe(
      catchError(this.handleError));
  }
  getAccountById(id: string): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/accounting/${id}`, { headers }).pipe(
      catchError(this.handleError));
  }

  addAccount(accountData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    console.log(accountData);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.post(`${this.baseURL}/accounting`, accountData, { headers })
  }


  getAllChildren(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/accounts/all-children`, { headers });
  }


  viewAllAccounts(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/accounting`, { headers }).pipe(
      catchError(this.handleError));
  }

  getAccountsByParent(id: string): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/accounting/children-accounts/${id}`, { headers })
  }

  showAccountById(id: any): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(this.baseURL + "/accounting/" + id, { headers }).pipe(
      catchError(this.handleError)
    );
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
    return this._HttpClient.post(`${this.baseURL}/accounting/${accountId}`, accountData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  deleteAccount(accountId: number): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this._HttpClient.delete(`${this.baseURL}/accounting/${accountId}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }


  getAccountByParentAndBank(accountId: number , parentId:number): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    return this._HttpClient.get(`${this.baseURL}/account-banks/get-account-by-bank/${accountId}/${parentId}`, { headers });
    }



  
}
