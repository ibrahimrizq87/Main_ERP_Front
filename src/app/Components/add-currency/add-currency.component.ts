import { Component } from '@angular/core';
import { CurrencyComponent } from '../currency/currency.component';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CurrencyService } from '../../shared/services/currency.service';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-add-currency',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormsModule,TranslateModule ],
  templateUrl: './add-currency.component.html',
  styleUrl: './add-currency.component.css'
})
export class AddCurrencyComponent {
  msgError: string = '';
  isLoading: boolean = false;
  isSubmited = false;

  constructor(private _CurrencyService:CurrencyService , private _Router: Router,private toastr:ToastrService) {}

  currencyForm: FormGroup = new FormGroup({
    currency_name_ar: new FormControl(null, [Validators.required,Validators.maxLength(255)]),
    currency_name_en: new FormControl(null, [Validators.required,Validators.maxLength(255)]),
    derivative_name_ar: new FormControl(null, [Validators.required,Validators.maxLength(255)]),
    derivative_name_en: new FormControl(null, [Validators.required,Validators.maxLength(255)]),
    abbreviation: new FormControl(null, [Validators.required,Validators.maxLength(10)]),
    value: new FormControl(null, [Validators.required]),
    // user_id:new FormControl(null),
   
  });

  handleForm() {
    this.isSubmited = true;
    if (this.currencyForm.valid) {
    
      this.isLoading = true;

      const formData = new FormData();

      formData.append('name[en]', this.currencyForm.get('currency_name_en')?.value);
      formData.append('name[ar]', this.currencyForm.get('currency_name_ar')?.value);
      formData.append('derivative_name[en]', this.currencyForm.get('derivative_name_en')?.value);
      formData.append('derivative_name[ar]', this.currencyForm.get('derivative_name_ar')?.value);
      formData.append('abbreviation', this.currencyForm.get('abbreviation')?.value);
      formData.append('value', this.currencyForm.get('value')?.value);
      

      this._CurrencyService.addCurrency(formData).subscribe({
      
      next: (response) => {
          console.log(response);
          if (response) {
            this.toastr.success('تم اضافه العمله بنجاح');
            this.isLoading = false;
            this._Router.navigate(['/dashboard/currency']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error('حدث خطا اثناء اضافه العمله');
          this.isLoading = false;
           this.msgError = err.error.error;
          console.log(err);
        }
      });
    }
  }

}