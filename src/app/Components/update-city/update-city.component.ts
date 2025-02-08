import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CityService } from '../../shared/services/city.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

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
    constructor(
    private _CityService: CityService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.cityForm = new FormGroup({
      city: new FormControl(null, [Validators.required]),
      country: new FormControl(null, [Validators.required]),
    
    });
  }
    ngOnInit(): void {
    const cityId = this.route.snapshot.paramMap.get('id'); 
    if (cityId) {
      this.fetchCityData(cityId);
    }
  }
    fetchCityData(cityId: string): void {
    this._CityService.getCityById(cityId).subscribe({
      next: (response) => {
        if (response) {
          const cityData = response.data ; 
          console.log(cityData)
          this.cityForm.patchValue({
            city: cityData.city,
            country: cityData.country,
           
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
      cityData.append('city', this.cityForm.get('city')?.value);
      cityData.append('country', this.cityForm.get('country')?.value);
    
      const cityId = this.route.snapshot.paramMap.get('id');
      
      if (cityId) {
        this._CityService.updateCity(cityId, cityData).subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response) {
              this.msgSuccess = response;
              setTimeout(() => {
                this.router.navigate(['/dashboard/city']);
              }, 2000);
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
