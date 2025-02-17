

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CountryService } from '../../shared/services/country.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-update-country',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule ,TranslateModule],
  templateUrl: './update-country.component.html',
  styleUrl: './update-country.component.css'
})
export class UpdateCountryComponent {
  msgError: string = '';
  isLoading: boolean = false;

  constructor(    private route: ActivatedRoute
  ,private _CountryService:CountryService , private _Router: Router,private translate: TranslateService) {
    // this.translate.setDefaultLang('en'); 
  }


  countryForm: FormGroup = new FormGroup({
    country_ar: new FormControl(null, [Validators.required]),
    country_en: new FormControl(null, [Validators.required]),

  });


  ngOnInit(): void {
    const currency_id = this.route.snapshot.paramMap.get('id'); 
    if (currency_id) {
      this.fetchCountryData(currency_id);
    }
  }

  fetchCountryData(id:string){
    this._CountryService.getCountryById(id).subscribe({
      next: (response) => {
        if (response) {
          const currencyData = response.data ; 
          console.log(currencyData)
          this.countryForm.patchValue({
            country_ar:currencyData.name_langs.ar,
            country_en:currencyData.name_langs.en,
          
           
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.msgError = err.error.error;
      }
    });
  }
  handleForm() {
   
    if (this.countryForm.valid) {
      this.isLoading = true;

      const formData = new FormData();
    
      formData.append('name[ar]', this.countryForm.get('country_ar')?.value);
      formData.append('name[en]', this.countryForm.get('country_en')?.value);
      const country_id = this.route.snapshot.paramMap.get('id');

      this._CountryService.updateCountry(country_id||'' , formData).subscribe({
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
