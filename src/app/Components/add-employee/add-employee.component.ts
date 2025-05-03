import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AccountCategoriesService } from '../../shared/services/account_categories.service';
import { CurrencyService } from '../../shared/services/currency.service';
import { PriceService } from '../../shared/services/price.service';
import { Modal } from 'bootstrap';
import { AccountService } from '../../shared/services/account.service';
import { ClientService } from '../../shared/services/client.service';
import { CityService } from '../../shared/services/city.service';
import { CountryService } from '../../shared/services/country.service';
import { DelegateService } from '../../shared/services/delegate.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [CommonModule , ReactiveFormsModule ,TranslateModule ,FormsModule],
  templateUrl: './add-employee.component.html',
  styleUrl: './add-employee.component.css'
})
export class AddEmployeeComponent {



  msgError: string = '';
  isLoading: boolean = false;
  type ='employee';
  isSubmitted = false;
  selectedCaegory :any;
  selectedCurrency:any;
  currencies:any;
  clientForm!: FormGroup;
  priceCategories:any;
  selectedPriceCaegory:any;
  countries: any[] = [];
  categories:any;
  filteredAccounts :Account []=[];


  addressFromData : AddressFromData[]=[];
  onCategoryChange(event:Event){
    this.selectedCaegory = (event.target as HTMLSelectElement).value;
  }


  onPriceCategoryChange(event:Event){
    this.selectedPriceCaegory = (event.target as HTMLSelectElement).value;
  }


  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.clientForm.patchValue({ image: file });
    }
  }


  // <select id="price_category_id" (change)="onPriceCategoryChange($event)" formControlName="price_category_id" class="form-control"
                        
  // [class.is-invalid]="!selectedCaegory && isSubmitted"

  // >
  //   <option *ngFor="let priceCategory of priceCategories" [value]="priceCategory.id">
  //     {{ priceCategory.name }}
  //   </option>
  // </select>
  // <div class="invalid-feedback" *ngIf="!selectedPriceCaegory && isSubmitted">
  constructor(private _AccountService:AccountService ,
        private _Router: Router,
        private translate: TranslateService,
        private _CountryService:CountryService,
        private _ClientService: ClientService,
        private  _CityService:CityService,
        private _PriceService: PriceService,
        private fb: FormBuilder,
        private _DelegateService: DelegateService,

        private _CurrencyService:CurrencyService,
        private _AccountCategoriesService:AccountCategoriesService,
        private toastr: ToastrService,
  ) {
    this.clientForm = this.fb.group({
      ar: ['', [Validators.required, Validators.maxLength(255)]],
      en: ['', [Validators.required, Validators.maxLength(255)]],

      salary: [Validators.required],
      join_date: [Validators.required],

      account_category_id: ['', Validators.required],
      image: [null], 
      currency_id: ['', Validators.required],

      addresses: this.fb.array([]),

      phones: this.fb.array([])
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
  selectedCity:any;
  get addresses(): FormArray {
    return this.clientForm.get('addresses') as FormArray;
  }
  onCityChange(event:Event){
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedCity =selectedValue;
  }
  get phones(): FormArray {
    return this.clientForm.get('phones') as FormArray;
  }

  addAddress(): void {


   
    this.addresses.push(this.fb.group({
      address_name: ['', [Validators.required, Validators.maxLength(255)]],
      address_description: ['', [Validators.maxLength(500)]],
      city_id: ['', Validators.required],
      cities:[[]],
      country_id:['']
    }));
  }




onCurrencyChange(event:Event){
  this.selectedCurrency = (event.target as HTMLSelectElement).value;
}
selecteddelegateAccount:Account | null= null;




  ngOnInit(): void {
   

    this.loadCurrency();
    this.loadCategories();
    this.loadPriceCategories();
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
  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.clientForm.patchValue({ image: file });
    }
  }


  loadCategories(): void {
    this._AccountCategoriesService.getAllAccountCategoryByType('client').subscribe({
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


  loadPriceCategories(): void {
    this._PriceService.viewAllCategory().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.priceCategories = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  // loadDelegates(): void {
  //   this._DelegateService.getAllDelegates().subscribe({
  //     next: (response) => {
  //       if (response) {
  //         this.delegates = response.data;
  //       }
  //     },
  //     error: (err) => {
  //       console.error(err);
  //     }
  //   });
  // }


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
   this.isSubmitted  = true;
    if (this.clientForm.valid) {
      this.isLoading = true;





      const formData = new FormData();
      formData.append('name[ar]', this.clientForm.get('ar')?.value);
      formData.append('name[en]', this.clientForm.get('en')?.value);
      formData.append('delegate_id', this.clientForm.get('delegate_id')?.value);
      formData.append('price_category_id', this.clientForm.get('price_category_id')?.value);
      if( this.clientForm.get('image')?.value){
        formData.append('image', this.clientForm.get('image')?.value);
      }
      formData.append('account_category_id', this.clientForm.get('account_category_id')?.value);
      formData.append('currency_id', this.clientForm.get('currency_id')?.value);


   this.addresses.controls.forEach((element,index) => {
        formData.append(`addresses[${index}][address_description]`, element.get('address_description')?.value ||'');
        formData.append(`addresses[${index}][address_name]`, element.get('address_name')?.value );
        formData.append(`addresses[${index}][city_id]`, element.get('city_id')?.value);
      });


      this.phones.controls.forEach((element,index) => {
        formData.append(`phones[${index}][phone_name]`, element.get('phone_name')?.value ||'');
        formData.append(`phones[${index}][phone]`, element.get('phone')?.value );
     
      });
      this._ClientService.addClient(formData).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.toastr.success('تم اضافه العميل بنجاح');
            this.isLoading = false;
            this._Router.navigate(['/dashboard/clients']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error('حدث خطا اثناء اضافه العميل');
          this.isLoading = false;
           this.msgError = err.error.error;
          console.log(err);
        }
      });
    }else{
      this.toastr.error('خطا في البيانات المدخله');
    }
  }



  selectedCountry: string = '';

  onCountryChange(event:Event ,index:number){
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedCountry =selectedValue;
    this.loadCities( this.selectedCountry ,index);
  }
  cities:City [] =[];

  loadCities(id:string ,index:number): void {
    this._CityService.viewAllcitiesByCountry(id).subscribe({
      next: (response) => {
        if (response) {
          const addressControl = this.addresses.at(index) as FormGroup;
          addressControl.patchValue({cities:response.data});
          addressControl.patchValue({country_id:id});

        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

 
          
      
}




interface Account {
  id: string;
  name: string;
}

interface City{
  id:string;
  name:string;
}



interface AddressFromData{
  selectedCity:City;
  cities:City [];

}