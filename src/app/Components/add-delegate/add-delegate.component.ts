import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AccountCategoriesService } from '../../shared/services/account_categories.service';
import { DelegateService } from '../../shared/services/delegate.service';
import { CurrencyService } from '../../shared/services/currency.service';
import { ToastrService } from 'ngx-toastr';
import { CompanyBranchService } from '../../shared/services/company-branch.service';
import { CityService } from '../../shared/services/city.service';
import { CountryService } from '../../shared/services/country.service';

@Component({
  selector: 'app-add-delegate',
  standalone: true,
  imports: [CommonModule , ReactiveFormsModule ,TranslateModule],
  templateUrl: './add-delegate.component.html',
  styleUrl: './add-delegate.component.css'
})
export class AddDelegateComponent {
  msgError: string = '';
  isLoading: boolean = false;
  type ='client';
  isSubmitted = false;
  selectedCaegory :any;
  selectedCurrency:any;
  delegateForm!: FormGroup;
  currencies:any;
  categories:any;
  companyBranches: any[] = [];
  addressFromData: AddressFromData[] = [];
  countries: any[] = [];
  msgErrors:any[]=[];
  

  onCategoryChange(event:Event){
    this.selectedCaegory = (event.target as HTMLSelectElement).value;
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.delegateForm.patchValue({ image: file });
    }
  }
  constructor(private _DelegateService:DelegateService ,
        private _Router: Router,
        private translate: TranslateService,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private _CurrencyService:CurrencyService,
        private _AccountCategoriesService:AccountCategoriesService,
        private toastr: ToastrService,
        private _CompanyBranchService: CompanyBranchService,
        private _CityService: CityService,
        private _CountryService: CountryService,
  ) {

  }




onCurrencyChange(event:Event){
  this.selectedCurrency = (event.target as HTMLSelectElement).value;
}


  ngOnInit(): void {
    this.delegateForm = this.fb.group({
      nameAr: ['', [Validators.required, Validators.maxLength(255)]],
      nameEn: ['', [Validators.required, Validators.maxLength(255)]],
      
      image: [null], // File Upload
      account_category_id: ['', Validators.required],
      currency_id: ['', Validators.required],
      user_name: ['', [Validators.required, Validators.maxLength(255)]],
      password: ['', [Validators.required]],
      salary: ['', [Validators.required, Validators.min(1)]],
      join_date: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      location_attendance_needed: [false],
      company_branch_id: [''],
      phones: this.fb.array([]),
      addresses: this.fb.array([]),
      vacation_days: this.fb.array([]),
    });

    this.loadCurrency();
    this.loadCategories();
    this.loadCompanyBranches();
    this.loadCountries();

  }
  get vacationDays(): FormArray {
    return this.delegateForm.get('vacation_days') as FormArray;
  }
// Update the method signature to use the correct event type
onVacationDayChange(day: string, event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target) return;
  
  const isChecked = target.checked;
  const vacationDaysArray = this.vacationDays;
  
  if (isChecked) {
    vacationDaysArray.push(this.fb.control(day));
  } else {
    const index = vacationDaysArray.controls.findIndex(x => x.value === day);
    if (index >= 0) {
      vacationDaysArray.removeAt(index);
    }
  }
}
  get phones(): FormArray {
    return this.delegateForm.get('phones') as FormArray;
  }
   // Add new phone
   addPhone(): void {
    this.phones.push(this.fb.group({
      phone_name: ['', Validators.maxLength(255)],
      phone: ['', [Validators.required, Validators.maxLength(255)]]
    }));
  }
  // Remove phone
  removePhone(index: number): void {
    this.phones.removeAt(index);
  }
  selectedCity: any;
  get addresses(): FormArray {
    return this.delegateForm.get('addresses') as FormArray;
  }
  onCityChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedCity = selectedValue;
  }


  addAddress(): void {
    this.addresses.push(this.fb.group({
      address_name: ['', [Validators.required, Validators.maxLength(255)]],
      address_description: ['', [Validators.maxLength(500)]],
      city_id: ['', Validators.required],
      cities: [[]],
      country_id: ['']
    }));
  }
    // Remove address
    removeAddress(index: number): void {
      this.addresses.removeAt(index);
    }
  loadCompanyBranches(): void {
    this._CompanyBranchService.viewallCompanyBranch().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.companyBranches = response.data;

        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  loadCategories(): void {
    this._AccountCategoriesService.getAllAccountCategoryByType('delegate').subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.categories = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }


  loadCurrency(): void {
    this._CurrencyService.viewAllCurrency().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.currencies = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
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
  selectedCountry: string = '';
  onCountryChange(event: Event, index: number) {

    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedCountry = selectedValue;
    this.loadCities(this.selectedCountry, index);


  }
  cities: City[] = [];

  loadCities(id: string, index: number): void {

    console.log('id', id);
    console.log('index', index);

    this._CityService.viewAllcitiesByCountry(id).subscribe({
      next: (response) => {
        if (response) {
          const addressControl = this.addresses.at(index) as FormGroup;
          addressControl.patchValue({ cities: response.data });
          addressControl.patchValue({ country_id: id });

        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }


  handleForm() {
   this.isSubmitted  = true;
    if (this.delegateForm.valid) {
      this.isLoading = true;

      const formData = new FormData();
      formData.append('name[ar]', this.delegateForm.get('nameAr')?.value);
      formData.append('name[en]', this.delegateForm.get('nameEn')?.value);


      this.phones.controls.forEach((element, index) => {
        formData.append(`phones[${index}][phone_name]`, element.get('phone_name')?.value || '');
        formData.append(`phones[${index}][phone]`, element.get('phone')?.value);

      });
      if( this.delegateForm.get('image')?.value){
        formData.append('image', this.delegateForm.get('image')?.value);

      }
      formData.append('account_category_id', this.delegateForm.get('account_category_id')?.value);
      formData.append('currency_id', this.delegateForm.get('currency_id')?.value);
      formData.append('user_name', this.delegateForm.get('user_name')?.value);
      formData.append('password', this.delegateForm.get('password')?.value);
      formData.append('salary', this.delegateForm.get('salary')?.value);
      formData.append('join_date', this.delegateForm.get('join_date')?.value);
      formData.append('start_time', this.delegateForm.get('start_time')?.value);
      formData.append('end_time', this.delegateForm.get('end_time')?.value);

      const locationAttendanceValue = this.delegateForm.get('location_attendance_needed')?.value ? 1 : 0;
      formData.append('location_attendance_needed', locationAttendanceValue.toString());
      formData.append('company_branch_id', this.delegateForm.get('company_branch_id')?.value || '');
      
      this.addresses.controls.forEach((element, index) => {
        formData.append(`addresses[${index}][address_description]`, element.get('address_description')?.value || '');
        formData.append(`addresses[${index}][address_name]`, element.get('address_name')?.value);
        formData.append(`addresses[${index}][city_id]`, element.get('city_id')?.value);
      });
      const selectedVacationDays = this.vacationDays.value;
      if (selectedVacationDays && selectedVacationDays.length > 0) {
        selectedVacationDays.forEach((day: string) => {
          formData.append('vacation_days[]', day);
        });
      }
      this._DelegateService.addDelegate(formData).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.toastr.success('تم اضافه المندوب بنجاح');
            this.isLoading = false;
            this._Router.navigate(['/dashboard/delegates']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error('حدث خطا اثناء اضافه العميل');
          this.isLoading = false;
          this.msgErrors = err.error.errors;
          // console.log(err.error)
          // console.log(err);
          console.log(err.error.errors);;
        }
      });
    }
  }
}
interface Account {
  id: string;
  name: string;
}

interface City {
  id: string;
  name: string;
}



interface AddressFromData {
  selectedCity: City;
  cities: City[];

}