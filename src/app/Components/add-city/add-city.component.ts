import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CityService } from '../../shared/services/city.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CountryService } from '../../shared/services/country.service';
@Component({
  selector: 'app-add-city',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule ,TranslateModule],
  templateUrl: './add-city.component.html',
  styleUrl: './add-city.component.css'
})
export class AddCityComponent {
  msgError: string = '';
  isLoading: boolean = false;
countries :any;
selectedCountry:any;
  constructor(private _CityService:CityService ,private _CountryService:CountryService, private _Router: Router,private translate: TranslateService) {
    // this.translate.setDefaultLang('en'); 
  }


  cityForm: FormGroup = new FormGroup({
    city: new FormControl(null, [Validators.required]),
    country_id: new FormControl(null, [Validators.required]),
   
  });
  ngOnInit() {
    this.loadCountries();
  }

  loadCountries(): void {
    this._CountryService.viewAllcountries().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.countries = response.data; 
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  onCountryChange(event:Event){

    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedCountry =selectedValue;
    console.log( this.selectedCountry);
  }
  handleForm() {
   
    if (this.cityForm.valid &&  this.selectedCountry) {
      this.isLoading = true;

      const formData = new FormData();
    
      formData.append('country_id',  this.selectedCountry);
      formData.append('name', this.cityForm.get('city')?.value);

      this._CityService.addCity(formData).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.isLoading = false;


          
            this._Router.navigate(['/dashboard/city']);
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
