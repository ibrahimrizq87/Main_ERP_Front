import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyService } from '../../shared/services/currency.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-update-currency',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule ,TranslateModule],
  templateUrl: './update-currency.component.html',
  styleUrl: './update-currency.component.css'
})
export class UpdateCurrencyComponent implements OnInit {
  msgError: string = '';
  msgSuccess:string ='';
  isLoading: boolean = false;
  currencyForm:FormGroup
    constructor(
    private _CurrencyService: CurrencyService,
    private _Router: Router,
    private route: ActivatedRoute
  ) {
   this.currencyForm= new FormGroup({
      currency_name_ar: new FormControl(null, [Validators.required,Validators.maxLength(255)]),
      currency_name_en: new FormControl(null, [Validators.required,Validators.maxLength(255)]),
      derivative_name_ar: new FormControl(null, [Validators.required,Validators.maxLength(255)]),
      derivative_name_en: new FormControl(null, [Validators.required,Validators.maxLength(255)]),
      abbreviation: new FormControl(null, [Validators.required,Validators.maxLength(10)]),
      value: new FormControl(null, [Validators.required]),
      // user_id:new FormControl(null),
     
    });
  }
    ngOnInit(): void {
    const currency_id = this.route.snapshot.paramMap.get('id'); 
    if (currency_id) {
      this.fetchCityData(currency_id);
    }
  }
    fetchCityData(currency_id: string): void {
    this._CurrencyService.getCurrencyById(currency_id).subscribe({
      next: (response) => {
        if (response) {
          const currencyData = response.data ; 
          console.log(currencyData)
          this.currencyForm.patchValue({
            currency_name_ar:currencyData.currency_name_ar,
            currency_name_en:currencyData.currency_name_en,
            derivative_name_ar:currencyData.derivative_name_ar,
            derivative_name_en:currencyData.derivative_name_en,
            abbreviation:currencyData.abbreviation,
            value:currencyData.value
           
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.msgError = err.error.error;
      }
    });
  }
  handleForm() {
   
    if (this.currencyForm.valid) {
    
      this.isLoading = true;

      const formData = new FormData();
      formData.append('currency_name_ar', this.currencyForm.get('currency_name_ar')?.value);
      formData.append('currency_name_en', this.currencyForm.get('currency_name_en')?.value);
      formData.append('derivative_name_ar', this.currencyForm.get('derivative_name_ar')?.value);
      formData.append('derivative_name_en', this.currencyForm.get('derivative_name_en')?.value);
      formData.append('abbreviation', this.currencyForm.get('abbreviation')?.value);
      formData.append('value', this.currencyForm.get('value')?.value);
      formData.append('user_id', '1'); 
      const currency_id = this.route.snapshot.paramMap.get('id');
      
      if (currency_id) {
      this._CurrencyService.updateCurrency(currency_id,formData).subscribe({
      
      next: (response) => {
          console.log(response);
          if (response) {
            this.isLoading = false;
            this._Router.navigate(['/dashboard/currency']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
           this.msgError = err.error.error;
          console.log(err);
        }
      });
    }
  }
  }
  onCancel(): void {
        this.currencyForm.reset();
       
        this._Router.navigate(['/dashboard/currency']); 
      }  
}
