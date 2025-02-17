
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CountryService } from '../../shared/services/country.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-add-country',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule ,TranslateModule],
  templateUrl: './add-country.component.html',
  styleUrl: './add-country.component.css'
})
export class AddCountryComponent {
  msgError: string = '';
  isLoading: boolean = false;

  constructor(private _CountryService:CountryService , private _Router: Router,private translate: TranslateService) {
    // this.translate.setDefaultLang('en'); 
  }


  countryForm: FormGroup = new FormGroup({
    country_ar: new FormControl(null, [Validators.required]),
    country_en: new FormControl(null, [Validators.required]),

  });

  handleForm() {
   
    if (this.countryForm.valid) {
      this.isLoading = true;

      const formData = new FormData();
    
      formData.append('name[ar]', this.countryForm.get('country_ar')?.value);
      formData.append('name[en]', this.countryForm.get('country_en')?.value);

      this._CountryService.addCountry(formData).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.isLoading = false;


          
            this._Router.navigate(['/dashboard/countries']);
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
