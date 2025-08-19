import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

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
  

    
  addClient(storeData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/clients`, storeData ,{ headers:this.getHeadersWithToken() });
  }
  getAllClients(
    searchTerm: string = '',
          page: number = 1,
          perPage: number = 10

  ): Observable<any> {

         let params = new HttpParams();
    
          if (searchTerm !== '') params = params.set('searchTerm', searchTerm);
          if (page !== 1) params = params.set('page', page);
          if (perPage !== 10) params = params.set('per_page', perPage);


    return this._HttpClient.get(`${this.baseURL}/general/clients` ,{ headers:this.getHeadersWithToken(),
      params:params
    });
  }
  deleteClient(storeId: number): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/general/clients/${storeId}`, { headers:this.getHeadersWithToken() });
  }
  showClientById(id:any): Observable<any>{
    return this._HttpClient.get(this.baseURL+"/general/clients/"+id, { headers:this.getHeadersWithToken()  });
  }
  updateClient(store_id: string, storeData: FormData): Observable<any> {
    storeData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/general/clients/${store_id}`, storeData, { headers:this.getHeadersWithToken()  });
  }


  getClientsForSales(
    searchTerm: string = '',
          page: number = 1,
          perPage: number = 10
      ): Observable<any> {
          let params = new HttpParams();
    
          if (searchTerm !== '') params = params.set('searchTerm', searchTerm);
          if (page !== 1) params = params.set('page', page);
          if (perPage !== 10) params = params.set('per_page', perPage);
    return this._HttpClient.get(`${this.baseURL}/general/clients/get-clients-add-sales` ,{ 
      headers:this.getHeadersWithToken(),
    params:params });
  }


  importClients( data: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/clients/import-excel`, data, { headers: this.getHeadersWithToken() });
  }


  exportClientsTemplate(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/clients/export-template`, { 
      headers: this.getHeadersWithToken(),
      responseType: 'blob' 
  });
  }



 
}
