import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { StoreService } from '../../shared/services/store.service';
import { CurrencyService } from '../../shared/services/currency.service';
import { ProductBranchStoresService } from '../../shared/services/product-branch-stores.service';
import { AccountService } from '../../shared/services/account.service';
import { PurchasesService } from '../../shared/services/purchases.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Modal } from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CheckService } from '../../shared/services/check.service';
import { ProductsService } from '../../shared/services/products.service';

@Component({
  selector: 'app-update-return-purchase',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, TranslateModule],
  templateUrl: './update-return-purchase.component.html',
  styleUrl: './update-return-purchase.component.css'
})
export class UpdateReturnPurchaseComponent {
cancel() {
    this._Router.navigate(['/dashboard/return-purchase/waiting']);
}
 // private productSubscription: Subscription = Subscription.EMPTY;
 isSubmited = false;
 serialNumber: SerialNumber[] = [];
 purchasesBillForm: FormGroup;
 Products: any[] = [];
 msgError: any[] = [];
 isLoading: boolean = false;
 currency: any;
 stores: any[] = [];
 vendors: any[] = [];
 selectedType: string = 'purchase';
 selectedStore: any;
 checks: any;
 storeSearchTerm: string = '';
 delegates: any[] = [];
 cashAccounts: any[] = [];
 productDeterminants: any[] = [];
 inputDisabled: boolean[] = []; // Tracks which inputs are disabled
 overrideCount: number = 0;
 selectedCheck: any;
 total = 0;
 totalPayed = 0;
 showFile = false;
 showAllDataExport = false;
 showItemsExport = false;
 selectedFile: File | null = null;
 needCurrecyPrice: boolean = false;
 forignCurrencyName = '';
    returnPurchaseData: any;

 constructor(private fb: FormBuilder,
   private _StoreService: StoreService,
   private _CurrencyService: CurrencyService,
   private _ProductBranchStoresService:ProductBranchStoresService,
   private _AccountService: AccountService,
   private _PurchasesService: PurchasesService,
   private _Router: Router,
   private _ProductsService:ProductsService,
   private cdr: ChangeDetectorRef,
   private _CheckService: CheckService,
   private toastr: ToastrService,
   private route:ActivatedRoute
 ) {
   
   this.purchasesBillForm = this.fb.group({
     invoice_date: [this.getTodayDate()],
     payed_price: [null],
     currency_price_value: [null],
     vendor_id: ['', Validators.required],
     store_id: ['', Validators.required],
     payment_type: ['cash'],
     check_id: [''],
     items: this.fb.array([]),
     supplier_id: [null],
     cash_id: [null],
     notes: [''],
     showCashAccountsDropdown: [false],
   });
     this.addItem(); 
   
 }

 getTodayDate(): string {
   const today = new Date();
   const year = today.getFullYear();
   const month = String(today.getMonth() + 1).padStart(2, '0');
   const day = String(today.getDate()).padStart(2, '0');
   return `${year}-${month}-${day}`;
 }

 
 loadChecks() {
   this._CheckService.getCheckByPayedToAccount('112').subscribe({
     next: (response) => {
       if (response) {
         const cashAccounts = response.data;
         console.log("checks", cashAccounts)
         this.checks = cashAccounts;
       }
     },
     error: (err) => {
       console.error(err);
     }
   });
 }
 ngOnInit(): void {
   this.loadDefaultCurrency();
   this.loadStores();
   this.loadSuppliers();
   this.loadCashAccounts();
   this.loadChecks();
   const unitId = this.route.snapshot.paramMap.get('id');
   if (unitId) {
     this.loadReturnPurchaseBill(unitId);
   }
 }
 loadReturnPurchaseBill(id: string) {
    this._PurchasesService.getReturnPurchaseById(id).subscribe({
      next: (response) => {
        if (response) {
          const returnPurchaseData = response.data;
          this.returnPurchaseData = returnPurchaseData;
          console.log("Return Purchase data:", returnPurchaseData);
  
          // Clear existing items
          while (this.items.length !== 0) {
            this.items.removeAt(0);
          }
  
          // Patch form values
          this.purchasesBillForm.patchValue({
            invoice_date: returnPurchaseData.date,
            vendor_id: returnPurchaseData.vendor?.id,
            store_id: returnPurchaseData.store?.id,
            payment_type: returnPurchaseData.payment_type,
            notes: returnPurchaseData.note,
            cash_id: returnPurchaseData.payed_from_account?.id,
            check_id: returnPurchaseData.check?.id
          });
  
          // Set selected accounts
          if (returnPurchaseData.payed_from_account) {
            this.selectedCashAccount = returnPurchaseData.payed_from_account;
          }
          if (returnPurchaseData.vendor) {
            this.selectedVendor = returnPurchaseData.vendor;
          }
          if (returnPurchaseData.check) {
            this.selectedCheck = returnPurchaseData.check;
          }
          if (returnPurchaseData.store) {
            this.selectedStore = returnPurchaseData.store;
            this.loadProducts(returnPurchaseData.store.id.toString());
          }
  
          // Add items
          if (returnPurchaseData.purchaseBillItems && returnPurchaseData.purchaseBillItems.length > 0) {
            returnPurchaseData.purchaseBillItems.forEach((item: any) => {
              const newItem = this.createItem();
              this.items.push(newItem);
  
              const index = this.items.length - 1;
              const itemGroup = this.items.at(index) as FormGroup;
  
              // Prepare product data
              const productData = {
                id: item.product?.id,
                name: item.product?.name,
                need_serial_number: item.product?.need_serial_number,
                stock: item.stock,
                branch: item.branch,
                product: item.product
              };
  
              // Patch item values
              itemGroup.patchValue({
                product_id: item.product.id,
                product: productData,
                price: item.price,
                amount: item.quantity,
                serialNumbers: item.productSerialNumbers || [],
                neededSerialNumbers: item.product?.need_serial_number 
                  ? item.quantity - (item.productSerialNumbers?.length || 0)
                  : 0
              });
            });
          }
  
          this.total = parseFloat(returnPurchaseData.total) || 0;
          this.totalPayed = parseFloat(returnPurchaseData.total_payed) || 0;
  
          // Set payment type and show accounts dropdown if payment exists
          if (this.totalPayed > 0) {
            this.purchasesBillForm.patchValue({
              showCashAccountsDropdown: true,
              payed_price: this.totalPayed
            });
          }
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error("Error loading return purchase bill:", err);
        this.msgError = err.error.error;
        this.toastr.error('Failed to load return purchase bill');
      }
    });
  }
 currencyPriceValue: number = 0;
 currencyPrice(){
   const currencyPriceValue = this.purchasesBillForm.get('currency_price_value')?.value || 0;
   this.currencyPriceValue = currencyPriceValue;
 }

 getSerialNumbers(productId: string, storeId: string, index: number) {
   console.log('productId', productId);
   console.log('storeId', storeId);
   this._ProductsService.getSerialNumbers(productId, storeId).subscribe({
     next: (response) => {
       if (response) {
         this.serialNumber = response.data;
         const itemsArray = this.purchasesBillForm.get('items') as FormArray;
         const itemGroup = itemsArray.at(this.productIndex) as FormGroup;
         itemGroup.patchValue({ productSerialNumbers: this.serialNumber });
         console.log("serials" , response.data);

       }
     },
     error: (err) => {
       console.error(err);
     },
   });
 }

 loadDefaultCurrency() {
   this._CurrencyService.getDefultCurrency().subscribe({
     next: (response) => {
       if (response) {
         console.log(response);
         this.currency = response.data;
       }
     },
     error: (err) => {
       if (err.status == 404) {
         this.toastr.error('يجب اختيار عملة اساسية قبل القيام بأى عملية شراء او بيع');
         this._Router.navigate(['/dashboard/currency']);
       }
       console.log(err);
     }
   });
 }


 loadSuppliers(): void {
   this._AccountService.getAccountsByParent(
     '621'
     ,this.searchQuery
   ).subscribe({
     next: (response) => {
       if (response) {
         console.log("suppliers", response)
         const Suppliers = response.data.accounts;
         this.vendors = Suppliers;
       }
     },
     error: (err) => {
       console.error(err);
     }
   });
 }
 currentPage = 1; 
 itemsPerPage = 10; 
 totalProducts = 0;
 onItemsPerPageChange(): void {
   this.currentPage = 1;
   this.loadProducts(this.selectedStore);
 }
 onPageChange(page: number): void {
   this.currentPage = page;
   this.loadProducts(this.selectedStore);
 }
 getPages(): number[] {
   const totalPages = Math.ceil(this.totalProducts / this.itemsPerPage);
   const maxVisiblePages = 5;
   const pages: number[] = [];
   
   if (totalPages <= maxVisiblePages) {
     for (let i = 1; i <= totalPages; i++) {
       pages.push(i);
     }
   } else {
     const half = Math.floor(maxVisiblePages / 2);
     let start = Math.max(1, this.currentPage - half);
     const end = Math.min(totalPages, start + maxVisiblePages - 1);
     
     if (end - start + 1 < maxVisiblePages) {
       start = end - maxVisiblePages + 1;
     }
     
     for (let i = start; i <= end; i++) {
       pages.push(i);
     }
   }
   
   return pages;
 }
 loadProducts(storeId: string) {
   this._ProductBranchStoresService.getByStoreId(storeId,
     this.ProductsearchQuery
   ).subscribe({
     next: (response) => {
       if (response) {
         this.Products = response.data.products;
         console.log(response)
         this.totalProducts = response.data.meta.total;
         console.log('product branches', this.Products);
         this.filteredProducts = this.Products;
       }
     },
     error: (err) => {
       console.error(err);
     },
   });
 }


 loadCashAccounts(): void {
   this._AccountService.getAccountsByParent('111'
     ,this.searchQuery
   ).subscribe({
     next: (response) => {
       if (response) {
         console.log("CashAccounts", response)
         const cashAccounts = response.data.accounts;
    
         this.cashAccounts = cashAccounts;
         this.updateData();
       }
     },
     error: (err) => {
       console.error(err);
     }
   });

 }

 updateData(){
   if (this.selectedPopUP == 'cash') {
     this.filteredAccounts = this.cashAccounts;
   }else if (this.selectedPopUP == 'vendor') {
     this.filteredAccounts = this.vendors;
   }

 }


 loadStores() {
   this._StoreService.getAllStores(
     'all',
     this.storeSearchTerm

   ).subscribe({
     next: (response) => {
       if (response) {
         console.log(response);
         this.stores = response.data;
       }
     },
     error: (err) => {
       console.error(err);
     }
   });
 }


 // onStoreChange(event: Event): void {
 //   const selectedValue = (event.target as HTMLSelectElement).value;
 //   this.selectedStore = selectedValue;
 // }



 addItem() {
   const items = this.purchasesBillForm.get('items') as FormArray;
   items.push(this.createItem());
 }

 removeItem(index: number): void {
   this.items.removeAt(index);
 }



 createItem(): FormGroup {
   return this.fb.group({
     amount: [null, Validators.required],
     price: ['', Validators.required],
     product_id: ['', Validators.required],
     product: [null],
     type: [null],
     need_serial: [false],
     barcode: [null],
     branch_data: [null],
     determinants: this.fb.array([]),
     productSerialNumbers: [[]],

     serialNumbers: [[]],
     neededSerialNumbers: [0],


     // dynamicInputs: this.fb.array([])

   });
 }


 onBarcodeSelect(barcode: Event, index: number) {
   {
     const selectedValue = (barcode.target as HTMLSelectElement).value;

     const items = this.purchasesBillForm.get('items') as FormArray;
     const item = items.at(index) as FormGroup;

     const neededBars = item.get('neededSerialNumbers')?.value;
     if (neededBars == 0) {
       item.patchValue({ barcode: null });
       return;
     }
     let tempList = item.get('serialNumbers')?.value || [];
     let isdublicated = false;
     tempList.forEach((item: any) => {
       if (item.barcode == selectedValue) {
         this.toastr.error('هذا السيريال موجود بالفعل');
         isdublicated = true;
         return;
       }
     });

     if (isdublicated) {
       item.patchValue({ barcode: null });

       return;
     }
     if (selectedValue) {
       tempList.push({ barcode: selectedValue })
       item.patchValue({ serialNumbers: tempList });
       console.log(tempList);
       item.patchValue({ barcode: null });
       item.patchValue({ neededSerialNumbers: neededBars - 1 });


     }
   }
 }



 removeSerialNumber(serialNumber: string, index: number) {
   const items = this.purchasesBillForm.get('items') as FormArray;
   const item = items.at(index) as FormGroup;
   const neededBars = item.get('neededSerialNumbers')?.value;
   const serialNumbers = item.get('serialNumbers')?.value;
   if (serialNumbers && Array.isArray(serialNumbers)) {
     const tempList = serialNumbers.filter(item => item.barcode !== serialNumber);
     item.patchValue({ serialNumbers: tempList });
     item.patchValue({ neededSerialNumbers: neededBars + 1 });
   }
 }


   addParcode(index: number , givenBarcode:any) {
   const items = this.purchasesBillForm.get('items') as FormArray;
   const item = items.at(index) as FormGroup;

   const barcode = givenBarcode ;
   const neededBars = item.get('neededSerialNumbers')?.value;
   if (neededBars == 0) {
     return;
   }
   let tempList = item.get('serialNumbers')?.value || [];
   const updatedTemplist = tempList.filter((b: string) => b !== barcode);



   if (barcode) {
     tempList.push({ serial_number: barcode.serial_number , id:barcode.id })
     item.patchValue({ serialNumbers: tempList });
     console.log(tempList);
     item.patchValue({ barcode: null });
     item.patchValue({ neededSerialNumbers: neededBars - 1 });


   }

 }
 updateDynamicInputs(index: number, amount: number): void {
   const items = this.purchasesBillForm.get('items') as FormArray;
   const item = items.at(index) as FormGroup;
   let dynamicInputs = item.get('dynamicInputs') as FormArray<FormControl>;
   if (!dynamicInputs) {
     dynamicInputs = this.fb.array([]);
     item.setControl('dynamicInputs', dynamicInputs);
   }

   const currentLength = dynamicInputs.length;
   if (currentLength < amount) {
     for (let i = currentLength; i < amount; i++) {
       dynamicInputs.push(this.fb.control('', Validators.required));
     }
   } else if (currentLength > amount) {
     for (let i = currentLength - 1; i >= amount; i--) {
       dynamicInputs.removeAt(i);
     }
   }
 }

 onAmountChange(index: number): void {

   const items = this.purchasesBillForm.get('items') as FormArray;
   const item = items.at(index) as FormGroup;
   const amount = item.get('amount')?.value || 0;
   if (item.get('product')?.value?.need_serial_number) {
     if (typeof amount === 'number' && amount >= 0) {
       item.patchValue({ neededSerialNumbers: amount })

     } else {
       console.warn('Invalid amount:', amount);
     }
   }

   // this.calculateTotal();

 }
 payedAmount() {
   if ((this.purchasesBillForm.get('payed_price')?.value || 0) > this.total) {
     this.purchasesBillForm.patchValue({ payed_price: this.total });
   }

   // if(this.currencyPriceValue>0){
   //   this.totalPayed = (this.purchasesBillForm.get('payed_price')?.value || 0) * this.currencyPriceValue; 
   // }
   this.totalPayed = (this.purchasesBillForm.get('payed_price')?.value || 0);
 }
 paymentTriggerChange() {
   // const value = (event.target as HTMLSelectElement).value;
   if (!this.purchasesBillForm.get('showCashAccountsDropdown')?.value) {
     // console.log(true)
     this.totalPayed = 0;
     // this.purchasesBillForm.patchValue({payed_price: 0});

   } else {
     this.totalPayed = (this.purchasesBillForm.get('payed_price')?.value || 0);

   }
 }
 onPrice() {
   this.total = 0;
   this.items.controls.forEach((itemControl) => {
     const itemValue = itemControl.value;
     console.log('amount', itemValue.amount);
     console.log('price', itemValue.price);

     if (itemValue) {
       this.total += (itemValue.amount || 0) * (itemValue.price || 0);
     }
   });
 }

 // isDisabled = true; // Change this condition dynamically


 disableInput(itemIndex: number, inputIndex: number): void {
   const items = this.purchasesBillForm.get('items') as FormArray;
   const item = items.at(itemIndex) as FormGroup;
   const dynamicInputs = item.get('dynamicInputs') as FormArray<FormControl>;

   const control = dynamicInputs.at(inputIndex);
   if (control) control.disable();
 }


 get items() {
   return (this.purchasesBillForm.get('items') as FormArray);
 }



 onPaymentTypeChange(event: Event) {

 }
 handleForm() {
  
   if(this.purchasesBillForm.get('payment_type')?.value == 'cash' && this.selectedVendor && this.needCurrecyPrice && !this.purchasesBillForm.get('currency_price_value')?.value){
     this.toastr.error('يجب ادخال سعر الصرف');
     // alert('يجب ادخال سعر الصرف');
     return;
   }
   this.isSubmited = true;
   if (this.purchasesBillForm.valid) {
     this.isLoading = true;
     let error = false;

     const formData = new FormData();
     if (this.purchasesBillForm.get('showCashAccountsDropdown')?.value) {
       if (this.purchasesBillForm.get('cash_id')?.value && this.purchasesBillForm.get('payment_type')?.value == 'cash') {
         formData.append('payed_from_account_id', this.purchasesBillForm.get('cash_id')?.value);
         formData.append('payment_type', 'cash');
       } else if (this.purchasesBillForm.get('check_id')?.value && this.purchasesBillForm.get('payment_type')?.value == 'check') {
         formData.append('payment_type', 'check');
         formData.append('check_id', this.purchasesBillForm.get('check_id')?.value);
       }
     }
     if(this.needCurrecyPrice && this.purchasesBillForm.get('currency_price_value')?.value){
       formData.append('currency_price_value', this.purchasesBillForm.get('currency_price_value')?.value);
     }

     formData.append('vendor_id', this.purchasesBillForm.get('vendor_id')?.value);
     console.log(this.purchasesBillForm.get('vendor_id')?.value);
     formData.append('store_id', this.purchasesBillForm.get('store_id')?.value);
     formData.append('invoice_date', this.purchasesBillForm.get('date')?.value);
     formData.append('total', this.total.toString());
     formData.append('total_payed', this.totalPayed.toString());
     formData.append('notes', this.purchasesBillForm.get('notes')?.value || '');
     formData.append('date', this.purchasesBillForm.get('invoice_date')?.value);

 
    
     if (this.items && this.items.controls) {
       this.items.controls.forEach((itemControl, index) => {
         const itemValue = itemControl.value;

         if (itemValue.neededSerialNumbers > 0) {
           this.toastr.error('يجب ادخال كل السيريا المطلوب');
           error = true;

           return;

         }

         if (itemValue) {

           formData.append(`items[${index}][product_id]`, itemValue.product_id);
           formData.append(`items[${index}][quantity]`, itemValue.amount || '0');
           formData.append(`items[${index}][price]`, itemValue.price || '0');
           const serialNumbers = itemControl.get('serialNumbers')?.value;
           if (serialNumbers.length > 0) {
             serialNumbers.forEach((item: any, internalIndex: number) => {
               formData.append(`items[${index}][serial_numbers][${internalIndex}]`, item.id);
             });
           }
          

         }
       });
     }
     
     if (!error) {
    const unitId = this.route.snapshot.paramMap.get('id');
        if (unitId) {      
       this._PurchasesService.updateReturnPurchase(unitId,formData).subscribe({
         next: (response) => {
           if (response) {
             this.toastr.success('تم اضافه الفاتوره بنجاح');
             console.log(response);
             this.isLoading = false;
             this._Router.navigate(['/dashboard/return-purchase/waiting']);
           }
         },

         error: (err: HttpErrorResponse) => {
           this.toastr.error('حدث خطا اثناء اضافه الفاتوره');
           this.isLoading = false;
           this.msgError = [];

           if (err.error && err.error.errors) {

             for (const key in err.error.errors) {
               if (err.error.errors[key] instanceof Array) {
                 this.msgError.push(...err.error.errors[key]);
               } else {
                 this.msgError.push(err.error.errors[key]);
               }
             }
           }

           console.error(this.msgError);
         },

       });
     }}

     
   } else {
     Object.keys(this.purchasesBillForm.controls).forEach((key) => {
       const control = this.purchasesBillForm.get(key);
       if (control && control.invalid) {
         console.log(`Invalid Field: ${key}`, control.errors);
       }
     });
   }
 }

 filteredAccounts: Account[] = [];
 selectedPopUP: string = '';
 searchQuery: string = '';
 selectedCashAccount: Account | null = null;
 selecteddelegateAccount: Account | null = null;
 selectedVendor: Account | null = null;

 onCheckSearchChange() {

 }

 selectcheck(check: any) {
   this.purchasesBillForm.patchValue({ 'check_id': check.id })
   this.selectedCheck = check;
   this.needCurrecyPrice =false;
   this.forignCurrencyName ='';


   if(this.currency.id != check.currency.id){
     this.needCurrecyPrice =true;
     this.forignCurrencyName =check.currency.name;

   }
   
   if(this.selectedVendor){
     if(this.selectedVendor.currency.id != this.currency.id){
       this.needCurrecyPrice =true;
       this.forignCurrencyName =this.selectedVendor.currency.name;

     }
   }
   this.closeModal('checkModel');
 }
 closeModal(modalId: string) {
   const modalElement = document.getElementById(modalId);
   if (modalElement) {
     const modal = Modal.getInstance(modalElement);
     modal?.hide();
   }
 }


 openModal(modalId: string, type: string) {
   if (modalId == 'checkModel') { } else if (modalId == 'shiftModal') {

     this.selectedPopUP = type;
     if (type == 'cash') {
       this.filteredAccounts = this.cashAccounts;
     } else if (type == 'delegate') {
       this.filteredAccounts = this.delegates;
     } else if (type == 'vendor') {
       this.filteredAccounts = this.vendors;

     }


   }

   const modalElement = document.getElementById(modalId);
   if (modalElement) {
     const modal = new Modal(modalElement);
     modal.show();
   }
 }



 onSearchChange() {
   if (this.selectedPopUP == 'cash') {
     this.loadCashAccounts();
   }else if (this.selectedPopUP == 'vendor') {
     this.loadSuppliers();
   }
 }



 selectAccount(account: Account) {
   if (this.selectedPopUP == 'cash') {
     this.selectedCashAccount = account;
     this.purchasesBillForm.patchValue({ 'cash_id': account.id })
     this.needCurrecyPrice =false;
     this.forignCurrencyName ='';


     if(this.currency.id != account.currency.id){
       this.needCurrecyPrice =true;
       this.forignCurrencyName =account.currency.name;

     }
     
     if(this.selectedVendor){
       if(this.selectedVendor.currency.id != this.currency.id){
         this.needCurrecyPrice =true;
         this.forignCurrencyName =this.selectedVendor.currency.name;

       }
     }

   
     
   } else if (this.selectedPopUP == 'vendor') {
     this.selectedVendor = account;
     this.purchasesBillForm.patchValue({ 'vendor_id': account.id })

   this.needCurrecyPrice =false;
   this.forignCurrencyName ='';

if(this.currency.id != account.currency.id){
 this.needCurrecyPrice =true;
 this.forignCurrencyName =account.currency.name;


}

if(this.selectedCashAccount){
 if(this.selectedCashAccount.currency.id != this.currency.id){
   this.needCurrecyPrice =true;
   this.forignCurrencyName =this.selectedCashAccount.currency.name;

 }
}

if(this.selectedCheck){
 if(this.selectedCheck.currency.id != this.currency.id){
   this.needCurrecyPrice =true;

   this.forignCurrencyName =this.selectedCheck.currency.name;

 }
}


   }
   this.cdr.detectChanges();
   this.closeModal('shiftModal');
 }

 filteredProducts: any;

 ProductsearchQuery = '';
 selectedProduct: any;
 onProductSearchChange() {
   if(this.selectedStore){
     this.loadProducts(this.selectedStore.id);
   }

 }
 getDeterminants(item: AbstractControl<any, any>): FormArray {
   return item.get('determinants') as FormArray;
 }


 selectProduct(branch: any ) {
   const itemsArray = this.purchasesBillForm.get('items') as FormArray;
   const itemGroup = itemsArray.at(this.productIndex) as FormGroup;
   // console.log('branch: ',branch.branch);
   itemGroup.patchValue({ product: branch.product });
   itemGroup.patchValue({ product_id: branch.branch.id });
   
     itemGroup.patchValue({ type: 'branch' });
     itemGroup.patchValue({
       branch_data: {
         color: branch?.branch?.color,
         determinants: branch?.branch.determinants
       }
     });
     this.lastSelectedIndex = -1;

   this.closeProductModel();
 }

 productIndex: number = -1;
 openProductModal(index: number) {
   this.productIndex = index;
   const modalElement = document.getElementById('productModel');
   if (modalElement) {
     const modal = new Modal(modalElement);
     modal.show();
   }
 }




 closeProductModel() {
   const modalElement = document.getElementById('productModel');
   if (modalElement) {
     const modal = Modal.getInstance(modalElement);
     modal?.hide();
   }
 }
 // filteredStores() {
 //   if (!this.storeSearchTerm) return this.stores;
 //   const term = this.storeSearchTerm.toLowerCase();
 //   return this.stores.filter(store =>
 //     store.name.toLowerCase().includes(term) || store.id.toString().includes(term)
 //   );
 // }
 
 selectStore(store: any) {
   this.selectedStore = store;
   this.purchasesBillForm.patchValue({ store_id: store.id });
   this.loadProducts(store.id);
   this.closeModal('storeModal');
 }


 onTotalChange(event: Event) {
   const input = event.target as HTMLInputElement;
   this.total = Number(input.value);
 }





searchText: string = '';
selectedSerachIndex = -1;
lastSelectedIndex = -1;

 options: string[] = ['Apple', 'Banana', 'Cherry', 'Date', 'Grape', 'Kiwi'];

 filteredOptions(): string[] {
   return this.options.filter(option =>
     option.toLowerCase().includes(this.searchText.toLowerCase())
   );
 }

productSerialNumbers :any = [];
loadingSerialNumbers = false;

searchSerialNumber(event:Event , index:number){
 this.searchText = (event.target as HTMLSelectElement).value;
 this.selectedSerachIndex = index;
 const itemsArray = this.purchasesBillForm.get('items') as FormArray;

 const itemGroup = itemsArray.at(index) as FormGroup;
 const store_id  = this.purchasesBillForm.get('store_id')?.value;
 const productId = itemGroup.get('product')?.value?.id;

 if(store_id && productId){
   // this.productSerialNumbers = [];
   this.loadSerialNumbers(store_id ,productId);
 }
}

onFocus(index :number){
 const itemsArray = this.purchasesBillForm.get('items') as FormArray;
 this.selectedSerachIndex = index;

 const itemGroup = itemsArray.at(index) as FormGroup;
 const store_id  = this.purchasesBillForm.get('store_id')?.value;
 const productId = itemGroup.get('product')?.value?.id;
 const searchText  = itemGroup.get('barcode')?.value || '';

 // console.log(this.selectedSerachIndex ,index);
 if(store_id && productId && this.lastSelectedIndex != index){
   this.productSerialNumbers = [];
   this.searchText = searchText;
   this.loadSerialNumbers(store_id ,productId);
 }
 this.lastSelectedIndex = index;

}
 selectOption(serialNumber:any , index:number , GivenserialNumber :any = null){
   const items = this.purchasesBillForm.get('items') as FormArray;
   const item = items.at(index) as FormGroup;

   const CurrentSerialNumber = GivenserialNumber ? GivenserialNumber : serialNumber;
   const neededBars = item.get('neededSerialNumbers')?.value;
   if (neededBars == 0) {
     return;
   }
   let tempList = item.get('serialNumbers')?.value || [];
   console.log(CurrentSerialNumber);

   if (CurrentSerialNumber) {
     tempList.push({ serial_number: CurrentSerialNumber.serial_number , id:CurrentSerialNumber.id })
     item.patchValue({ serialNumbers: tempList });
     console.log(tempList);
     item.patchValue({ barcode: null });
     item.patchValue({ neededSerialNumbers: neededBars - 1 });


   }

 }

 onInputBlur(): void {
 setTimeout(() => {
   this.selectedSerachIndex = -1;
 }, 200);  
}



 loadSerialNumbers(store_id :string,productId:string){
   this.loadingSerialNumbers =true;

   this._ProductsService.getSerialNumbers(productId, store_id,
   this.searchText,
   'return_purchase'
 ).subscribe({
   next: (response) => {
     if (response ) {
       this.productSerialNumbers = response.data.serial_numbers;
       console.log(this.productSerialNumbers);
       // this.filteredSerialNumbers = [...response.data.serial_numbers];
     }
     this.loadingSerialNumbers = false;
   },
   error: (err) => {
     console.error('Error loading serial numbers:', err);
     this.toastr.error('Failed to load serial numbers', 'Error');
     this.loadingSerialNumbers = false;
   }
 });

 }


 isOptionDisabled(serialNumber:any , index:number): boolean {
   const items = this.purchasesBillForm.get('items') as FormArray;
   const item = items.at(index) as FormGroup;
   const tempList = item.get('serialNumbers')?.value || [];
   let value = false;
   tempList.forEach((element:any) => {
     if(serialNumber.serial_number == element.serial_number){
       value = true;
     }
   });

   return value;
 }

}

interface Account {
 id: string;
 name: string;
 currency:Currency
}

interface Currency {
 id: string;
 name: string;
}
interface SerialNumber {
 serialNumber: string;
}