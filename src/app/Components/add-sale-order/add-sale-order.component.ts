import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { StoreService } from '../../shared/services/store.service';
import { CurrencyService } from '../../shared/services/currency.service';
import { ProductsService } from '../../shared/services/products.service';
import { AccountService } from '../../shared/services/account.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { Modal } from 'bootstrap';
import { CheckService } from '../../shared/services/check.service';
import { CommonModule } from '@angular/common';
import { ProductBranchesService } from '../../shared/services/product_branches.service';
import { ClientService } from '../../shared/services/client.service';
import { SalesService } from '../../shared/services/sales.service';
import { ProductBranchStoresService } from '../../shared/services/product-branch-stores.service';
import { ToastrService } from 'ngx-toastr';
import { SaleOrdersService } from '../../shared/services/sale_orders.service';

@Component({
  selector: 'app-add-sale-order',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, TranslateModule ],
  templateUrl: './add-sale-order.component.html',
  styleUrl: './add-sale-order.component.css'
})
export class AddSaleOrderComponent {  
  private productSubscription: Subscription = Subscription.EMPTY;
  isSubmited = false;
  serialNumber: SerialNumber[] = [];
  saleForm: FormGroup;
  Products: any[] = [];
  msgError: any[] = [];
  isLoading: boolean = false;
  currency: any;
  stores: any[] = [];
  vendors: any[] = [];
  selectedType: string = 'purchase';
  selectedStore: string = '';
  checks: any;

  needCurrecyPrice: boolean = false;
  forignCurrencyName = '';

  delegates: any[] = [];
  cashAccounts: any[] = [];
  productDeterminants: any[] = [];
  dynamicInputs: FormArray<FormControl>;
  inputDisabled: boolean[] = [];
  overrideCount: number = 0;
  selectedCheck: any;
  total = 0;
  totalPayed = 0;
  currencyPriceValue: number = 0;
  currentPage = 1; 
  itemsPerPage = 10; 
  totalProducts = 0;

  constructor(private fb: FormBuilder,
    private _StoreService: StoreService,
    private _CurrencyService: CurrencyService,
    private _ProductsService: ProductsService,
    private _ClientService: ClientService,
    private _ProductBranchStoresService: ProductBranchStoresService,

    private _AccountService: AccountService,
    private _SaleOrdersService: SaleOrdersService,
    private _Router: Router,
    private cdr: ChangeDetectorRef,
    private _CheckService: CheckService,
    private toastr: ToastrService,

  ) {
    this.saleForm = this.fb.group({
      invoice_date: [this.getTodayDate()],
      vendor_id: ['', Validators.required],
      store_id: ['', Validators.required],
      check_id: [''],
      delegate_id: [null],
      items: this.fb.array([this.createItem()]),
      notes: [''],
      showCashAccountsDropdown: [false],
    });
    this.dynamicInputs = this.fb.array([]);
  }

  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  ngOnInit(): void {
    this.loadStores();
    this.loadSuppliers();
    this.loadDelegates();
   }

  loadSuppliers(): void {
    this._ClientService.getClientsForSales(
        this.searchQuery
   
    ).subscribe({
      next: (response) => {
        if (response) {
          console.log("suppliers", response)
          this.vendors = response.data.clients;
          this.updateAccounts();
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  loadDelegates(): void {
    this._AccountService.getAccountsByParent('623',
      this.searchQuery
    ).subscribe({
      next: (response) => {
        if (response) {
          console.log("delegates", response)
          const delegates = response.data.accounts;
          this.delegates = delegates;
          this.updateAccounts();
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  loadStores() {
    this._StoreService.getAllStores().subscribe({
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
    this.loadProducts(this.selectedStore);

  }
  selectedCurrency: any;
  onCurrencyChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;

    this.selectedCurrency = selectedValue;
  }

  loadProducts(storeId: string) {
    this._ProductBranchStoresService.getByStoreId(storeId
      , this.ProductsearchQuery
    ).subscribe({
      next: (response) => {
        if (response) {
          this.Products = response.data.products;
          this.totalProducts = response.data.meta.total;
          this.filteredProducts = this.Products;

          console.log(this.ProductsearchQuery);
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts(this.selectedStore);
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
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

  createItem(): FormGroup {
    return this.fb.group({
      amount: [null, Validators.required],
      product_id: ['', Validators.required],
      product: [null],
      need_serial: [false],
      barcode: [null],
      color: [null],
      productSerialNumbers: [[]],
      serialNumbers: [[]],
      neededSerialNumbers: [0],
    });
  }
  searchTerm = new FormControl('');

  onBarcodeSelect(barcode: Event, index: number) {
    {
      const selectedValue = (barcode.target as HTMLSelectElement).value;
      const items = this.saleForm.get('items') as FormArray;
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
    const items = this.saleForm.get('items') as FormArray;
    const item = items.at(index) as FormGroup;
    const neededBars = item.get('neededSerialNumbers')?.value;
    const serialNumbers = item.get('serialNumbers')?.value;
    if (serialNumbers && Array.isArray(serialNumbers)) {
      const tempList = serialNumbers.filter(item => item.serial_number !== serialNumber);
      item.patchValue({ serialNumbers: tempList });
      item.patchValue({ neededSerialNumbers: neededBars + 1 });
    }
  }
  addParcode(index: number) {
    const items = this.saleForm.get('items') as FormArray;
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


  onAmountChange(index: number): void {

    const items = this.saleForm.get('items') as FormArray;
    const item = items.at(index) as FormGroup;
    let amount = item.get('amount')?.value || 0;
    const stock = item.get('product')?.value.stock;
    const serialNumbers = item.get('serialNumbers')?.value.length || 0;

    if (amount > stock) {
      amount = stock;
      item.patchValue({ amount: stock });
    }



    if (item.get('product')?.value?.need_serial_number) {
      if (typeof amount === 'number' && amount >= 0) {
        item.patchValue({ neededSerialNumbers: amount - serialNumbers })

      } else {
        console.warn('Invalid amount:', amount);
      }
    }
  }
  payedAmount() {
    if ((this.saleForm.get('payed_price')?.value || 0) > this.total) {
      this.saleForm.patchValue({ payed_price: this.total });
    }
    this.totalPayed = (this.saleForm.get('payed_price')?.value || 0);
  }
  paymentTriggerChange() {
    if (!this.saleForm.get('showCashAccountsDropdown')?.value) {
      this.totalPayed = 0;
    } else {
      this.totalPayed = (this.saleForm.get('payed_price')?.value || 0);
    }
  }

  disableInput(itemIndex: number, inputIndex: number): void {
    const items = this.saleForm.get('items') as FormArray;
    const item = items.at(itemIndex) as FormGroup;
    const dynamicInputs = item.get('dynamicInputs') as FormArray<FormControl>;

    const control = dynamicInputs.at(inputIndex);
    if (control) control.disable();
  }


  getDynamicInputs(item: AbstractControl): FormArray {
    return (item.get('dynamicInputs') as FormArray);
  }





  get items() {
    return (this.saleForm.get('items') as FormArray);
  }


  addItem(): void {
    this.items.push(this.createItem());
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  onPaymentTypeChange(event: Event) {

  }
  handleForm() {
    this.isSubmited = true;
    if (this.saleForm.get('payment_type')?.value == 'cash' && this.selectedClient && this.needCurrecyPrice && !this.saleForm.get('currency_price_value')?.value) {
      this.toastr.error('يجب ادخال سعر الصرف');
      return;
    }

    if (this.items && this.items.controls) {
      this.items.controls.forEach((itemControl, index) => {
      const itemValue = itemControl.value;
      });
    }

    if (this.saleForm.valid) {
      this.isLoading = true;
      let error = false;
      const formData = new FormData();

      if (this.saleForm.get('showCashAccountsDropdown')?.value) {
        if (this.saleForm.get('cash_id')?.value && this.saleForm.get('payment_type')?.value == 'cash') {
          formData.append('payed_to_account_id', this.saleForm.get('cash_id')?.value);
          formData.append('payment_type', 'cash');
        } else if (this.saleForm.get('check_id')?.value && this.saleForm.get('payment_type')?.value == 'check') {
          formData.append('payment_type', 'check');
          formData.append('check_id', this.saleForm.get('check_id')?.value);
        }
      }



      if (this.saleForm.get('currency_price_value')?.value) {
        formData.append('currency_price_value', this.saleForm.get('currency_price_value')?.value);
      }

      formData.append('client_id', this.saleForm.get('vendor_id')?.value);
      if (this.selecteddelegateAccount) {
        formData.append('delegate_id', this.saleForm.get('delegate_id')?.value || '');
      }
      formData.append('store_id', this.saleForm.get('store_id')?.value);
      formData.append('invoice_date', this.saleForm.get('date')?.value);
      formData.append('delegate_id', this.saleForm.get('delegate_id')?.value || '');

      formData.append('total', this.total.toString());
      formData.append('total_payed', this.totalPayed.toString());


      formData.append('notes', this.saleForm.get('notes')?.value || '');
      formData.append('date', this.saleForm.get('invoice_date')?.value);



      if (this.items && this.items.controls) {
        this.items.controls.forEach((itemControl, index) => {
          const itemValue = itemControl.value;
          if (itemValue.neededSerialNumbers > 0) {
            this.toastr.error('يجب ادخال كل السيريا المطلوب');
            error = true;
            return;
          }

          if (itemValue) {
            formData.append(`items[${index}][product_branch_id]`, itemValue.product_id);
            formData.append(`items[${index}][quantity]`, itemValue.amount || '0');
            formData.append(`items[${index}][price]`, itemValue.price || '0');


            if (itemValue.overridePrice) {
              formData.append(`items[${index}][has_overrided_price]`, '1');
            } else {
              formData.append(`items[${index}][has_overrided_price]`, '0');
            }
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

        this._SaleOrdersService.addSaleOrder(formData).subscribe({
          next: (response) => {
            if (response) {
              this.toastr.success('تم اضافه الفاتوره بنجاح');
              console.log(response);
              this.isLoading = false;
              this._Router.navigate(['/dashboard/sale-order']);
            }
          },

          error: (err: HttpErrorResponse) => {
            this.isLoading = false;
            this.msgError = [];
            this.toastr.error('حدث خطا اثناء اضافه الفاتوره');
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
    }  else {
      Object.keys(this.saleForm.controls).forEach((key) => {
        const control = this.saleForm.get(key);
        if (control && control.invalid) {
          console.log(`Invalid Field: ${key}`, control.errors);
        }
      });
    }
  }

  filteredAccounts: any[] = [];
  selectedPopUP: string = '';
  searchQuery: string = '';
  selectedCashAccount: Account | null = null;
  selecteddelegateAccount: Account | null = null;
  selectedClient: any | null = null;


  removeCurrentDelegate() {
    this.selecteddelegateAccount = null;
  }
  onCheckSearchChange() {

  }

  selectcheck(check: any) {
    this.saleForm.patchValue({ 'check_id': check.id })
    this.selectedCheck = check;
    this.closeModal('checkModel');
  }
  closeModal(modalId: string) {
    this.searchQuery ='';
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }


  openModal(modalId: string, type: string) {
    this.searchQuery ='';

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
      // this.loadCashAccounts();
    } else if (this.selectedPopUP == 'delegate') {
      this.loadDelegates();
    } else if (this.selectedPopUP == 'vendor') {
      this.loadSuppliers();
    }

  }



  selectAccount(account: Account) {

    if (this.selectedPopUP == 'cash') {
      this.selectedCashAccount = account;
      this.saleForm.patchValue({ 'cash_id': account.id })


    } else if (this.selectedPopUP == 'delegate') {
      this.selecteddelegateAccount = account;
      this.saleForm.patchValue({ 'delegate_id': account.id })

    } else if (this.selectedPopUP == 'vendor') {


      this.selectedClient = account;
      this.saleForm.patchValue({ 'vendor_id': this.selectedClient.account.id });
      console.log('selectedClient', this.selectedClient);

      if(this.selectedClient.delegate){
        this.selecteddelegateAccount= this.selectedClient.delegate;
        this.saleForm.patchValue({ 'delegate_id': this.selectedClient.delegate.id })
      }

    }


    this.cdr.detectChanges();
    this.closeModal('shiftModal');
  }

  filteredProducts: any;
  ProductsearchQuery = '';
  selectedProduct: any;
  onProductSearchChange() {
    this.loadProducts(this.selectedStore);
  }


  getSerialNumbers(productId: string, storeId: string, index: number) {
    this._ProductsService.getSerialNumbers(productId, storeId).subscribe({
      next: (response) => {
        if (response) {
          this.serialNumber = response.data;
          const itemsArray = this.saleForm.get('items') as FormArray;
          const itemGroup = itemsArray.at(this.productIndex) as FormGroup;
          itemGroup.patchValue({ productSerialNumbers: this.serialNumber });

          console.log('serial numbers', this.serialNumber);

        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }


  selectProduct(productBranchStore: any) {
    const itemsArray = this.saleForm.get('items') as FormArray;
    const itemGroup = itemsArray.at(this.productIndex) as FormGroup;

    itemGroup.patchValue({ product: productBranchStore.product });
    console.log('productBranchStore', productBranchStore);
    itemGroup.patchValue({ product_id: productBranchStore.branch.id });
    itemGroup.patchValue({ color: productBranchStore.branch.color });
    this.getSerialNumbers(productBranchStore.product.id, this.selectedStore, this.productIndex);
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



  updateAccounts(){

      const type =  this.selectedPopUP;
      if (type == 'cash') {
        this.filteredAccounts = this.cashAccounts;
      } else if (type == 'delegate') {
        this.filteredAccounts = this.delegates;
      } else if (type == 'vendor') {
        this.filteredAccounts = this.vendors;
      }

  }


searchText: string = '';
selectedSerachIndex = -1;
lastSelectedIndex = -1;



productSerialNumbers :any = [];
loadingSerialNumbers = false;

searchSerialNumber(event:Event , index:number){
  this.searchText = (event.target as HTMLSelectElement).value;
  this.selectedSerachIndex = index;
  const itemsArray = this.saleForm.get('items') as FormArray;

  const itemGroup = itemsArray.at(index) as FormGroup;
  const store_id  = this.saleForm.get('store_id')?.value;
  const productId = itemGroup.get('product')?.value?.id;

  if(store_id && productId){
    // this.productSerialNumbers = [];
    this.loadSerialNumbers(store_id ,productId);
  }
}

onFocus(index :number){
  const itemsArray = this.saleForm.get('items') as FormArray;
  this.selectedSerachIndex = index;

  const itemGroup = itemsArray.at(index) as FormGroup;
  const store_id  = this.saleForm.get('store_id')?.value;
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
    const items = this.saleForm.get('items') as FormArray;
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
    'sale'
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




//   isOptionDisabled(option: any , index:number): boolean {
//   // Example condition: disable if already used or expired
//   return option.isUsed || option.status === 'expired';
// }

  isOptionDisabled(serialNumber:any , index:number): boolean {
    const items = this.saleForm.get('items') as FormArray;
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
  account: Account;
  currency: Currency
}



interface Currency {
  id: string;
  name: string;
}

interface SerialNumber {
  serialNumber: string;

}