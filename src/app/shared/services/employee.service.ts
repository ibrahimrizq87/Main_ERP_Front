import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

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
  

    
  addEmployee(storeData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/employees`, storeData ,{ headers:this.getHeadersWithToken() });
  }
  getAllEmployees(
       searchTerm: string = '',
          page: number = 1,
          perPage: number = 10

  ): Observable<any> {
    let params = new HttpParams();
          if (searchTerm !== '') params = params.set('searchTerm', searchTerm);
          if (page !== 1) params = params.set('page', page);
          if (perPage !== 10) params = params.set('per_page', perPage);

    return this._HttpClient.get(`${this.baseURL}/general/employees` ,{ headers:this.getHeadersWithToken(),
      params:params
     });
  }
  deleteEmployee(storeId: number): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/general/employees/${storeId}`, { headers:this.getHeadersWithToken() });
  }
  showEmployeeById(id:any): Observable<any>{
    return this._HttpClient.get(this.baseURL+"/general/employees/"+id, { headers:this.getHeadersWithToken()  });
  }
  updateEmployee(store_id: string, storeData: FormData): Observable<any> {
    storeData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/general/employees/${store_id}`, storeData, { headers:this.getHeadersWithToken()  });
  }



  

  getEmployeesForPopup(

      searchTerm: string = '',
      page: number = 1,
      perPage: number = 20

  ): Observable<any> {
 let params = new HttpParams();
              if (searchTerm !== '') params = params.set('searchTerm', searchTerm);
              if (page !== 1) params = params.set('page', page);
              if (perPage !== 20) params = params.set('per_page', perPage);



    return this._HttpClient.get(`${this.baseURL}/general/employees/get-for-popup`, { 
      headers: this.getHeadersWithToken(),
      params: params})
  }

}
