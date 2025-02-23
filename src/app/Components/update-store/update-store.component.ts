import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CityService } from '../../shared/services/city.service';
import { StoreService } from '../../shared/services/store.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CountryService } from '../../shared/services/country.service';

@Component({
  selector: 'app-update-store',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule ,TranslateModule],
  templateUrl: './update-store.component.html',
  styleUrl: './update-store.component.css'
})
export class UpdateStoreComponent implements OnInit {
  countries: any[] = [];
  cities: City [] = [];
  selectedCountry: string = '';
  selectedCity: string = '';
  selectedGroup: string = '';
  msgError: string = '';
  isLoading: boolean = false;
  isBranchSelected = false;
  parentAccounts: any[] = []; 
  hierarchicalAccounts: any[] = [];
  storeForm: FormGroup;;
    constructor(
    private fb: FormBuilder,
    private router: Router, 
    private _CityService: CityService,
    private _StoreService: StoreService,
    private route: ActivatedRoute,
    private _CountryService:CountryService
  ) {
    this.storeForm = new FormGroup({
      name_ar: this.fb.control(null, [Validators.required, Validators.maxLength(255)]),
      address: this.fb.control(null, [Validators.required]),
      city_id: this.fb.control(null, [Validators.required]),
      country_id: this.fb.control(null), 

      phone_number: this.fb.control(null, [Validators.required]),
      manager: this.fb.control(null, [Validators.required]),
      note: this.fb.control(null, [Validators.maxLength(255)]),
    });
  }
    ngOnInit(): void {
    const storeId = this.route.snapshot.paramMap.get('id'); 
    if (storeId) {
      this.fetchCityData(storeId);
    }
    this.loadGroups();
    this.loadCountries();
  }

  onCityChange(event:Event){
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedCity =selectedValue;
  }
  

  onCountryChange(event:Event){
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedCountry =selectedValue;
    this.loadCities( this.selectedCountry);
  }

  fetchCityData(storeId: string): void {
    this._StoreService.showStoreById(storeId).subscribe({
      next: (response) => {
        if (response) {
          const storeData = response.data ; 
          console.log(storeData)
          this.storeForm.patchValue({
            name_ar:storeData.name,
            address:storeData.address_description,
            city_id:storeData.city.id,
            country_id: storeData.city.country.id,
            phone_number:storeData.phone,
            manager:storeData.manager_name,
            note:storeData.note
          });
          this.loadCities( storeData.city.country.id);


        }
      },
      error: (err: HttpErrorResponse) => {
        this.msgError = err.error.error;
      }
    });
  }
  loadGroups(): void {
    this._StoreService.getAllStores().subscribe({
      next: (response) => {
        if (response) {
          console.log(response)
         
          this.parentAccounts = response.data;
         
          this.hierarchicalAccounts = this.buildAccountHierarchy(this.parentAccounts);
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  buildAccountHierarchy(accounts: any[]): any[] {
    return accounts.map(account => ({
      ...account,
      children: account.child ? this.buildAccountHierarchy(account.child) : []
    }));
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
  loadCities(country:string): void {
    this._CityService.viewAllcitiesByCountry(country).subscribe({
      next: (response) => {
        if (response) {
          this.cities = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

 
  
  handleForm() {
    if (this.storeForm.valid) {
      this.isLoading = true;
      const formData = new FormData();

      formData.append('name', this.storeForm.get('name_ar')?.value);
      formData.append('address_description', this.storeForm.get('address')?.value);
      formData.append('city_id', this.storeForm.get('city_id')?.value);

      formData.append('phone', this.storeForm.get('phone_number')?.value);
      formData.append('manager_name', this.storeForm.get('manager')?.value);
      formData.append('note', this.storeForm.get('note')?.value);
     
   
      const storeId = this.route.snapshot.paramMap.get('id');
      if (storeId){
      this._StoreService.updateStore(storeId,formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response) {
            this.router.navigate(['/dashboard/stores']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.msgError = err.error.error;
        }
      });
    }
  }}
  onCancel(): void {
        this.storeForm.reset();
       
        this.router.navigate(['/dashboard/stores']); 
      }  
}


interface City{
  id:string;
  name:string;
}