

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { StoreService } from '../../shared/services/store.service';
import { CurrencyService } from '../../shared/services/currency.service';
import { ProductsService } from '../../shared/services/products.service';
import { AccountService } from '../../shared/services/account.service';
import { PurchasesService } from '../../shared/services/purchases.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { Modal } from 'bootstrap';
import { CheckService } from '../../shared/services/check.service';
import { ToastrService } from 'ngx-toastr';
import { PurchaseOrdersService } from '../../shared/services/purchase_orders.service';
@Component({
  selector: 'app-add-purchase-order',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, TranslateModule],
  templateUrl: './add-purchase-order.component.html',
  styleUrl: './add-purchase-order.component.css'
})
export class AddPurchaseOrderComponent {


  private productSubscription: Subscription = Subscription.EMPTY;
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
  showManual = true;
  showFile = false;
  showAllDataExport = false;
  showItemsExport = false;
  selectedFile: File | null = null;
  needCurrecyPrice: boolean = false;
  forignCurrencyName = '';

  constructor(private fb: FormBuilder,
    private _StoreService: StoreService,
    private _CurrencyService: CurrencyService,
    private _ProductsService: ProductsService,
    private _AccountService: AccountService,
    private _PurchaseOrdersService: PurchaseOrdersService,
    private _Router: Router,
    private cdr: ChangeDetectorRef,
    private _CheckService: CheckService,
    private toastr: ToastrService

  ) {
    this.purchasesBillForm = this.fb.group({
      invoice_date: [this.getTodayDate()],
      payed_price: [null],
      currency_price_value: [null],
      vendor_id: ['', Validators.required],
      store_id: ['', Validators.required],
  
      items: this.fb.array([]),

      supplier_id: [null],
      notes: [''],
      showCashAccountsDropdown: [false],
      // file_type: ['', Validators.required],
      file: [null],
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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
      if (!allowedTypes.includes(file.type)) {
        this.toastr.error('الملف يجب أن يكون من نوع xlsx أو csv');
        return;
      }

      this.selectedFile = file;
    }
  }


  ngOnInit(): void {
    this.loadProducts();
    this.loadStores();
    this.loadSuppliers();
  }

 

  loadSuppliers(): void {
    this._AccountService.getAccountsByParent('621'
      , this.searchQuery
      , 1
      , 20
    ).subscribe({
      next: (response) => {
        if (response) {
          console.log("suppliers", response)
          const Suppliers = response.data.accounts;
          this.vendors = Suppliers;
          this.updateAccounts();
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }



  loadStores() {
    this._StoreService.getAllStores(
      'all', 
      this.searchQuery, 
      1, 
      20 
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


  onStoreChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedStore = selectedValue;
  }


  loadProducts() {
    console.log('query ' ,this.ProductsearchQuery)
    this._ProductsService.getProductsForOperations(
      this.ProductsearchQuery
    ).subscribe({
      next: (response) => {
        if (response) {
          this.Products = response.data.products;
          console.log('products', response);
          this.filteredProducts = this.Products;
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }


  onColorChange(event: Event, index: number) {

    const selectedProductId = (event.target as HTMLSelectElement).value;
    const itemsArray = this.purchasesBillForm.get('items') as FormArray;
    const itemGroup = itemsArray.at(index) as FormGroup;
    itemGroup.patchValue({ color: selectedProductId });
    console.log(itemGroup.get('color_id')?.value);
    console.log(selectedProductId);
  }

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
      product_id: ['', Validators.required],
      product: [null],
      color_id: [null],
      type: [null],
      need_serial: [false],
      barcode: [null],
      colors: [[]],
      branch_data: [null],
      determinants: this.fb.array([]),

      serialNumbers: [[]],
      neededSerialNumbers: [0],



    });
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
  addParcode(index: number) {
    const items = this.purchasesBillForm.get('items') as FormArray;
    const item = items.at(index) as FormGroup;

    const barcode = item.get('barcode')?.value;
    const neededBars = item.get('neededSerialNumbers')?.value;
    if (neededBars == 0) {

      return;
    }
    let tempList = item.get('serialNumbers')?.value || [];

    tempList.forEach(() => {

    });



    if (barcode) {
      tempList.push({ barcode: barcode })
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



  handleForm() {
    this.isSubmited = true;
    if (this.purchasesBillForm.valid) {
      this.isLoading = true;
      let error = false;

      const formData = new FormData();
      formData.append('vendor_id', this.purchasesBillForm.get('vendor_id')?.value);
      formData.append('store_id', this.purchasesBillForm.get('store_id')?.value);
      formData.append('invoice_date', this.purchasesBillForm.get('date')?.value);
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
              if (itemValue.type == 'product') {
                formData.append(`items[${index}][product_id]`, itemValue.product_id);
                const determinants = itemControl.get('determinants')?.value;
                if (determinants.length > 0) {

                  determinants.forEach((determinant_item: any, internalIndex: number) => {
                    formData.append(`items[${index}][determinant_values][${internalIndex}][determinant_value_id]`, determinant_item.selected_id);
                  });
                }
              } else if (itemValue.type == 'branch') {
                formData.append(`items[${index}][product_branch_id]`, itemValue.product_id);
              }
              formData.append(`items[${index}][quantity]`, itemValue.amount || '0');
              if (itemValue.colors.length > 0) {
                if (itemValue.color_id) {
                  formData.append(`items[${index}][product_color_id]`, itemValue.color_id);
                } else {
                  this.toastr.error('لازم تضيف لون للمنتجات اللى ليها اللوان');
                  error = true;
                  return;
                }
              }
              const serialNumbers = itemControl.get('serialNumbers')?.value;
              if (serialNumbers.length > 0) {
                serialNumbers.forEach((item: any, internalIndex: number) => {
                  formData.append(`items[${index}][serial_numbers][${internalIndex}][serial_number]`, item.barcode);
                });
              }
            }
          });
        }






if(!error){
     this._PurchaseOrdersService.addPurchaseOrder(formData).subscribe({
            next: (response) => {
              if (response) {
                this.toastr.success('تم اضافه الفاتوره بنجاح');
                console.log(response);
                this.isLoading = false;
                this._Router.navigate(['/dashboard/purchase-order']);
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

}
     




      



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
    this.needCurrecyPrice = false;
    this.forignCurrencyName = '';


    if (this.currency.id != check.currency.id) {
      this.needCurrecyPrice = true;
      this.forignCurrencyName = check.currency.name;

    }

    if (this.selectedVendor) {
      if (this.selectedVendor.currency.id != this.currency.id) {
        this.needCurrecyPrice = true;
        this.forignCurrencyName = this.selectedVendor.currency.name;

      }
    }
    this.closeModal('checkModel');
  }
  closeModal(modalId: string) {
    this.searchQuery = '';
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }


  openModal(modalId: string, type: string) {
    this.searchQuery = '';
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
      // this.filteredAccounts = this.cashAccounts.filter(account =>
      //   account.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      // );
// this.loadCashAccounts();
    } else if (this.selectedPopUP == 'vendor') {
      // this.filteredAccounts = this.vendors.filter(account =>
      //   account.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      // );

      this.loadSuppliers();
    }

  }
updateAccounts(){
   if (this.selectedPopUP == 'cash') {
    
      this.filteredAccounts = this.cashAccounts;

    } else if (this.selectedPopUP == 'vendor') {
      this.filteredAccounts = this.vendors;
    }
}


  selectAccount(account: Account) {
    if (this.selectedPopUP == 'cash') {
      this.selectedCashAccount = account;
      this.purchasesBillForm.patchValue({ 'cash_id': account.id })
      this.needCurrecyPrice = false;
      this.forignCurrencyName = '';


      // if (this.currency.id != account.currency.id) {
      //   this.needCurrecyPrice = true;
      //   this.forignCurrencyName = account.currency.name;

      // }

      // if (this.selectedVendor) {
      //   if (this.selectedVendor.currency.id != this.currency.id) {
      //     this.needCurrecyPrice = true;
      //     this.forignCurrencyName = this.selectedVendor.currency.name;

      //   }
      // }



    } else if (this.selectedPopUP == 'vendor') {
      this.selectedVendor = account;
      this.purchasesBillForm.patchValue({ 'vendor_id': account.id })

      // this.needCurrecyPrice = false;
      // this.forignCurrencyName = '';

      // if (this.currency.id != account.currency.id) {
      //   this.needCurrecyPrice = true;
      //   this.forignCurrencyName = account.currency.name;


      // }

      // if (this.selectedCashAccount) {
      //   if (this.selectedCashAccount.currency.id != this.currency.id) {
      //     this.needCurrecyPrice = true;
      //     this.forignCurrencyName = this.selectedCashAccount.currency.name;

      //   }
      // }

      // if (this.selectedCheck) {
      //   if (this.selectedCheck.currency.id != this.currency.id) {
      //     this.needCurrecyPrice = true;
      //     this.forignCurrencyName = this.selectedCheck.currency.name;
      //   }
      // }
    }

    this.cdr.detectChanges();
    this.closeModal('shiftModal');
  }

  filteredProducts: any;
  ProductsearchQuery = '';
  selectedProduct: any;

  onProductSearchChange() {
  this.loadProducts();
  }
  getDeterminants(item: AbstractControl<any, any>): FormArray {
    return item.get('determinants') as FormArray;
  }
  selectProduct(product: any, type: string, product_id: string, branch: any = null) {
    const itemsArray = this.purchasesBillForm.get('items') as FormArray;
    const itemGroup = itemsArray.at(this.productIndex) as FormGroup;

    itemGroup.patchValue({ product: product });
    itemGroup.patchValue({ product_id: product_id });
    console.log(product);

    const determinantsFromArray = itemGroup.get('determinants') as FormArray;
    itemGroup.patchValue({ colors: [] });
    determinantsFromArray.clear();

    if (type == 'product') {
      itemGroup.patchValue({ type: 'product' });

      if (product.colors) {
        if (product.colors.length > 0) {

          itemGroup.patchValue({ colors: product.colors });

        }
      }


      if (product.determinants) {
        const determinantsFromArray = itemGroup.get('determinants') as FormArray;
        determinantsFromArray.clear();

        if (product.determinants.length > 0) {
          console.log(product.determinants);
          product.determinants.forEach((determinant: any) => {
            determinantsFromArray.push(this.fb.group({
              selected_id: [null, Validators.required],
              values: [determinant.values],
              name: [determinant.name],
            }));
          });



        }
      }

    } else {
      itemGroup.patchValue({ type: 'branch' });
      itemGroup.patchValue({
        branch_data: {
          color: branch?.color,
          determinants: branch?.determinants
        }
      });


    }

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
  filteredStores() {
    if (!this.storeSearchTerm) return this.stores;
    const term = this.storeSearchTerm.toLowerCase();
    return this.stores.filter(store =>
      store.name.toLowerCase().includes(term) || store.id.toString().includes(term)
    );
  }

  selectStore(store: any) {
    this.selectedStore = store;
    this.purchasesBillForm.patchValue({ store_id: store.id });
    this.closeModal('storeModal');
  }





}

interface Account {
  id: string;
  name: string;
  currency: Currency
}

interface Currency {
  id: string;
  name: string;
}
interface SerialNumber {
  serialNumber: string;
}