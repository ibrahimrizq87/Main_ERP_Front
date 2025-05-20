import { Component } from '@angular/core';
import { VectionService } from '../../shared/services/vection.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-vecation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ReactiveFormsModule],
  templateUrl: './add-vecation.component.html',
  styleUrl: './add-vecation.component.css'
})
export class AddVecationComponent {
  msgErrors: any[] = [];
  isLoading: boolean = false;

  isSubmitted = false;
  vecationForm: FormGroup;

  constructor(
    private _Router: Router,
    private _VectionService: VectionService,
    private fb: FormBuilder,
    private toastr: ToastrService,
  ) {
    this.vecationForm = this.fb.group({
      start_date: ['', Validators.required],
      end_date: ['', [Validators.required, this.validateEndDate.bind(this)]],
      reason: ['', [Validators.required, Validators.maxLength(255)]],
    });
  }

  // Custom validator for end date
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

      this._VectionService.addVecation(formData).subscribe({
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
    } else {
      this.toastr.error('خطا في البيانات المدخله');
    }
  }
}