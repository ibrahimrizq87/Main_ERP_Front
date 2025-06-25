import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CashierService {

 
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


  
  addBillCasier(storeData: any): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/cashier-invoices`, storeData, { 
      headers: this.getHeadersWithToken() 
    });
  }
getBillCashier(): Observable<any> {
  return this._HttpClient.get(`${this.baseURL}/general/cashier-invoices` ,{ headers:this.getHeadersWithToken() });
}
   
addCashier(cashierData: FormData): Observable<any> {
  return this._HttpClient.post(`${this.baseURL}/general/manage-cashiers`, cashierData ,{ headers:this.getHeadersWithToken() });
}


  getAllCashier(): Observable<any> {

  return this._HttpClient.get(`${this.baseURL}/general/manage-cashiers`, { headers: this.getHeadersWithToken() });
}

deleteCashier(cashierId: string): Observable<any> {
  return this._HttpClient.delete(`${this.baseURL}/general/manage-cashiers/${cashierId}`, { headers:this.getHeadersWithToken() });
}

  showCashierById(id:any): Observable<any>{
  return this._HttpClient.get(this.baseURL+"/general/manage-cashiers/"+id, { headers:this.getHeadersWithToken()  });
}
// Route::get('/search-store-products',  'getMyStoreProducts');  
// src/app/shared/services/cashier.service.ts
getMyStoreProducts(searchTerm?: string): Observable<any> {
  const params: any = {};
  if (searchTerm && searchTerm.trim()) {
    params.searchTerm = searchTerm;
  }
  return this._HttpClient.get(`${this.baseURL}/general/cashier/search-store-products`, {
    headers: this.getHeadersWithToken(),
    params: params
  });
}

// add-cashier-to-myself
// Route::get('/add-cashier-to-myself',  'addCashierToMyself'); 
addCashierToMyself(): Observable<any> {
  return this._HttpClient.get(`${this.baseURL}/general/cashier/add-cashier-to-myself`, {
    headers: this.getHeadersWithToken(),
  });
}

addRecentProducts(productData: FormData): Observable<any> {
  return this._HttpClient.post(`${this.baseURL}/general/cashier/add-recent-products`, productData, { headers: this.getHeadersWithToken() });
}
deleteRecentProducts(productId: string): Observable<any> {
  return this._HttpClient.delete(`${this.baseURL}/general/cashier/delete-recent-products/${productId}`, { headers: this.getHeadersWithToken() });
}
// Route::get('/get-recent-products',  'getAllRecent');
getAllRecent(): Observable<any> {
  return this._HttpClient.get(`${this.baseURL}/general/cashier/get-recent-products`, { headers: this.getHeadersWithToken() });
}
//   getAllStores(
//       type: string = 'all',
//       name: string = '',
//       page: number = 1,
//       perPage: number = 20
//   ): Observable<any> {
//    let params = new HttpParams();
//               if (type !== 'all') params = params.set('filter[type]', type);
//               if (name !== '') params = params.set('search', name);
//               if (page !== 1) params = params.set('page', page);
//               if (perPage !== 10) params = params.set('per_page', perPage);

//     return this._HttpClient.get(`${this.baseURL}/general/stores` ,{ 
//       headers:this.getHeadersWithToken(),
//       params: params
//      });
//   }



//   return this._HttpClient.get(url, { headers: this.getHeadersWithToken() });
// }

//   showStoreById(id:any): Observable<any>{
//     return this._HttpClient.get(this.baseURL+"/general/stores/"+id, { headers:this.getHeadersWithToken()  });
//   }
//   updateStore(store_id: string, storeData: FormData): Observable<any> {
//     storeData.append('_method', 'PUT');
//     return this._HttpClient.post(`${this.baseURL}/general/stores/${store_id}`, storeData, { headers:this.getHeadersWithToken()  });
//   }

// getProductBranchStoreByStoreId(storeId: string): Observable<any> {
//   return this._HttpClient.get(`${this.baseURL}/general/product-branch-stores/get-by-store/${storeId}`, { headers:this.getHeadersWithToken() });
// }
}


   
  
    
  
  
  

 