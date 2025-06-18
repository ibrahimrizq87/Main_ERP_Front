import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AccountCategoriesService } from '../../shared/services/account_categories.service';
import { CurrencyService } from '../../shared/services/currency.service';
import { Modal } from 'bootstrap';
import { CityService } from '../../shared/services/city.service';
import { CountryService } from '../../shared/services/country.service';
import { ToastrService } from 'ngx-toastr';
import { EmployeeService } from '../../shared/services/employee.service';
import { CompanyBranchService } from '../../shared/services/company-branch.service';
import { AccountService } from '../../shared/services/account.service';


@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, FormsModule],
  templateUrl: './add-employee.component.html',
  styleUrl: './add-employee.component.css'
})
export class AddEmployeeComponent {


  msgErrors: any[] = [];
  isLoading: boolean = false;
  type = 'employee';
  isSubmitted = false;
  selectedCategory: any;
  selectedCurrency: any;
  currencies: any;
  accounts: Account[] = [];
  employeeForm!: FormGroup;
  countries: any[] = [];
  categories: any;
  filteredAccounts: Account[] = [];
  companyBranches: any[] = [];
  readonly maxImageSize = 2048 * 1024;
  addressFromData: AddressFromData[] = [];
  onCategoryChange(event: Event) {
    this.selectedCategory = (event.target as HTMLSelectElement).value;
  }
  constructor(
    private _Router: Router,
    private _CountryService: CountryService,
    private _EmployeeService: EmployeeService,
    private _CityService: CityService,
    private fb: FormBuilder,
    private _CurrencyService: CurrencyService,
    private _AccountCategoriesService: AccountCategoriesService,
    private toastr: ToastrService,
    private _CompanyBranchService: CompanyBranchService,
    private _AccountService: AccountService
  ) {
    this.employeeForm = this.fb.group({

      ar: ['', [Validators.required, Validators.maxLength(255)]],
      en: ['', [Validators.required, Validators.maxLength(255)]],
      account_category_id: ['', Validators.required],
      currency_id: ['', Validators.required],
      addresses: this.fb.array([]),
      phones: this.fb.array([]),
      salary: ['', [Validators.required, Validators.min(1)]],
      join_date: ['', Validators.required],
      image: [null, this.validateImage.bind(this)],
      bonus_type: ['', Validators.required],
      hourly_bonus_amount: [''],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      location_attendance_needed: [false],
      company_branch_id: [''],
      vacation_days: this.fb.array([]),
      user_name: ['', [Validators.required, Validators.maxLength(255)]],
      password: ['', [Validators.required]],


    });
  }
  get vacationDays(): FormArray {
    return this.employeeForm.get('vacation_days') as FormArray;
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
  selectedFile: File | null = null;

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.employeeForm.patchValue({ image: file });
    }
  }
  validateImage(control: AbstractControl): ValidationErrors | null {
    const file = this.selectedFile;
    if (file) {
      const fileType = file.type;
      const fileSize = file.size;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(fileType)) {
        return { invalidFileType: true };
      }
      if (fileSize > this.maxImageSize) {
        return { fileTooLarge: true };
      }
    }
    return null;
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
  selectedCity: any;
  get addresses(): FormArray {
    return this.employeeForm.get('addresses') as FormArray;
  }
  onCityChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedCity = selectedValue;
  }
  // Getter for phones
  get phones(): FormArray {
    return this.employeeForm.get('phones') as FormArray;
  }

  // Add new address
  addAddress(): void {



    this.addresses.push(this.fb.group({
      address_name: ['', [Validators.required, Validators.maxLength(255)]],
      address_description: ['', [Validators.maxLength(500)]],
      city_id: ['', Validators.required],
      cities: [[]],
      country_id: ['']
    }));
  }




  onCurrencyChange(event: Event) {
    this.selectedCurrency = (event.target as HTMLSelectElement).value;
  }




  ngOnInit(): void {
    this.loadCurrency();
    this.loadCategories();
    this.loadCompanyBranches();
    this.loadAccounts();
    this.loadCountries();
  }

  // Remove address
  removeAddress(index: number): void {
    this.addresses.removeAt(index);
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



  loadCategories(): void {
    this._AccountCategoriesService.getAllAccountCategoryByType('employee').subscribe({
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




  handleForm() {
    this.isSubmitted = true;
    if (this.employeeForm.valid) {
      this.isLoading = true;
      const formData = new FormData();
      formData.append('name[ar]', this.employeeForm.get('ar')?.value);
      formData.append('name[en]', this.employeeForm.get('en')?.value);
      formData.append('account_category_id', this.employeeForm.get('account_category_id')?.value);
      formData.append('currency_id', this.employeeForm.get('currency_id')?.value);
      formData.append('salary', this.employeeForm.get('salary')?.value);
      formData.append('join_date', this.employeeForm.get('join_date')?.value);
      this.addresses.controls.forEach((element, index) => {
        formData.append(`addresses[${index}][address_description]`, element.get('address_description')?.value || '');
        formData.append(`addresses[${index}][address_name]`, element.get('address_name')?.value);
        formData.append(`addresses[${index}][city_id]`, element.get('city_id')?.value);
      });
      console.log(this.selectedFile)
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }
      this.phones.controls.forEach((element, index) => {
        formData.append(`phones[${index}][phone_name]`, element.get('phone_name')?.value || '');
        formData.append(`phones[${index}][phone]`, element.get('phone')?.value);

      });
      formData.append('bonus_type', this.employeeForm.get('bonus_type')?.value);
      formData.append('hourly_bonus_amount', this.employeeForm.get('hourly_bonus_amount')?.value || '');

      formData.append('start_time', this.employeeForm.get('start_time')?.value);
      formData.append('end_time', this.employeeForm.get('end_time')?.value);

      const locationAttendanceValue = this.employeeForm.get('location_attendance_needed')?.value ? 1 : 0;
      formData.append('location_attendance_needed', locationAttendanceValue.toString());
      console.log(this.employeeForm.get('location_attendance_needed')?.value);
      formData.append('company_branch_id', this.employeeForm.get('company_branch_id')?.value || '');
      formData.append('user_name', this.employeeForm.get('user_name')?.value);
      formData.append('password', this.employeeForm.get('password')?.value);
      const selectedVacationDays = this.vacationDays.value;
      if (selectedVacationDays && selectedVacationDays.length > 0) {
        selectedVacationDays.forEach((day: string) => {
          formData.append('vacation_days[]', day);
        });
      }
      this._EmployeeService.addEmployee(formData).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.toastr.success('تم اضافه العميل بنجاح');
            this.isLoading = false;
            this._Router.navigate(['/dashboard/employees']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error('حدث خطا اثناء اضافه العميل');
          this.isLoading = false;
          this.msgErrors = err.error.errors;
          // console.log(err.error)
          // console.log(err);
          console.log(err.error.errors);
        }
      });
    } else {
      this.toastr.error('خطا في البيانات المدخله');
      // alert('invalid')
    }
  }



  selectedCountry: string = '';

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


    loadAccounts() {
    this._AccountService.getAccountsByParent('111').subscribe({
        next: (response) => {
        if (response) {
          console.log(response);
          this.accounts = response.data;

        }
      },
      error: (err) => {
        console.error(err);
      }
    
    });
  }
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

  openModal(modalId: string) {

    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }






  closeModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }
  searchQuery: string = '';



  onSearchChange(){

}


selectedAcount:any;


onSearchChanged(event: String) {
  console.log(event);
}

selectAccount(account: any) {
  this.selectedAcount = account;
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