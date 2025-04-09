import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {  RouterModule, Router } from '@angular/router';
import { GroupService } from '../../shared/services/group.service';
import { CityService } from '../../shared/services/city.service';
import { UserService } from '../../shared/services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CurrencyService } from '../../shared/services/currency.service';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-customer',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './create-customer.component.html',
  styleUrl: './create-customer.component.css'
})
export class CreateCustomerComponent implements OnInit {
  Groups: any[] = [];
  countries: any[] = [];
  citiesByCountry: { [key: string]: any[] } = {};
  selectedCountry: string = '';
  selectedCity: string = '';
  selectedGroup: string = '';
  selectedVendor: string = '';
  msgError: string = '';
  currencies:any;
  isLoading: boolean = false;
  Vendors: any[] = [];
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,  
    private _GroupService: GroupService, 
    private router: Router, 
    private _CityService: CityService,
    private _UserService: UserService,
    private _CurrencyService:CurrencyService,
    private toastr: ToastrService
  ) {
    
    this.userForm = this.fb.group({
      arabic_name: this.fb.control(null, [Validators.required]),
      english_name: this.fb.control(null),
      currency: this.fb.control(null, [Validators.required]),
      phones: this.fb.array([this.fb.control('', [Validators.required])]),
      address: this.fb.group({
        address: this.fb.control(null, [Validators.required]),
        city_id: this.fb.control(null, [Validators.required])
      }),
      groups: this.fb.control(this.selectedGroup),
      user_id: this.fb.control(this.selectedVendor),
      type: this.fb.control('customer')
    });
  }

  ngOnInit(): void {
    this.loadGroups();
    this.loadCities();
    this.loadVendor();
    this.loadCurrency();
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

  loadGroups(): void {
    this._GroupService.viewallgroup().subscribe({
      next: (response) => {
        if (response) {
          this.Groups = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
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
  loadVendor(): void {
    this._UserService.viewAllVendor().subscribe({
      next:(response) => {
        if (response) {
          console.log(response.data)
          this.Vendors = response.data;
        }
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  get phones(): FormArray {
    return this.userForm.get('phones') as FormArray;
  }

  addPhoneNumber() {
    this.phones.push(this.fb.control('', [Validators.required]));
  }
  
  removePhoneNumber(index: number) {
    if (this.phones.length > 1) {
      this.phones.removeAt(index);
    }
  }

  handleForm() {
    if (this.userForm.valid) {
      this.isLoading = true;
      const formData = new FormData();

      formData.append('arabic_name', this.userForm.get('arabic_name')?.value);
      formData.append('english_name', this.userForm.get('english_name')?.value || '');
      formData.append('currency', this.userForm.get('currency')?.value);
      formData.append('type', 'customer'); 

      this.phones.value.forEach((phone: string, index: number) => {
        formData.append(`phones[${index}][phone]`, phone);
      });

      formData.append('groups[0][group_id]', this.userForm.get('groups')?.value || '');
      formData.append('address[0][address]', this.userForm.get('address.address')?.value);
      formData.append('address[0][city_id]', this.userForm.get('address.city_id')?.value);
      formData.append('user_id', this.userForm.get('user_id')?.value);

      this._UserService.createUser(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response) {
            this.toastr.success('تم اضافه العميل بنجاح');
            this.router.navigate(['/dashboard/customer']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error('حدث خطا اثناء اضافه العميل');
          this.isLoading = false;
          this.msgError = err.error.error;
        }
      });
    }
  }
}
