import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PriceService {

  private baseURL = environment.apiUrl;
  constructor(private _HttpClient: HttpClient) { 
  }

  addCategory(categoryData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.post(`${this.baseURL}/price-categories`, categoryData ,{ headers })
  }
  viewAllCategory(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/price-categories`,{ headers })
  }
  getCategoryById(id:any): Observable<any>{
    const token = localStorage.getItem('Token');

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this._HttpClient.get(this.baseURL+"/price-categories/"+id, { headers })
   
  }
  updateCategory(categoryId: string, cityData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    cityData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/price-categories/${categoryId}`, cityData, { headers })
  }
  deleteCategory(categoryId: number): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    return this._HttpClient.delete(`${this.baseURL}/price-categories/${categoryId}`, { headers })
  }
}
