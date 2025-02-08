import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  // products/get-determinants-by-product/{product_id}
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


  ////products
  getDeterminantByProduct(id:string): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/products/get-determinants-by-product/${id}`,{ headers })
  }

  addProduct(productData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.post(`${this.baseURL}/products`, productData ,{ headers }) ;
  }
  viewAllProducts(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/products`,{ headers });
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
  
  deleteProduct(productId: number): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    return this._HttpClient.delete(`${this.baseURL}/products/${productId}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  viewProductById(id:any): Observable<any>{
    const token = localStorage.getItem('Token');

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this._HttpClient.get(this.baseURL+"/products/"+id, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  updateProduct(productId: string, productData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    productData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/products/${productId}`, productData, { headers }).pipe(
      catchError(this.handleError)
    );
  }


  //// ProductUnits


  addProductUnit(unitData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.post(`${this.baseURL}/products-units`, unitData ,{ headers }).pipe(
      catchError(this.handleError));
  }
  viewProductUnits(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/products-units`,{ headers });
  }
  deleteUnit(unitId: number): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    return this._HttpClient.delete(`${this.baseURL}/products-units/${unitId}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  getUnitById(id:any): Observable<any>{
    const token = localStorage.getItem('Token');

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this._HttpClient.get(this.baseURL+"/products-units/"+id, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  updateUnit(unitId: string, unitsData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    unitsData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/products-units/${unitId}`, unitsData, { headers }).pipe(
      catchError(this.handleError)
    );
  }


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

    return this._HttpClient.get(this.baseURL+"/products-branches/"+id, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  updateBranch(unitId: string, unitsData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    unitsData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/products-branches/${unitId}`, unitsData, { headers }).pipe(
      catchError(this.handleError)
    );
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
