import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VectionService } from '../../shared/services/vection.service';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-update-vecation',
  standalone: true,
  imports: [CommonModule,FormsModule,TranslateModule,ReactiveFormsModule],
  templateUrl: './update-vecation.component.html',
  styleUrl: './update-vecation.component.css'
})
export class UpdateVecationComponent implements OnInit {

  msgErrors: any[] = [];
  isLoading: boolean = false;
  isSubmitted = false;
  vecationForm: FormGroup;

  constructor(
    private _Router: Router,
    private _VectionService: VectionService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private route: ActivatedRoute,
  ) {
    this.vecationForm = this.fb.group({
      start_date: ['', Validators.required],
      end_date: ['', [Validators.required, this.validateEndDate.bind(this)]],
      reason: ['', [Validators.required, Validators.maxLength(255)]],
    });
  }
  ngOnInit(): void {
    const vecation_id = this.route.snapshot.paramMap.get('id'); 
    if (vecation_id) {
      this.fetchGroupData(vecation_id);
    }
   

  }
  fetchGroupData(vecation_id: string): void {
    this._VectionService.showVecationById(vecation_id).subscribe({
      next: (response) => {
        if (response) {
          console.log(response)
          this.vecationForm.patchValue({
            start_date: response.data.start_date,
            end_date: response.data.end_date,
            reason: response.data.reason,
          });
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }


  validateEndDate(control: AbstractControl): ValidationErrors | null {
    const startDate = this.vecationForm?.get('start_date')?.value;
    const endDate = control.value;
    
    if (!startDate || !endDate) {
      return null;
    }
    
    if (new Date(endDate) < new Date(startDate)) {
      return { endDateBeforeStart: true };
    }
    
    return null;
  }

  handleForm() {
    this.isSubmitted = true;
    if (this.vecationForm.valid) {
      this.isLoading = true;
      const formData = new FormData();

      formData.append('start_date', this.vecationForm.get('start_date')?.value);
      formData.append('end_date', this.vecationForm.get('end_date')?.value);
      formData.append('reason', this.vecationForm.get('reason')?.value);
      const vecation_id = this.route.snapshot.paramMap.get('id');
      if(vecation_id){
      this._VectionService.updateVecation(vecation_id,formData).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.toastr.success("تم اضافه الاجازة بنجاح");
            this.isLoading = false;
            this._Router.navigate(['/dashboard/vecations']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error("حدث خطا اثناء اضافه الاجازة");
          this.isLoading = false;
          this.msgErrors = err.error.errors;
          console.log(err.error.errors);
        }
      });
    }
    } else {
      this.toastr.error('خطا في البيانات المدخله');
    }
  }
  cancel() {
    this.vecationForm.reset();
    this.isSubmitted = false;
   
    this._Router.navigate(['/dashboard/vecations']);

    
    }
}
