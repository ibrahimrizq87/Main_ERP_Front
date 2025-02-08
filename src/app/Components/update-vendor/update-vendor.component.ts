import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { GroupService } from '../../shared/services/group.service';
import { CityService } from '../../shared/services/city.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-update-vendor',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule ,TranslateModule],
  templateUrl: './update-vendor.component.html',
  styleUrl: './update-vendor.component.css'
})
export class UpdateVendorComponent implements OnInit{
  phoneNumbers: string[] = [''];
  vendorData: any = {
    user_name: '',
    arabic_name: '',
    english_name: '',
    currency: '',
    phoneNumbers: [],
    user_group: [],
    country: '',
    city: ''
  };
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
    private _UserService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,  
    private _GroupService: GroupService, 
    private _CityService: CityService,
   
  ) {
    this.userForm = this.fb.group({
      user_name: this.fb.control(null, [Validators.required]),
      arabic_name: this.fb.control(null, [Validators.required]),
      english_name: this.fb.control(null),
      currency: this.fb.control(null, [Validators.required]),
      phones: this.fb.array([this.fb.control('', [Validators.required])]),
      user_address: this.fb.group({
        address: this.fb.control(null, [Validators.required]),
        city_id: this.fb.control(null, [Validators.required])
      }),
      user_group: this.fb.control(this.selectedGroup),
      type: this.fb.control('delegate')
    });
  }
  ngOnInit(): void {
    const vendorId = this.route.snapshot.paramMap.get('id'); 
    if (vendorId) {
      this.fetchCityData(vendorId);
    }
    this.loadGroups();
    this.loadCities();
  }

  fetchCityData(vendorId: string): void {
    this._UserService.showVendorById(vendorId).subscribe({
      next: (response) => {
        if (response && response.data) {
          const vendor = response.data ; 
          // const userGroup = response.data.user.user_group;
          //  const userPhone = response.data.user.user_phone;
          // console.log(userGroup)
          console.log(vendor)
          this.userForm.patchValue({
            user_name: vendor.user.user_name||'',
            arabic_name:vendor.user.arabic_name || '',
            english_name:vendor.user.english_name || '',
            currency: vendor.user.currency || '',
            // groups: userGroup.map((group:any)=>group.name),
            // phones: userPhone.map((phone: any) => phone.phone),
            
          });
          // console.log(response)
          // const user = response.data.user;
         
          // const userPhone = response.data.user.user_phone;
         

          // this.vendorData = {
          //   userName: user.user_name || '',
          //   arabicName: user.arabic_name || '',
          //   englishName: user.english_name || '',
          //   currency: user.currency || '',
          //   phoneNumbers: userPhone.map((phone: any) => phone.phone),
          //   group: userGroup.map((group:any)=>group.name),
          //   country: 'Country', 
          //   city: 'City'       
          // };
        }
      },
      error: (err: HttpErrorResponse) => {
         console.log(err);
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

      formData.append('user_group[0][group_id]', this.userForm.get('user_group')?.value || '');
      formData.append('user_address[0][address]', this.userForm.get('user_address.address')?.value);
      formData.append('user_address[0][city_id]', this.userForm.get('user_address.city_id')?.value);
      const vendorId = this.route.snapshot.paramMap.get('id');
      if (vendorId) {
      this._UserService.updateVendor(vendorId,formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response) {
            this.router.navigate(['/dashboard/vendor']);
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

}
