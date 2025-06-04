import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

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


  private permissions: { [key: string]: string[] } = {};

  setPermissions(permissions: { [key: string]: string[] }) {
    this.permissions = permissions;
  }

  hasPermission(module: string, action: string): boolean {
    return this.permissions[module]?.includes(action) ?? false;
  }


  hasAnyModule(modules: string []): boolean {
    return modules.some(module => !!this.permissions[module]);
  }

 hasModule(module: string): boolean {
    return this.permissions[module] ? true : false;
  }
    savePermissionsFromServer() {
    this.fetchPermissionsFromServer().subscribe({
      next: (res) => this.setPermissions(res),
      error: () => console.warn('Failed to load permissions.')
    });



  }



 fetchPermissionsFromServer(): Observable<any> {
    return this._HttpClient.post(
      `${this.baseURL}/general/roles-permissions/get-my-permissions`,
      {},
      { headers: this.getHeadersWithToken() }
    ).pipe(
      tap((res: any) => {
        if (res) {

          // this.setPermissions(res.permissions);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Permission load failed', error);
        return throwError(() => error);
      })
    );
  }



}
