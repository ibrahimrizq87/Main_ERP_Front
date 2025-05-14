import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompanyBranchService {
  private baseURL = environment.apiUrl;
  constructor(private _HttpClient: HttpClient) { 
  }

  addCompanyBranch(comapnyBranchData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.post(`${this.baseURL}/company/company-branches`, comapnyBranchData ,{ headers })
  }
  viewallCompanyBranch(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/company/company-branches`,{ headers })
  }
  getCompanyBranchById(id:any): Observable<any>{
    const token = localStorage.getItem('Token');

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this._HttpClient.get(this.baseURL+"/company/company-branches/"+id, { headers })
    
  }
  
 

  updateCompanyBranch(groupId: string, comapnyBranchData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    comapnyBranchData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/company/company-branches/${groupId}`, comapnyBranchData, { headers })
  }
  deleteCompanyBranch(groupId: number): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    return this._HttpClient.delete(`${this.baseURL}/company/company-branches/${groupId}`, { headers })
  }
 
}
