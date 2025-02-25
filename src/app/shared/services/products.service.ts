import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  viewAllProducts(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/products`,{ headers:this.getHeadersWithToken()  });
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



  //// ProductUnits


  // addProductUnit(unitData: FormData): Observable<any> {
  //   const token = localStorage.getItem('Token');
  //   const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  //   return this._HttpClient.post(`${this.baseURL}/products-units`, unitData ,{ headers }).pipe(
  //     catchError(this.handleError));
  // }
  // viewProductUnits(): Observable<any> {
  //   const token = localStorage.getItem('Token');
  //   const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  //   return this._HttpClient.get(`${this.baseURL}/products-units`,{ headers });
  // }
  // deleteUnit(unitId: number): Observable<any> {
  //   const token = localStorage.getItem('Token');
  //   const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
  //   return this._HttpClient.delete(`${this.baseURL}/products-units/${unitId}`, { headers }).pipe(
  //     catchError(this.handleError)
  //   );
  // }
  // getUnitById(id:any): Observable<any>{
  //   const token = localStorage.getItem('Token');

  //   const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  //   return this._HttpClient.get(this.baseURL+"/products-units/"+id, { headers }).pipe(
  //     catchError(this.handleError)
  //   );
  // }
  // updateUnit(unitId: string, unitsData: FormData): Observable<any> {
  //   const token = localStorage.getItem('Token');
  //   const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  //   unitsData.append('_method', 'PUT');
  //   return this._HttpClient.post(`${this.baseURL}/products-units/${unitId}`, unitsData, { headers }).pipe(
  //     catchError(this.handleError)
  //   );
  // }


  ////productBranch


  addProductBranch(branchData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.post(`${this.baseURL}/products-branches`, branchData ,{ headers })
  }
  viewProductBranches(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/products-branches`,{ headers });
  }
  deleteBranch(branchId: number): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    return this._HttpClient.delete(`${this.baseURL}/products-branches/${branchId}`, { headers })
  }
  getBranchById(id:any): Observable<any>{
    const token = localStorage.getItem('Token');

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this._HttpClient.get(this.baseURL+"/products-branches/"+id, { headers });
  }
  updateBranch(unitId: string, unitsData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    unitsData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/products-branches/${unitId}`, unitsData, { headers });
  }
  ///////////////////////////determinane

  addProductDeterminants(determinantData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.post(`${this.baseURL}/determinants`, determinantData ,{ headers })
  }
  viewAllDeterminants(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/determinants`,{ headers });
  }
  deleteDeterminant(DeterminantId: number): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    return this._HttpClient.delete(`${this.baseURL}/determinants/${DeterminantId}`, { headers })
  }

}
