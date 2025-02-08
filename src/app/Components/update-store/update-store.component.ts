import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CityService } from '../../shared/services/city.service';
import { StoreService } from '../../shared/services/store.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-update-store',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule ,TranslateModule],
  templateUrl: './update-store.component.html',
  styleUrl: './update-store.component.css'
})
export class UpdateStoreComponent implements OnInit {
  countries: any[] = [];
  citiesByCountry: { [key: string]: any[] } = {};
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
    private route: ActivatedRoute
  ) {
    this.storeForm = new FormGroup({
      name_ar: this.fb.control(null, [Validators.required, Validators.maxLength(255)]),
      address: this.fb.control(null, [Validators.required]),
      city_id: this.fb.control(null, [Validators.required]),
      type: this.fb.control(null, [Validators.required]),
      store_id: this.fb.control(null), 
      name_en: this.fb.control(null, [Validators.maxLength(255)]),
      phone_number: this.fb.control(null, [Validators.pattern(/^[0-9]{7,19}$/)]),
      manager: this.fb.control(null, [Validators.maxLength(255)]),
      note: this.fb.control(null, [Validators.maxLength(255)]),
    });
  }
    ngOnInit(): void {
    const storeId = this.route.snapshot.paramMap.get('id'); 
    if (storeId) {
      this.fetchCityData(storeId);
    }
    this.loadGroups();
    this.loadCities();
  }
  fetchCityData(storeId: string): void {
    this._StoreService.showStoreById(storeId).subscribe({
      next: (response) => {
        if (response) {
          const storeData = response.data ; 
          console.log(storeData)
          this.storeForm.patchValue({
            name_ar:storeData.name_ar,
            address:storeData.address,
            city_id:storeData.city_id,
            type:storeData.type,
            store_id:storeData.store_id,
            name_en:storeData.name_en,
            phone_number:storeData.phone_number,
            manager:storeData.manager,
            note:storeData.note
          });
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
  onTypeChange(event: any) {
    const selectedType = event.target.value;
    this.isBranchSelected = selectedType === 'branch';

    if (this.isBranchSelected) {
      this.storeForm.get('store_id')?.setValidators([Validators.required]);
      // console.log(this.storeForm.get('store_id')?.value)
    } else {
      this.storeForm.get('store_id')?.clearValidators();
      this.storeForm.get('store_id')?.setValue(null);
    }
    this.storeForm.get('store_id')?.updateValueAndValidity();
  }
  loadCities(): void {
    this._CityService.viewAllCities().subscribe({
      next: (response) => {
        if (response) {
          this.citiesByCountry = {};
          response.data.forEach((city: any) => {
            if (!this.citiesByCountry[city.country]) {
              this.citiesByCountry[city.country] = [];
            }
            this.citiesByCountry[city.country].push(city);
          });
          this.countries = Object.keys(this.citiesByCountry);
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

      formData.append('name_ar', this.storeForm.get('name_ar')?.value);
      formData.append('address', this.storeForm.get('address')?.value);
      formData.append('city_id', this.storeForm.get('city_id')?.value);
      formData.append('type', this.storeForm.get('type')?.value);
      formData.append('name_en', this.storeForm.get('name_en')?.value);
      formData.append('phone_number', this.storeForm.get('phone_number')?.value);
      formData.append('manager', this.storeForm.get('manager')?.value);
      formData.append('note', this.storeForm.get('note')?.value);
     
      if (this.isBranchSelected) {
        formData.append('store_id', this.storeForm.get('store_id')?.value);
      }
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

