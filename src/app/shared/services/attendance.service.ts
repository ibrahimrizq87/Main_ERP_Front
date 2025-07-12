import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

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
  getEmployeesAttendance(month: string, employee_id: string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/attendances/get-employees-attendance?month=${month}&employee_id=${employee_id}`, { headers:this.getHeadersWithToken() });
  }

    getAttendanceByDate(date: string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/attendances/get-employees-attendance?day_date=${date}`, { headers:this.getHeadersWithToken() });
  }

  updateAttendanceApproval(data: FormData): Observable<any> {
    data.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/general/attendances/update-approval`,data,{ headers:this.getHeadersWithToken() });
  }



  getAttendanceById(id: string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/attendances/${id}`,{ headers:this.getHeadersWithToken() });
  }
  updateAttendance(id: string, data: FormData): Observable<any> {
    data.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/general/attendances/${id}`, data, { headers: this.getHeadersWithToken() });
  }

 importAttendance( data: FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/attendances/import`, data, { headers: this.getHeadersWithToken() });
  }


   exportAttendanceTemplate(): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/general/attendances/export-attendance`, { 
      headers: this.getHeadersWithToken(),
      responseType: 'blob' 
 });




 
  }


  
}
