import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AccountCategoriesService } from '../../shared/services/account_categories.service';
import { DelegateService } from '../../shared/services/delegate.service';
import { CurrencyService } from '../../shared/services/currency.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-update-delegate',
  standalone: true,
  imports: [CommonModule , ReactiveFormsModule ,TranslateModule],
  templateUrl: './update-delegate.component.html',
  styleUrl: './update-delegate.component.css'
})
export class UpdateDelegateComponent {

  
currentImage:any;
    msgError: string = '';
    isLoading: boolean = false;
    type ='client';
    isSubmitted = false;
    selectedCaegory :any;
    selectedCurrency:any;
    delegateForm!: FormGroup;
    currencies:any;
  
  
    categories:any;
  
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
          private toastr: ToastrService
    ) {
      this.delegateForm = this.fb.group({
        nameAr: ['', [Validators.required, Validators.maxLength(255)]],
        nameEn: ['', [Validators.required, Validators.maxLength(255)]],
        phone_number_1: ['', [Validators.required, Validators.maxLength(255)]],
        phone_number_2: ['', [Validators.maxLength(255)]],
        image: [null], // File Upload
        account_category_id: ['', Validators.required],
        currency_id: ['', Validators.required]
  
      });
    }
  
  
  
  
  onCurrencyChange(event:Event){
    this.selectedCurrency = (event.target as HTMLSelectElement).value;
  }
  
  
    ngOnInit(): void {

      const groupId = this.route.snapshot.paramMap.get('id'); 
      if (groupId) {
        this.loadDelegate(groupId);
      }


      this.loadCurrency();
      this.loadCategories();

  
    }

    loadDelegate(id:string){

      this._DelegateService.showDelegateById(id).subscribe({
        next: (response) => {
          if (response) {
            // s.delegateForm = this.fb.group({
            //   nameAr: ['', [Validators.required, Validators.maxLength(255)]],
            //   nameEn: ['', [Validators.required, Validators.maxLength(255)]],
            //   phone_number_1: ['', [Validators.required, Validators.maxLength(255)]],
            //   phone_number_2: ['', [Validators.maxLength(255)]],
            //   image: [null], // File Upload
            //   account_category_id: ['', Validators.required],
            //   currency_id: ['', Validators.required] 
            const delegate =  response.data;
            this.delegateForm.patchValue({
  
            nameAr: delegate.name_lang.ar,
            nameEn: delegate.name_lang.en,
            // amount: ['', Validators.required],
            phone_number_1: delegate.phone_number_1,
            phone_number_2: delegate.phone_number_2,
            // image: delegate.,
            account_category_id: delegate.account_category_id,
            currency_id: delegate.currency_id,

          });
          this.selectedCaegory = delegate.account_category_id;
          this.selectedCurrency =  delegate.currency_id;

          if(delegate.image){
            this.currentImage = delegate.image;
          }
          
  
  
          
  
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
  
  
  
  
    handleForm() {
     this.isSubmitted  = true;
      if (this.delegateForm.valid) {
        this.isLoading = true;
  
  
        // 'name' => 'required|array',
        // 'name.ar' => 'required|string|max:255',
        // 'name.en' => 'required|string|max:255',
        // 'phone_number_1' => 'required|string|max:255',
        // 'phone_number_2' => 'nullable|string|max:255',
        // 'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        // 'account_category_id' => 'required|exists:account_categories,id',
        // 'currency_id' => 'required|exists:currencies,id',
        const formData = new FormData();
        formData.append('name[ar]', this.delegateForm.get('nameAr')?.value);
        formData.append('name[en]', this.delegateForm.get('nameEn')?.value);
  
  
        formData.append('phone_number_1', this.delegateForm.get('phone_number_1')?.value);
     
        formData.append('phone_number_2', this.delegateForm.get('phone_number_2')?.value || '');
        if( this.delegateForm.get('image')?.value){
          formData.append('image', this.delegateForm.get('image')?.value);
  
        }
        formData.append('account_category_id', this.delegateForm.get('account_category_id')?.value);
        formData.append('currency_id', this.delegateForm.get('currency_id')?.value);
        const groupId = this.route.snapshot.paramMap.get('id');
      
        if (groupId) {
        this._DelegateService.updateDelegate(groupId,formData).subscribe({
          next: (response) => {
            console.log(response);
            if (response) {
              this.toastr.success("تم تحديث المندوب بنجاح");
              this.isLoading = false;
              this._Router.navigate(['/dashboard/delegates']);
            }
          },
          error: (err: HttpErrorResponse) => {
            this.toastr.error('حدث خطا اثناء تعديل المندوب');
            this.isLoading = false;
             this.msgError = err.error.error;
            console.log(err);
          }
        });}
      }
    }
    onCancel() {
      this.delegateForm.reset();
      this._Router.navigate(['/dashboard/delegates']);
    }
  }
  