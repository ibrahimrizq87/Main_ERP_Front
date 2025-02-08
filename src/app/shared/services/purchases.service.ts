import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PurchasesService {

  private baseURL = environment.apiUrl;
  constructor(private _HttpClient: HttpClient) {
  }
  // Route::get('purchases-bills/get-by-status/{status}', [PurchasesBillController::class, 'getByStatus'])->middleware('auth:sanctum');
  // Route::get('purchases-bills/status/{purchasesBill}', [PurchasesBillController::class, 'updateBillStatus'])->middleware('auth:sanctum');
  // Get token to send it with each request
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return headers;
  }

  addBill(billData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/purchases-bills`, billData, { headers: this.getHeaders() });
  }

  approveBill(billId: string): Observable<any> {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    return this._HttpClient.post(
      `${this.baseURL}/purchases-bills/status/${billId}`, formData, { headers: this.getHeaders() }
    );
  }

  // Import order
  // Import consignment
  addPurchase(purchasesData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.post(`${this.baseURL}/purchases-bills`, purchasesData ,{ headers })
  }
  viewAllPurchases(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/purchases-bills`,{ headers });
  }
  deletePurchase(branchId: number): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    return this._HttpClient.delete(`${this.baseURL}/purchases-bills/${branchId}`, { headers })
  }
  getPurchaseById(id:any): Observable<any>{
    const token = localStorage.getItem('Token');

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this._HttpClient.get(this.baseURL+"/purchases-bills/"+id, { headers })
    
  }
  updatePurchase(purchaseId: string, PurchaseData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    PurchaseData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/products-branches/${purchaseId}`, PurchaseData, { headers })
  }



// orders


  addOrder(ordersData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.post(`${this.baseURL}/purchases-orders`, ordersData ,{ headers })
  }
  viewAllOrders(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/purchases-orders`,{ headers });
  }
  deleteOrder(orderId: number): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    return this._HttpClient.delete(`${this.baseURL}/purchases-orders/${orderId}`, { headers })
  }
  getOrderById(id:any): Observable<any>{
    const token = localStorage.getItem('Token');

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this._HttpClient.get(this.baseURL+"/purchases-orders/"+id, { headers })
    
  }
  UpdateOrder(orderId: string, ordersData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    ordersData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/purchases-orders/${orderId}`,orderId , { headers })
  }
   // Route::get('purchases-bills/get-by-status/{status}', [PurchasesBillController::class, 'getByStatus'])->middleware('auth:sanctum');
  getPurchaseBillsByStatus(status:string): Observable<any>{
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
 
    return this._HttpClient.get(`${this.baseURL}/purchases-bills/get-by-status/${status}`, { headers })

  }

   // Route::get('purchases-bills/status/{purchasesBill}', [PurchasesBillController::class, 'updateBillStatus'])->middleware('auth:sanctum');
   storeStatusOfPurchaseBill(purchasesBillId:number){
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/purchases-bills/status/${purchasesBillId}`, { headers })
   }


  //  Route::put('purchases-orders/status/{purchasesOrder}/{status}', [PurchasesOrderController::class, 'updateOrderStatus']);
  //   Route::get('purchases-orders/get-by-status/{status}', [PurchasesOrderController::class, 'getByStatus']);
  getOrdersByStatus(status:string): Observable<any>{
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
 
    return this._HttpClient.get(`${this.baseURL}/purchases-orders/get-by-status/${status}`, { headers })
  }
  updateStatusOfOrder(orderId:number,status:string){
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/purchases-orders/status/${orderId}/${status}`, { headers })
   }
}
