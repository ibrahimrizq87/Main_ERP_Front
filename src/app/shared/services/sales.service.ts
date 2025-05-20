import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class SalesService {


  
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
   



  
  addSale(salesData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/sale-bills`, salesData ,{ headers:this.getHeadersWithToken() })
  }

  getAllSaleBillsByStatus(status:string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/sale-bills/get-sale-bills-by-status/${status}`,{ headers:this.getHeadersWithToken()  });
  }
  UpdateSaleBillStatus(id:string , status:string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/sale-bills/update-status/${id}/${status}`,{ headers:this.getHeadersWithToken()  });
  }
  
  getSaleById(id:any): Observable<any>{
    return this._HttpClient.get(this.baseURL+"/general/sale-bills/"+id, { headers:this.getHeadersWithToken() })
  }
  
  viewAllSales(status:string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/sale-bills/${status}`,{ headers:this.getHeadersWithToken() });
  }
  deleteSale(saleId: number): Observable<any> {
  
    return this._HttpClient.delete(`${this.baseURL}/general/sale-bills/${saleId}`, { headers:this.getHeadersWithToken() })
  }
  updateSale(saleId: string, salesData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    salesData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/sales-bills/${saleId}`, salesData, { headers })
  }


    getBillsByClientId(id:any): Observable<any>{
    return this._HttpClient.get(this.baseURL+"/general/sale-bills/get-by-client-id/"+id, { headers:this.getHeadersWithToken() })
  }
  

  ////////////////////////////////////////////






  addReturnSales(salesData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/return-sale-bills`, salesData ,{ headers:this.getHeadersWithToken() })
  }

  getReturnSaleBillsByStatus(status:string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/return-sale-bills/get-bill-by-status/${status}`,{ headers:this.getHeadersWithToken()  });
  }
  UpdateReturnSaleBillStatus(id:string , status:string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/return-sale-bills/update-status/${id}/${status}`,{ headers:this.getHeadersWithToken()  });
  }
  
  getReturnSaleById(id:any): Observable<any>{
    return this._HttpClient.get(this.baseURL+"/general/return-sale-bills/"+id, { headers:this.getHeadersWithToken() })
  }
  
  viewAllReturnSales(status:string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/return-sale-bills/${status}`,{ headers:this.getHeadersWithToken() });
  }
  deleteReturnSale(saleId: number): Observable<any> {
  
    return this._HttpClient.delete(`${this.baseURL}/general/return-sale-bills/${saleId}`, { headers:this.getHeadersWithToken() })
  }
  updateReturnSale(saleId: string, salesData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    salesData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/return-sale-bills/${saleId}`, salesData, { headers })
  }

    getReturnBillsByClientId(id:any): Observable<any>{
    return this._HttpClient.get(this.baseURL+"/general/return-sale-bills/get-by-client-id/"+id, { headers:this.getHeadersWithToken() })
  }
  

}
