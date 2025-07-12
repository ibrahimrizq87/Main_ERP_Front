import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
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
   

  ////products
  getDeterminantByProduct(id:string): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/products/get-determinants-by-product/${id}`,{ headers })
  }

  addProduct(productData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/products`, productData ,{ headers:this.getHeadersWithToken() }) ;
  }
  viewAllProducts(

// type: string = 'all',
      name: string = '',
      page: number = 1,
      perPage: number = 20

  ): Observable<any> {

      let params = new HttpParams();
                  // if (type !== 'all') params = params.set('filter[type]', type);
                  if (name !== '') params = params.set('search', name);
                  if (page !== 1) params = params.set('page', page);
                  if (perPage !== 10) params = params.set('per_page', perPage);


                  
    return this._HttpClient.get(`${this.baseURL}/general/products`,{
       headers:this.getHeadersWithToken(),
       params: params
      });
  }

  getSerialNumbers(productId:string , storeId:string,
     searchQuery: string = '',
     type: string = 'sale',

      page: number = 1,
      perPage: number = 10
  ): Observable<any> {

          let params = new HttpParams();
                  // if (type !== 'all') params = params.set('filter[type]', type);
                  if (searchQuery !== '') params = params.set('searchTerm', searchQuery);
                  if (type !== 'sale') params = params.set('type', type);
                  if (page !== 1) params = params.set('page', page);
                  if (perPage !== 10) params = params.set('per_page', perPage);


    return this._HttpClient.get(`${this.baseURL}/general/products/get-serial-numbers/${productId}/${storeId}`,{ 
      headers:this.getHeadersWithToken(),
      params:params  });
  }

  getSerialNumbersForReturnSales(productId:string , storeId:string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/products/get-serial-numbers-for-return-sales/${productId}/${storeId}`,{ headers:this.getHeadersWithToken()  });
  }

  



  viewProductById(id:any): Observable<any>{
    return this._HttpClient.get(this.baseURL+"/general/products/"+id, { headers:this.getHeadersWithToken() });
  }


  deleteProductImage(imageId:number): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/general/products/delete-product-image/${imageId}`,{ headers:this.getHeadersWithToken() });
  }

  deleteProductColor(colorId:number): Observable<any> {
    return this._HttpClient.delete(`${this.baseURL}/general/products/delete-product-color/${colorId}`,{ headers:this.getHeadersWithToken() });
  }
  updateProduct(productId: string, productData: FormData): Observable<any> {
    productData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/general/products/${productId}`, productData, { headers:this.getHeadersWithToken() });
  }

    
  deleteProduct(productId: number): Observable<any> {
  
    return this._HttpClient.delete(`${this.baseURL}/general/products/${productId}`, { headers:this.getHeadersWithToken() });
  }

  exportProducts(): Observable<Blob> {
    return this._HttpClient.get(`${this.baseURL}/general/products/export-products-as-sheet`, {
      headers: this.getHeadersWithToken(),
      responseType: 'blob' // Important: Handle binary response
    });
  }


  importProducts(data:FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/products/import-products-as-sheet`,data ,{headers: this.getHeadersWithToken() });
  }
  



  exportProductsTemplates(template:string): Observable<Blob> {
    return this._HttpClient.get(`${this.baseURL}/general/products/export-products-as-sheet/templates/${template}`, {
      headers: this.getHeadersWithToken(),
      responseType: 'blob' 
    });
  }
  
  importProductsTemplates(data:FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/products/import-products-as-sheet/templates`,data ,{headers: this.getHeadersWithToken() });
  }
  

  getProductsForOperations(
      searchTerm: string = '',
      page: number = 1,
      perPage: number = 10
  ): Observable<any> {
      let params = new HttpParams();

      if (searchTerm !== '') params = params.set('searchTerm', searchTerm);
      if (page !== 1) params = params.set('page', page);
      if (perPage !== 10) params = params.set('per_page', perPage);

    return this._HttpClient.get(`${this.baseURL}/general/products/get-products-for-operations`,{ 
      headers: this.getHeadersWithToken(),
      params: params 
    });
  }


  

  getProductsByStore(storeID:string): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/stores/products/${storeID}`,{ headers });
  }
  getProductBranchsByStore(storeID:string): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/stores/product-branchs/${storeID}`,{ headers });
  }


  



}
