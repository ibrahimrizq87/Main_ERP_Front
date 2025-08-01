import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalaryService {

  
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

  getSalariesReports(month?: string, employee_id?: string): Observable<any> {
    let url = `${this.baseURL}/employee/salaries/get-salaries-calculated?`;
    if (month) {
      url += `month=${month}`;
    }
    if (employee_id) {
      url += `&employee_id=${employee_id}`;
    }
    return this._HttpClient.get(url, { headers: this.getHeadersWithToken() });
  }
  getSalaryByMonth(month:string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/employee/salaries/get-salaries-calculated?month=${month}`, { headers: this.getHeadersWithToken() });
  }


  saveSalary(salaryData:FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/general/salaries`, salaryData ,{ headers:this.getHeadersWithToken() });
  }


  getSalaryByEmployee(employee_id: string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/employee/salaries/get-salaries-calculated?employee_id=${employee_id}`, { headers: this.getHeadersWithToken() });
  }



    
  getSavedSalaries(month:string , status:string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/employee/salaries/get-salaries-to-be-paid/${status}?month=${month}`, { headers: this.getHeadersWithToken() });
  }

  paySalaty(salaryData:FormData): Observable<any> {
    return this._HttpClient.post(`${this.baseURL}/employee/salaries/pay-salary`, salaryData ,{ headers:this.getHeadersWithToken() });
  }

  // Route::controller(SalaryController::class)->prefix('salaries')->group(function () {
  //   Route::get('/get-salaries-calculated',  'calculateSalary');  
  //   Route::get('/get-salaries-to-be-paid/{status}',  'getSavedSalaries');  
  //   Route::post('/pay-salary',  'paySalaries');  
  //   Route::put('/{id}', [SalaryController::class, 'update']);
  //   Route::get('/{id}', [SalaryController::class, 'show']);
  updateSalary(id: string, salaryData: FormData): Observable<any> {
    salaryData.append('_method', 'PUT');
    return this._HttpClient.post(`${this.baseURL}/employee/salaries/${id}`, salaryData, { headers: this.getHeadersWithToken() });
  }
  getSalaryById(id: string): Observable<any> {
    return this._HttpClient.get(`${this.baseURL}/employee/salaries/${id}`, { headers: this.getHeadersWithToken() });
  }

  

}
