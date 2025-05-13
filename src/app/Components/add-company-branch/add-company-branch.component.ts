import { Component } from '@angular/core';
import { CompanyBranchService } from '../../shared/services/company-branch.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { CityService } from '../../shared/services/city.service';
import { CountryService } from '../../shared/services/country.service'; // You'll need this service

@Component({
  selector: 'app-add-company-branch',
  standalone: true,
  imports: [TranslateModule, CommonModule, ReactiveFormsModule],
  templateUrl: './add-company-branch.component.html',
  styleUrl: './add-company-branch.component.css'
})
export class AddCompanyBranchComponent {
  isSubmitted = false;
  msgError: string = '';
  isLoading: boolean = false;
  countries: any[] = [];
  cities: any[] = [];

  constructor(
    private _CompanyBranchService: CompanyBranchService,
    private _Router: Router,
    private toastr: ToastrService,
    private _CityService: CityService,
    private _CountryService: CountryService // Inject CountryService
  ) {
    this.loadCountries();
  }

  companyBranchForm: FormGroup = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    description: new FormControl(null, [Validators.required]),
    country_id: new FormControl(null),
    city_id: new FormControl(null, [Validators.required]),
    // $table->string('address_details');
    address_details: new FormControl(null),
  });

  loadCountries(): void {
    this._CountryService.viewAllcountries().subscribe({
      next: (response) => {
        this.countries = response.data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  onCountryChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.companyBranchForm.patchValue({ country_id: selectedValue });
    this.loadCities(selectedValue);
  }

  loadCities(countryId: string): void {
    this._CityService.viewAllcitiesByCountry(countryId).subscribe({
      next: (response) => {
        this.cities = response.data || [];
        // Reset city selection when country changes
        this.companyBranchForm.patchValue({ city_id: null });
      },
      error: (err) => {
        console.error(err);
        this.cities = [];
      }
    });
  }

  handleForm() {
    this.isSubmitted = true;
   
    if (this.companyBranchForm.valid) {
      this.isLoading = true;

      const formData = new FormData();
      formData.append('name', this.companyBranchForm.get('name')?.value);
      formData.append('description', this.companyBranchForm.get('description')?.value);
      formData.append('city_id', this.companyBranchForm.get('city_id')?.value);
      formData.append('address_details', this.companyBranchForm.get('address_details')?.value);

      this._CompanyBranchService.addCompanyBranch(formData).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.toastr.success('Company branch added successfully');
            this.isLoading = false;        
            this._Router.navigate(['/dashboard/comapnyBranches']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error('Error adding company branch');
          this.isLoading = false;
          this.msgError = err.error.error;
          console.log(err);
        }
      });
    }
  }
}