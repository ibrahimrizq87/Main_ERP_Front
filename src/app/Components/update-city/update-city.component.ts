import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CityService } from '../../shared/services/city.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { CountryService } from '../../shared/services/country.service';

@Component({
  selector: 'app-update-city',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,TranslateModule],
  templateUrl: './update-city.component.html',
  styleUrl: './update-city.component.css'
})
export class UpdateCityComponent implements OnInit {
  msgError: string = '';
  msgSuccess:string ='';
  isLoading: boolean = false;
  cityForm: FormGroup ;
  countries:any;
  selectedCountry:any;
    constructor(
    private _CityService: CityService,
    private router: Router,
    private route: ActivatedRoute,
    private _CountryService:CountryService
  ) {
    this.cityForm = new FormGroup({
      city: new FormControl(null, [Validators.required]),
      country_id: new FormControl(null, [Validators.required]),
    
    });
  }
    ngOnInit(): void {
    const cityId = this.route.snapshot.paramMap.get('id'); 
    if (cityId) {
      this.fetchCityData(cityId);
    }
    this.loadCountries();
  }
  onCountryChange(event:Event){

    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedCountry =selectedValue;
    console.log( this.selectedCountry);
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



    fetchCityData(cityId: string): void {
    this._CityService.getCityById(cityId).subscribe({
      next: (response) => {
        if (response) {
          const cityData = response.data ; 
          console.log(cityData)
          this.cityForm.patchValue({
            city: cityData.name,
            country_id: cityData.country.id,
           
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.msgError = err.error.error;
      }
    });
  }
   handleForm(): void {
    if (this.cityForm.valid) {
      this.isLoading = true;
  
      const cityData = new FormData();
      cityData.append('name', this.cityForm.get('city')?.value);
      cityData.append('country_id', this.cityForm.get('country_id')?.value);
    
      const cityId = this.route.snapshot.paramMap.get('id');
      
      if (cityId) {
        this._CityService.updateCity(cityId, cityData).subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response) {
              this.msgSuccess = response;
              this.router.navigate(['/dashboard/city']);

              // setTimeout(() => {
              // }, 2000);
            }
          },
          error: (err: HttpErrorResponse) => {
            this.isLoading = false;
            this.msgError = err.error.error;
          }
        });
      } else {
        this.isLoading = false;
        this.msgError = 'city ID is invalid.';
      }
    }
  } 
  onCancel(): void {
        this.cityForm.reset();
       
        this.router.navigate(['/dashboard/city']); 
      }  
}
