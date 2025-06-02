import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SalaryService } from '../../shared/services/salary.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-update-salary',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,TranslateModule],
  templateUrl: './update-salary.component.html',
  styleUrl: './update-salary.component.css'
})
export class UpdateSalaryComponent implements OnInit {
  msgError: string = '';
  msgSuccess:string ='';
  isLoading: boolean = false;
  isSubmited: boolean = false;
  salaryForm: FormGroup ;
    constructor(
    private _SalaryService:SalaryService ,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.salaryForm = new FormGroup({
     
      

     
      base_salary: new FormControl(null, [Validators.required, Validators.min(0)]),
      net_salary: new FormControl(null, [Validators.required, Validators.min(0)]),
      deduction: new FormControl(null, [Validators.required, Validators.min(0)]),
      additional_deduction: new FormControl(null, [Validators.required, Validators.min(0)]),
      bonus: new FormControl(null, [Validators.required, Validators.min(0)]),
      additional_bonus: new FormControl(null, [Validators.required, Validators.min(0)]),
      note: new FormControl(null, [Validators.maxLength(255)])
     
    
    });
  }
    ngOnInit(): void {
    const salary_id = this.route.snapshot.paramMap.get('id'); 
    if (salary_id) {
      this.fetchAttendance(salary_id);
    }
  }
  fetchAttendance(salary_id: string): void {
    this._SalaryService.getSalaryById(salary_id).subscribe({
      next: (response) => {
        if (response) {
          const salaryData = response.data ; 
          console.log(salaryData)
          this.salaryForm.patchValue({
            base_salary: salaryData.base_salary,
            net_salary: salaryData.net_salary,
            deduction: salaryData.deduction,
            additional_deduction: salaryData.additional_deduction,
            bonus: salaryData.bonus,
            additional_bonus: salaryData.additional_bonus,
            note: salaryData.note
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.msgError = err.error.error;
      }
    });
  }
   handleForm(): void {
    if (this.salaryForm.valid) {
      this.isLoading = true;
      this.isSubmited = true;
  
      const salaryData = new FormData();
     
      salaryData.append('base_salary', this.salaryForm.get('base_salary')?.value);
      salaryData.append('net_salary', this.salaryForm.get('net_salary')?.value);
      salaryData.append('deduction', this.salaryForm.get('deduction')?.value);
      salaryData.append('additional_deduction', this.salaryForm.get('additional_deduction')?.value);
      salaryData.append('bonus', this.salaryForm.get('bonus')?.value);
      salaryData.append('additional_bonus', this.salaryForm.get('additional_bonus')?.value);
      salaryData.append('note', this.salaryForm.get('note')?.value);

    
    
      const salary_id = this.route.snapshot.paramMap.get('id');
      
      if (salary_id) {
        this._SalaryService.updateSalary(salary_id, salaryData).subscribe({
          next: (response) => {
            this.toastr.success(" تم تعديل بنجاح");
            this.isLoading = false;
            if (response) {
              this.msgSuccess = response;
              setTimeout(() => {
                this.router.navigate(['/dashboard/salaries-reports']);
              }, 2000);
            }
          },
          error: (err: HttpErrorResponse) => {
            this.toastr.error('حدث خطا اثناء  تعديل ');
            this.isLoading = false;
            this.isSubmited = false;
            this.msgError = err.error.error;
          }
        });
      } else {
        this.isLoading = false;
        this.isSubmited = false;
        this.msgError = 'Salary ID is invalid.';
      }
    }
  } 
  onCancel(): void {
        this.salaryForm.reset();
        this.router.navigate(['/dashboard/attendance-reports']); 
      }  
}
