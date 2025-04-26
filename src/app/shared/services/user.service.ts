import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, catchError, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseURL = environment.apiUrl;
  constructor(private _HttpClient: HttpClient, private translate: TranslateService) {
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


  private getHeaders(): HttpHeaders {
    const currentLang = this.translate.currentLang || (localStorage.getItem('lang') || 'ar');
    console.log('lang ', currentLang);

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

  setLogin(userData: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/login`, userData, { headers: this.getHeaders() });
  }
  createUser(userData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.post(`${this.baseURL}/users`, userData, { headers: this.getHeadersWithToken() }).pipe(
      catchError(this.handleError));
  }
  viewAllVendor(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/delegates`, { headers }).pipe(
      catchError(this.handleError));
  }
  showVendorById(id: any): Observable<any> {
    const token = localStorage.getItem('Token');

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this._HttpClient.get(this.baseURL + "/delegates/" + id, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  updateVendor(vendorId: string, vendorData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    vendorData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/delegates/${vendorId}`, vendorData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  deleteVendor(vendorId: number): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this._HttpClient.delete(`${this.baseURL}/delegates/${vendorId}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  viewAllUsers(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/general/users`, { headers })
  }
  deleteUser(userId: number): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.delete(`${this.baseURL}/general/users/${userId}`, { headers })
  }
  addUser(userData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.post(`${this.baseURL}/general/users`, userData, { headers })
  }
  getUserById(userId: any): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/general/users/${userId}`, { headers })
  }
  updateUser(userId: string, userData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    userData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/general/users/${userId}`, userData, { headers })
  }
  // general/roles-permissions/roles
  getAllRoLes(): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/general/roles-permissions/roles`, { headers })
  }
  getUserPermissionsForEdit(userId: number): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/general/roles-permissions/get-user-permissions-for-edit/${userId}`, { headers })
  }
  getRolesPermissionsForEdit(roleId:number): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.get(`${this.baseURL}/general/roles-permissions/get-role-permissions-for-edit/${roleId}`, { headers })
  }
  assignPermissionsToUser(userId: number, permissions: number[], RemovePermissions: number[]): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    const formData = new FormData();
    formData.append('user_id', userId.toString());
  
    permissions.forEach((permId, index) => {
      formData.append(`permissions[${index}]`, permId.toString());
    });

    RemovePermissions.forEach((permId, index) => {
      formData.append(`remove_permissions[${index}]`, permId.toString());
    });
    console.log(permissions , RemovePermissions);
    return this._HttpClient.post(`${this.baseURL}/general/roles-permissions/assign-permissions-to-user`, formData, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  assignPermissionsToRole(roleId: number, permissions: number[] , RemovePermissions: number[]): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    const formData = new FormData();
    formData.append('role_id', roleId.toString());
  
    permissions.forEach((permId, index) => {
      formData.append(`permissions[${index}]`, permId.toString());
    });
    RemovePermissions.forEach((permId, index) => {
      formData.append(`remove_permissions[${index}]`, permId.toString());
    });
    return this._HttpClient.post(`${this.baseURL}/general/roles-permissions/assign-permissions-to-role`, formData, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  // remove-permissions-from-user
  removePermissionsFromUser(userId: number, permissions: number[]): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    const formData = new FormData();
    formData.append('user_id', userId.toString());
  
    permissions.forEach((permId, index) => {
      formData.append(`permissions[${index}]`, permId.toString());
    });
  
    return this._HttpClient.post(`${this.baseURL}/general/roles-permissions/remove-permissions-from-user`, formData, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  // Route::group(['prefix' => 'roles-permissions'], function () {
  //   Route::post('/', [RoleAndPermissionController::class, 'createRole'])->middleware('permission:create roles');
  //   Route::get('/roles', [RoleAndPermissionController::class, 'getRoles'])->middleware('permission:view roles');
  //   Route::delete('/roles/{id}', [RoleAndPermissionController::class, 'deleteRole'])->middleware('permission:delete roles');
  // roles-permissions/roles
  deleteRole(roleId: number): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.delete(`${this.baseURL}/general/roles-permissions/roles/${roleId}`, { headers })
  }
  addRole(roleData: FormData): Observable<any> {
    const token = localStorage.getItem('Token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this._HttpClient.post(`${this.baseURL}/general/roles-permissions/`, roleData, { headers })
  }

}
