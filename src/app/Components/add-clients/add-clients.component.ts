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
  selector: 'app-add-clients',
  standalone: true,
  imports: [CommonModule , ReactiveFormsModule ,TranslateModule ,FormsModule],
  templateUrl: './add-clients.component.html',
  styleUrl: './add-clients.component.css'
})
export class AddClientsComponent {


  msgError: string = '';
  isLoading: boolean = false;
  type ='client';
  isSubmitted = false;
  selectedCaegory :any;
  selectedCurrency:any;
  currencies:any;
  clientForm!: FormGroup;
  priceCategories:any;
  selectedPriceCaegory:any;
  delegates:Account [] =[];
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
      user_name: ['', [Validators.required, Validators.maxLength(255)]],
      password: ['', [Validators.required]],
      delegate_id: ['', Validators.required],
      price_category_id: [''],
      account_category_id: ['', Validators.required],
      payment_type: ['cash', Validators.required],
      has_max_sales: [false],
      max_sales_amount: [''],
      bill_no: [''],
      max_payment_day: [''],
      payment_day: [''],
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
  // Getter for phones
  get phones(): FormArray {
    return this.clientForm.get('phones') as FormArray;
  }

  // Add new address
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

removeCurrentDelegate(){
  this.selecteddelegateAccount =null;
 this.clientForm.patchValue({'delegate_id':null});
}



  ngOnInit(): void {
   

    this.loadCurrency();
    this.loadCategories();
    this.loadPriceCategories();
    this.loadDelegates();
    this.loadCountries();

  }

  removeAddress(index: number): void {
    this.addresses.removeAt(index);
  }

  addPhone(): void {
    this.phones.push(this.fb.group({
      phone_name: ['', Validators.maxLength(255)],
      phone: ['', [Validators.required, Validators.maxLength(255)]]
    }));
  }

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
  let isValid = true;
  let errorMessage = '';
  if(this.clientForm.get('payment_type')?.value != 'cash'){

  if(this.clientForm.get('has_max_sales')?.value && !this.clientForm.get('max_sales_amount')?.value){
    isValid =false;
  }

  if(this.clientForm.get('payment_type')?.value == 'mounthly'){
    if(!this.clientForm.get('payment_day')?.value){
      isValid =false;
  } 
    
  }else if(this.clientForm.get('payment_type')?.value == 'bill_no'){
    if(!this.clientForm.get('bill_no')?.value || !this.clientForm.get('max_payment_day')?.value ){
      isValid =false;
  }

  }else{
    isValid =false;
  }
  }
   
    if (this.clientForm.valid && isValid) {
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


    formData.append(`payment_type`,this.clientForm.get('payment_type')?.value);

    if(this.clientForm.get('payment_type')?.value == 'mounthly'){
    formData.append(`payment_day`,this.clientForm.get('payment_day')?.value);
    }else if(this.clientForm.get('payment_type')?.value == 'bill_no'){
    formData.append(`bill_number`,this.clientForm.get('bill_no')?.value);
    formData.append(`bill_limit_day_number`,this.clientForm.get('max_payment_day')?.value);
      
  }
    if(this.clientForm.get('payment_type')?.value != 'cash'){
          if(this.clientForm.get('has_max_sales')?.value){
            formData.append(`has_sales_limit`,'1');
            formData.append(`max_sales`,this.clientForm.get('max_sales_amount')?.value);
          }else{
          formData.append(`has_sales_limit`,'0');
          }

    }


        formData.append(`user_name`, this.clientForm.get('user_name')?.value);
        formData.append(`password`, this.clientForm.get('password')?.value );

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
      // alert('invalid')
    }
  }


  loadDelegates() {
    
    this._DelegateService.getAllDelegates(
      this.searchQuery
    ).subscribe({
      next: (response) => {
        if (response) {
          this.delegates = response.data.delegates;
          // this.filteredAccounts = this.delegates ;
          console.log('delegeates' , this.delegates);
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
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

        openModal(modalId: string) {
      
          const modalElement = document.getElementById(modalId);
          if (modalElement) {
            const modal = new Modal(modalElement);
            modal.show();
          }
        }


          
            selectAccount(account:Account){
            
              this.clientForm.patchValue({delegate_id:account.id});
               this.selecteddelegateAccount = account;
              this.closeModal('shiftModal');
        
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
  
    
             this.loadDelegates();
            
              
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