import { Component } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CityService } from '../../shared/services/city.service';
import { CountryService } from '../../shared/services/country.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  msgSuccess = '';
  msgErrors: string[] = [];
  isLoading: boolean = false;
  addressFromData: AddressFromData[] = [];
  countries: any[] = [];
  selectedCountry: string = '';
  cities: City[] = [];
  readonly maxImageSize = 2048 * 1024;
  isSubmitted = false;
  selectedFile: File | null = null;
  registerForm: FormGroup;
  selectedCity: string | undefined;

  constructor(
    private _AuthService: AuthService,
    private _Router: Router,
    private _CountryService: CountryService,
    private _CityService: CityService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      name_ar: ['', [Validators.required, Validators.maxLength(255)]],
      name_en: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(255)]],
      password_confirmation: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(255)]],
      image: [null, [this.validateImage.bind(this)]],
      addresses: this.fb.array([]),
      phones: this.fb.array([])
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.registerForm.patchValue({ image: file });
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

  // Getter for addresses
  get addresses(): FormArray {
    return this.registerForm.get('addresses') as FormArray;
  }

  // Getter for phones
  get phones(): FormArray {
    return this.registerForm.get('phones') as FormArray;
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

  ngOnInit(): void {
    this.loadCountries();
  }

  loadCountries(): void {
    this._CountryService.viewAllcountries().subscribe({
      next: (response) => {
        if (response) {
          this.countries = response.data;
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

  loadCities(id: string, index: number): void {
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
    this.isSubmitted = true;
    if (this.registerForm.valid) {
      this.isLoading = true;

      const formData = new FormData();
      formData.append('user_name', this.registerForm.get('name')?.value);
      // "key": "name[ar]",
      formData.append('name[ar]', this.registerForm.get('name_ar')?.value);
      formData.append('name[en]', this.registerForm.get('name_en')?.value);
      formData.append('email', this.registerForm.get('email')?.value);
      formData.append('password', this.registerForm.get('password')?.value);
      formData.append('password_confirmation', this.registerForm.get('password_confirmation')?.value);

      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      // Add addresses to formData
      this.addresses.controls.forEach((element, index) => {
        formData.append(`addresses[${index}][address_description]`, element.get('address_description')?.value || '');
        formData.append(`addresses[${index}][address_name]`, element.get('address_name')?.value);
        formData.append(`addresses[${index}][city_id]`, element.get('city_id')?.value);
      });

      // Add phones to formData
      this.phones.controls.forEach((element, index) => {
        formData.append(`phones[${index}][phone_name]`, element.get('phone_name')?.value || '');
        formData.append(`phones[${index}][phone]`, element.get('phone')?.value);
      });

      this._AuthService.setRegister(formData).subscribe({
        next: (response) => {
          if (response) {
            this.isLoading = false;
            this.toastr.success(response.message);
            setTimeout(() => {
              this._Router.navigate(['/login']);
            }, 2000);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.toastr.error('Error during registration');
          this.msgErrors = err.error;
          console.log(err.error);
        }
      });
    } else {
      this.toastr.error('Invalid form data');
    }
  }
  onCityChange(event:Event){
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedCity =selectedValue;
  }
}

interface City {
  id: string;
  name: string;
}

interface AddressFromData {
  selectedCity: City;
  cities: City[];
}