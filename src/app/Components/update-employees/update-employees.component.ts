import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CountryService } from '../../shared/services/country.service';
import { EmployeeService } from '../../shared/services/employee.service';
import { CityService } from '../../shared/services/city.service';
import { CurrencyService } from '../../shared/services/currency.service';
import { AccountCategoriesService } from '../../shared/services/account_categories.service';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { Modal } from 'bootstrap';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CompanyBranchService } from '../../shared/services/company-branch.service';

@Component({
  selector: 'app-update-employees',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule],
  templateUrl: './update-employees.component.html',
  styleUrl: './update-employees.component.css'
})
export class UpdateEmployeesComponent {


  msgErrors: any[] = [];
  isLoading: boolean = false;
  type = 'employee';
  isSubmitted = false;
  selectedCategory: any;
  selectedCurrency: any;
  currencies: any;
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
    private route: ActivatedRoute,
    private _CompanyBranchService: CompanyBranchService
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
      // Handle new file upload
      this.selectedFile = file;
      
      // Create a preview URL for the new image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.employeeForm.patchValue({ image: e.target.result });
      };
      reader.readAsDataURL(file);
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

    const employeeID = this.route.snapshot.paramMap.get('id');
    if (employeeID) {
      this.fetchEmployeeId(employeeID);
    }
    this.loadCurrency();
    this.loadCategories();
    this.loadCountries();
    this.loadCompanyBranches();

  }
  fetchEmployeeId(employeeId: string): void {
    this._EmployeeService.showEmployeeById(employeeId).subscribe({
      next: (response) => {
        if (response && response.data) {
          console.log("Employee data:", response.data);
          
          // Patch basic form values
          this.employeeForm.patchValue({
            ar: response.data.account.name_lang.ar,
            en: response.data.account.name_lang.en,
            account_category_id: response.data.account_category.id,
            currency_id: response.data.currency_id,
            salary: response.data.salary,
            join_date: response.data.join_date,
            image: response.data.image,
            user_name: response.data.user_name,
            password: response.data.account.password,
            bonus_type: response.data.bonus_type,
            hourly_bonus_amount: response.data.hourly_bonus_amount,
            start_time: response.data.start_time,
            end_time: response.data.end_time,
            location_attendance_needed: response.data.location_attendance_needed,
            company_branch_id: response.data.company_branch_id
          });
  
          // Handle image
          if (response.data.image) {
            this.selectedFile = response.data.image;
          }
  
          // Clear existing addresses and phones
          while (this.addresses.length !== 0) {
            this.addresses.removeAt(0);
          }
          while (this.phones.length !== 0) {
            this.phones.removeAt(0);
          }
  
          // Add addresses from response
          if (response.data.addresses && response.data.addresses.length > 0) {
            response.data.addresses.forEach((address: any) => {
              const addressGroup = this.fb.group({
                address_name: [address.address_name, [Validators.required, Validators.maxLength(255)]],
                address_description: [address.address_description, [Validators.maxLength(500)]],
                city_id: [address.city.country.id, Validators.required],
                cities: [[]],
                country_id: [address.city?.country.id || '']
              });
              this.addresses.push(addressGroup);
              
              // Load cities for this address if country is available
              if (address.city?.country.id) {
                this.loadCities(address.city.country.id, this.addresses.length - 1);
              }
            });
          }
  
          // Add phones from response
          if (response.data.phones && response.data.phones.length > 0) {
            response.data.phones.forEach((phone: any) => {
              this.phones.push(this.fb.group({
                phone_name: [phone.phone_name, Validators.maxLength(255)],
                phone: [phone.phone, [Validators.required, Validators.maxLength(255)]]
              }));
            });
          }
  
          // Set vacation days
          if (response.data.vacation_days && response.data.vacation_days.length > 0) {
            response.data.vacation_days.forEach((day: string) => {
              this.vacationDays.push(this.fb.control(day));
            });
          }
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error("Error fetching employee:", err);
        this.toastr.error('Failed to load employee data');
      }
    });
  }

  isDaySelected(day: string): boolean {
    return this.vacationDays.value.includes(day);
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




      // 'addresses' => 'nullable|array',
      // 'addresses.*.address_description' => 'nullable|string|max:500',
      // 'addresses.*.address_name' => 'required|string|max:255',
      // 'addresses.*.city_id' =>  'required|exists:cities,id',



      // 'phones' => 'nullable|array',
      // 'phones.*.phone_name' => 'nullable|string|max:255',
      // 'phones.*.phone' => 'required|string|max:255',

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
      const employeeID = this.route.snapshot.paramMap.get('id');
      if (employeeID) {
        this._EmployeeService.updateEmployee(employeeID, formData).subscribe({
          next: (response) => {
            console.log(response);
            if (response) {
              this.toastr.success("تم تحديث العميل بنجاح");
              this.isLoading = false;
              this._Router.navigate(['/dashboard/employees']);
            }
          },
          error: (err: HttpErrorResponse) => {
            this.toastr.error('حدث خطا اثناء اضافه العميل');
            this.isLoading = false;
            this.msgErrors = err.error.errors;
            console.log(err);
          }
        });
      }
    } else {
      this.toastr.error('خطا في البيانات المدخله');
      // alert('invalid')
    }
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
  // loadCities(id: string, index: number): void {
  //   this._CityService.viewAllcitiesByCountry(id).subscribe({
  //     next: (response) => {
  //       if (response) {
  //         const addressControl = this.addresses.at(index) as FormGroup;
  //         addressControl.patchValue({ 
  //           cities: response.data,
  //           country_id: id 
  //         });
          
  //         // Try to preserve the existing city_id if it exists in the new cities list
  //         const currentCityId = addressControl.get('city_id')?.value;
  //         if (currentCityId && response.data.some((city: any) => city.country.id === currentCityId)) {
  //           addressControl.patchValue({ city_id: currentCityId });
  //         }
  //       }
  //     },
  //     error: (err) => {
  //       console.error(err);
  //     }
  //   });
  // }

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

  goBack() {
    this._Router.navigate(['/dashboard/employees']);
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