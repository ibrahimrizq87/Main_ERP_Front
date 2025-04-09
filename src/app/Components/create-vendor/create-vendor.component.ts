import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormArray, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CityService } from '../../shared/services/city.service';
import { UserService } from '../../shared/services/user.service';
import { GroupService } from '../../shared/services/group.service';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-vendor',
  standalone: true,
  imports: [ RouterModule,CommonModule,ReactiveFormsModule,FormsModule ,TranslateModule],
  templateUrl: './create-vendor.component.html',
  styleUrls: ['./create-vendor.component.css']
})
export class CreateVendorComponent implements OnInit {
  Groups: any[] = [];
  countries: any[] = [];
  citiesByCountry: { [key: string]: any[] } = {};
  selectedCountry: string = '';
  selectedCity: string = '';
  selectedGroup: string = '';
  msgError: string = '';
  isLoading: boolean = false;

  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,  // Inject FormBuilder
    private _GroupService: GroupService, 
    private router: Router, 
    private _CityService: CityService,
    private _UserService: UserService,
    private toastr: ToastrService
  ) {
    // Initialize the userForm with FormBuilder
    this.userForm = this.fb.group({
      user_name: this.fb.control(null, [Validators.required]),
      arabic_name: this.fb.control(null, [Validators.required]),
      english_name: this.fb.control(null),
      currency: this.fb.control(null, [Validators.required]),
      phones: this.fb.array([this.fb.control('', [Validators.required])]),
      address: this.fb.group({
        address: this.fb.control(null, [Validators.required]),
        city_id: this.fb.control(null, [Validators.required])
      }),
      groups: this.fb.control(this.selectedGroup),
      type: this.fb.control('delegate')
    });
  }

  ngOnInit(): void {
    this.loadGroups();
    this.loadCities();
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

      formData.append('user_name', this.userForm.get('user_name')?.value);
      formData.append('arabic_name', this.userForm.get('arabic_name')?.value);
      formData.append('english_name', this.userForm.get('english_name')?.value || '');
      formData.append('currency', this.userForm.get('currency')?.value);
      formData.append('type', 'delegate'); 

      this.phones.value.forEach((phone: string, index: number) => {
        formData.append(`phones[${index}][phone]`, phone);
      });

      formData.append('groups[0][group_id]', this.userForm.get('groups')?.value || '');
      formData.append('address[0][address]', this.userForm.get('address.address')?.value);
      formData.append('address[0][city_id]', this.userForm.get('address.city_id')?.value);

      this._UserService.createUser(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response) {
            this.toastr.success('تم اضافه المورد بنجاح');
            this.router.navigate(['/dashboard/vendor']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error('حدث خطا اثناء اضافه المورد');
          this.isLoading = false;
          this.msgError = err.error.error;
        }
      });
    }
  }
}
