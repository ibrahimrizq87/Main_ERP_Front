import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { GroupService } from '../../shared/services/group.service';
import { Router } from '@angular/router';
import { CityService } from '../../shared/services/city.service';
import { StoreService } from '../../shared/services/store.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AccountService } from '../../shared/services/account.service';
import { TranslateModule } from '@ngx-translate/core';
import { CountryService } from '../../shared/services/country.service';

interface Account {
  id: string;
  name_ar: string;
  name_en?: string;
  parent_id?: string;
  child?: Account[];
}
@Component({
  selector: 'app-add-store',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormsModule,TranslateModule],
  templateUrl: './add-store.component.html',
  styleUrl: './add-store.component.css'
})
export class AddStoreComponent implements OnInit {
  
  countries: any[] = [];
  cities: City [] = [];
  selectedCountry: string = '';
  selectedCity: string = '';
  selectedGroup: string = '';
  msgError: string = '';
  isLoading: boolean = false;
  isBranchSelected = false;
  parentAccounts: Account[] = []; 
  hierarchicalAccounts: any[] = [];
  storeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private _AccountService: AccountService, 
    private router: Router, 
    private _CityService: CityService,
    private _StoreService: StoreService,
    private _CountryService:CountryService
  ) {
    
    this.storeForm = this.fb.group({
      name_ar: this.fb.control(null, [Validators.required,Validators.maxLength(255)]),
      // address: this.fb.group({
        address: this.fb.control(null, [Validators.required]),
        city_id: this.fb.control(null, [Validators.required]),
      // }),
  
      phone_number: this.fb.control(null, [Validators.required]),
      manager:this.fb.control(null,[Validators.required,Validators.maxLength(255)]),
      note:this.fb.control(null,[Validators.maxLength(255)]),
    });
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


  ngOnInit(): void {
    this.loadGroups();
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
    loadGroups(): void {
    this._StoreService.getAllStores().subscribe({
      next: (response) => {
        if (response) {
          console.log(response)
         
          this.parentAccounts = response.data;
         
          // this.hierarchicalAccounts = this.buildAccountHierarchy(this.parentAccounts);
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }


  // buildAccountHierarchy(accounts: Account[]): any[] {
  //   return accounts.map(account => ({
  //     ...account,
  //     children: account.child ? this.buildAccountHierarchy(account.child) : []
  //   }));
  // }

  
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
    if (this.storeForm.valid && this.selectedCity) {
      this.isLoading = true;
      const formData = new FormData();
      // 'name' => 'required|string|max:255',
      // 'manager_name' => 'required|string|max:255',
      // 'phone' => 'required|string|max:20',
      // 'address_description' => 'required|string',
      // 'city_id' => 'required|exists:cities,id',
      formData.append('name', this.storeForm.get('name_ar')?.value);
      formData.append('address_description', this.storeForm.get('address')?.value);
      formData.append('city_id', this.storeForm.get('city_id')?.value);

      formData.append('phone', this.storeForm.get('phone_number')?.value);
      formData.append('manager_name', this.storeForm.get('manager')?.value);
      formData.append('note', this.storeForm.get('note')?.value);
      if (this.isBranchSelected) {
        formData.append('store_id', this.storeForm.get('store_id')?.value);
      }
      this._StoreService.addStore(formData).subscribe({
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
  }
}
interface City{
  id:string;
  name:string;
}