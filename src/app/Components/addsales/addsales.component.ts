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

  /////  keyboard short cuts 

  import {  ElementRef, QueryList, ViewChild, ViewChildren, HostListener, AfterViewInit } from '@angular/core';

  /////  keyboard short cuts 

// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-addsales',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, TranslateModule ],
  templateUrl: './addsales.component.html',
  styleUrl: './addsales.component.css'
})
export class AddsalesComponent implements OnInit {


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
  selectedStoreObject :any;
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
    private _ProductBranchesService: ProductBranchesService,
    private _ClientService: ClientService,
    private _ProductBranchStoresService: ProductBranchStoresService,
    private _SaleOrdersService: SaleOrdersService,

    private _AccountService: AccountService,
    private _SalesService: SalesService,
    private _Router: Router,
    private cdr: ChangeDetectorRef,
    private _CheckService: CheckService,
    private toastr: ToastrService,

  ) {
    this.saleForm = this.fb.group({
      invoice_date: [this.getTodayDate()],
      payed_price: [null],
      vendor_id: ['', Validators.required],
      store_id: ['', Validators.required],
      payment_type: ['cash'],
      check_id: [''],
      tax_type: 'included',
      delegate_id: [null],
      currency_price_value: [null],
      items: this.fb.array([this.createItem()]),
      supplier_id: [null],
      cash_id: [null],
      notes: [''],
      showCashAccountsDropdown: [false],
    });
    this.dynamicInputs = this.fb.array([]);
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
          // console.log('here')
          this.toastr.error('يجب اختيار عملة اساسية قبل القيام بأى عملية شراء او بيع');
          // alert('يجب اختيار عملة اساسية قبل القيام بأى عملية شراء او بيع')
          this._Router.navigate(['/dashboard/currency']);

        }
        console.log(err);
      }
    });
  }


  currencyPrice() {
    const currencyPriceValue = this.saleForm.get('currency_price_value')?.value || 0;
    this.currencyPriceValue = currencyPriceValue;
    this.onPrice();
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
    this.loadStores();
    this.loadSuppliers();
    this.loadDelegates();
    this.loadCashAccounts();
    this.loadChecks();
    this.loadDefaultCurrency();
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
  loadCashAccounts(): void {
    this._AccountService.getAccountsByParent('111'
      ,this.searchQuery
    ).subscribe({
      next: (response) => {
        if (response) {
          console.log("CashAccounts", response)
          const cashAccounts = response.data.accounts;
          this.updateAccounts();
          this.cashAccounts = cashAccounts;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });

  }
storeSearchTerm = '';
  loadStores() {
    this._StoreService.getAllStores(
      'store',
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
  //   this.loadProducts(this.selectedStore);

  // }
  selectedCurrency: any;
  onCurrencyChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;

    this.selectedCurrency = selectedValue;
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


    selectStore(store: any) {
    this.selectedStore = store;
    this.selectedStore = store.id;
    this.loadProducts(this.selectedStore);
    this.selectedStoreObject = store;
  this.saleForm.patchValue({ store_id: store.id });

    // this.purchasesBillForm.patchValue({ store_id: store.id });
    this.closeModal('storeModal');
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

  createItem(amount:number|null = null ,serialNumbers : string[] = []): FormGroup {
    return this.fb.group({
      amount: [amount, Validators.required],
      overridePrice: [false],
      price: ['', Validators.required],
      priceRanges: [[]],
      product_id: ['', Validators.required],
      product: [null],
      need_serial: [false],
      barcode: [null],
      color: [null],
      productSerialNumbers: [serialNumbers],
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
  addParcode(index: number , givenBarcode:any) {
    const items = this.saleForm.get('items') as FormArray;
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
    const priceRanges = item.get('priceRanges')?.value || [];
    priceRanges.forEach((price: any) => {
      console.log('quantity_from', price.quantity_from);
      console.log('quantity_to', price.quantity_to);

      console.log('amount', amount);
      if (price.quantity_from < amount && price.quantity_to >= amount) {
        item.patchValue({ price: price.price });
      }
    })
    if (item.get('product')?.value?.need_serial_number) {
      if (typeof amount === 'number' && amount >= 0) {
        item.patchValue({ neededSerialNumbers: amount - serialNumbers })

      } else {
        console.warn('Invalid amount:', amount);
      }
    }


  

    this.onPrice();

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



  onPrice() {
    this.total = 0;
    this.items.controls.forEach((itemControl) => {
      const itemValue = itemControl.value;
      console.log('amount', itemValue.amount);
      console.log('price', itemValue.price);
      const currencyPrice = this.saleForm.get('currency_price_value')?.value;

      if (itemValue) {
        if (currencyPrice) {
          if (this.needCurrecyPrice && currencyPrice > 0) {
            this.total += +(((itemValue.amount || 0) * (itemValue.price || 0) / currencyPrice).toFixed(2));
          }
        } else {
          this.total += (itemValue.amount || 0) * (itemValue.price || 0);
        }
      }
    });
  }

  getFormattedPrice(item: any): number {
    const price = item.get('price')?.value || 0;
    const currencyValue = this.saleForm.get('currency_price_value')?.value || 0;

    if (this.needCurrecyPrice && currencyValue > 0) {
      return +(price / currencyValue).toFixed(2);
    }

    return price;

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

  showselectOrder =false;
  onFileTypeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.showselectOrder = value === 'sale_order';

   }

  addItem(data:any|null = null): void {

    if(data){

    this.items.push(this.createItem(data.quantity));

    // selectProduct
    const index = this.items.length - 1;

    
    this.selectProduct(data , index);
    this.onAmountChange(index);
    if(data.serialNumbers){
      data.serialNumbers.forEach((element:any) => {
        this.addParcode(index , element);
      });
    }

    }else{
    this.items.push(this.createItem());
    }
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
        // console.log('value:', itemValue);          
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

        if(this.showselectOrder && this.selectedOrderId){
            formData.append('sale_order_id', this.selectedOrderId);
          }



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

        this._SalesService.addSale(formData).subscribe({
          next: (response) => {
            if (response) {
              this.toastr.success('تم اضافه الفاتوره بنجاح');
              console.log(response);
              this.isLoading = false;
              this._Router.navigate(['/dashboard/sales/waiting']);
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
     this.currentModalId = null;
  this.isModalOpen = false;
    this.searchQuery ='';
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
      setTimeout(() => {
    this.updateFocusableElements();
    this.currentFocusIndex = 0;
    this.focusCurrentElement();
  }, 100);
  }




  openModal(modalId: string, type: string) {
    this.searchQuery ='';
    this.currentModalId = modalId;
    this.isModalOpen = true;

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

    setTimeout(() => {
    this.updateFocusableElements();
    this.currentFocusIndex = 0;
    this.focusCurrentElement();
    }, 100);
  }



  onSearchChange() {
    if (this.selectedPopUP == 'cash') {
      this.loadCashAccounts();
    } else if (this.selectedPopUP == 'delegate') {
      this.loadDelegates();
    } else if (this.selectedPopUP == 'vendor') {
      this.loadSuppliers();
    }

  }



  selectAccount(account: Account) {

    this.onPrice();
    if (this.selectedPopUP == 'cash') {
      this.selectedCashAccount = account;
      this.saleForm.patchValue({ 'cash_id': account.id })

      this.needCurrecyPrice = false;
      this.forignCurrencyName = '';
      if (this.currency.id != account.currency.id) {
        this.needCurrecyPrice = true;
        this.forignCurrencyName = account.currency.name;

      }

      if (this.selectedClient) {
        if (this.selectedClient.account.currency.id != this.currency.id) {
          this.needCurrecyPrice = true;
          this.forignCurrencyName = this.selectedClient.account.currency.name;

        }
      }



    } else if (this.selectedPopUP == 'delegate') {
      this.selecteddelegateAccount = account;
      this.saleForm.patchValue({ 'delegate_id': account.id })

    } else if (this.selectedPopUP == 'vendor') {


      this.selectedClient = account;
      this.saleForm.patchValue({ 'vendor_id': this.selectedClient.account.id });
      console.log('selectedClient', this.selectedClient);
      this.loadOrders();

      if(this.selectedClient.delegate){
        this.selecteddelegateAccount= this.selectedClient.delegate;
        this.saleForm.patchValue({ 'delegate_id': this.selectedClient.delegate.id })
      }

      this.needCurrecyPrice = false;
      this.forignCurrencyName = '';


      if (this.currency.id != account.account.currency.id) {
        this.needCurrecyPrice = true;
        this.forignCurrencyName = account.account.currency.name;

      }

      if (this.selectedCashAccount) {
        if (this.selectedCashAccount.currency.id != this.currency.id) {
          this.needCurrecyPrice = true;
          this.forignCurrencyName = this.selectedCashAccount.currency.name;

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
    this.loadProducts(this.selectedStore);
  }


  getSerialNumbers(productId: string, storeId: string, index: number) {
    console.log('productId', productId);
    console.log('storeId', storeId);
    this._ProductsService.getSerialNumbers(productId, storeId).subscribe({
      next: (response) => {
        if (response) {
          this.serialNumber = response.data.serial_numbers;
          const itemsArray = this.saleForm.get('items') as FormArray;
          const itemGroup = itemsArray.at(index) as FormGroup;
          itemGroup.patchValue({ productSerialNumbers: this.serialNumber });

          console.log('serial numbers', this.serialNumber);

        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }


  selectProduct(productBranchStore: any , index:number|null = null) {
    const itemsArray = this.saleForm.get('items') as FormArray;
    const itemGroup = itemsArray.at(index != null ? index :this.productIndex) as FormGroup;

    itemGroup.patchValue({ product: productBranchStore.product });
    console.log('productBranchStore', productBranchStore);
    itemGroup.patchValue({ product_id: productBranchStore.branch.id });
    itemGroup.patchValue({ color: productBranchStore.branch.color });


    productBranchStore.prices.forEach((price: any) => {

      if (price.id == this.selectedClient.price_category?.id) {
        itemGroup.patchValue({ priceRanges: price.prices });
        console.log('price ranges', price.prices);
        price.prices.forEach((price: any) => {
          if (price.quantity_from == 0) {
            itemGroup.patchValue({ price: price.price });
            return;
          }
        })
      }


    });


    if (!itemGroup.get('price')?.value) {
      itemGroup.patchValue({ price: productBranchStore.branch.default_price });
    }

    // console.log(productBranchStore.product.id, this.selectedStore, index != null ? index :this.productIndex );

    // this.getSerialNumbers(productBranchStore.product.id, this.selectedStore, index ? index :this.productIndex);



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














   saleOrders :any;

orderSearchDate = this.getTodayDate();

   loadOrders() {
    if(this.selectedClient){
    this._SaleOrdersService.getAllSaleOrdersForPopup(
          '',
            this.selectedClient.account.id ,
            this.orderSearchDate
        ).subscribe({
          next: (response) => {
            if (response) {
              this.saleOrders = response.data.bills;
              console.log('my data::', response,this.selectedClient.id,this.orderSearchDate);
            }
          },
          error: (err) => {
            console.error(err);
          },
        });
      }
    }
    

selectedOrderId = '';
    loadOrderById(id:string) {
    this._SaleOrdersService.getSaleOrderById(id).subscribe({
          next: (response) => {
            if (response) {


              this.items.clear();
  this.selectedOrderId = id;
   this.selectedStore = response.data.store.id;

              console.log('my store_id' ,this.selectedStore);
              this.saleForm.patchValue({store_id: this.selectedStore});
              console.log(response)
              response.data.items.forEach((item :any)=>{
              this.addItem(item);

              });
           
            }
          },
          error: (err) => {
            console.error(err);
          },
        });
      
    }
    


onSaleOrderSearchChange(){
  this.loadOrders();

}

selectSaleOrder(order:any){
  this.loadOrderById(order.id);
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




  /////  keyboard short cuts 


  // @ViewChild('formRoot') formRoot!: ElementRef;
  // // All form fields (input, select, button, etc.)
  // @ViewChildren('field') fields!: QueryList<ElementRef>;

  // private currentFocusIndex = 0;

  // ngAfterViewInit() {
  //   setTimeout(() => this.setInitialFocus(), 0);
  // }

  //   private getFocusableElements(): HTMLElement[] {
  //   if (!this.formRoot) return [];
  //   const formElement = this.formRoot.nativeElement as HTMLElement;
  //   return Array.from(formElement.querySelectorAll('[data-focusable="true"]')) as HTMLElement[];
  // }

  // private setInitialFocus(index: number = 0) {
  //   const elements = this.getFocusableElements();
  //   if (elements[index]) {
  //     elements[index].focus();
  //     this.currentFocusIndex = index;
  //   }
  // }



  // @HostListener('document:keydown', ['$event'])
  // handleKeydown(event: KeyboardEvent) {
  //   const focusables = this.getFocusableElements();
  //   console.log(event)
  //   if (!focusables.length) return;

  //   const targetInsideForm = this.formRoot.nativeElement.contains(event.target);
  //   if (!targetInsideForm) return;

  //   // Custom key mapping
  //   if (event.key === 's') {
  //     event.preventDefault();
  //     this.moveFocus(1);
  //   } else if (event.key === 'w') {
  //     event.preventDefault();
  //     this.moveFocus(-1);
  //   } else if (event.key === 'Enter') {
  //     event.preventDefault();
  //     this.activateElement(focusables[this.currentFocusIndex]);
  //   }
  // }

  // private moveFocus(direction: number) {
  //   const focusables = this.getFocusableElements();
  //   if (!focusables.length) return;

  //   this.currentFocusIndex =
  //     (this.currentFocusIndex + direction + focusables.length) % focusables.length;

  //   focusables[this.currentFocusIndex]?.focus();
  // }

  // private activateElement(element: HTMLElement) {
  //   const tag = element.tagName;
  //   if (tag === 'BUTTON') {
  //     element.click();
  //   } else if (tag === 'SELECT') {
  //     element.focus(); // Or simulate "open" if needed
  //   }
  // }


  // Add these to your component class

private currentFocusIndex = 0;
private focusableElements: HTMLElement[] = [];
private isModalOpen = false;
private currentModalId: string | null = null;

ngAfterViewInit() {
  this.initializeKeyboardNavigation();
}

private initializeKeyboardNavigation() {
  setTimeout(() => {
    this.updateFocusableElements();
    if (this.focusableElements.length > 0) {
      this.focusCurrentElement();
    }
  }, 0);
}
// private updateFocusableElements() {
//   const rootElement = this.currentModalId 
//     ? document.getElementById(this.currentModalId)
//     : this.formRoot?.nativeElement;

//   if (!rootElement) return;

//   // Cast NodeListOf<Element> to Array<HTMLElement>
//   this.focusableElements = Array.from(
//     rootElement.querySelectorAll<HTMLElement>(
//       'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
//     )
//   ).filter((el: HTMLElement) => {
//     const style = getComputedStyle(el as Element);
//     return !el.hasAttribute('disabled') && 
//            style.display !== 'none' &&
//            style.visibility !== 'hidden';
//   });
// }
@ViewChild('formRoot', { static: false }) formRoot!: ElementRef<HTMLElement>;
private updateFocusableElements() {
  const rootElement = this.currentModalId 
    ? document.getElementById(this.currentModalId)
    : this.formRoot?.nativeElement;

  if (!rootElement) return;

  // Cast NodeListOf<Element> to Array<HTMLElement>
  this.focusableElements = Array.from(
    rootElement.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el: HTMLElement) => {
    const style = getComputedStyle(el as Element);
    return !el.hasAttribute('disabled') && 
           style.display !== 'none' &&
           style.visibility !== 'hidden';
  });
}

private activateCurrentElement() {
  const element = this.focusableElements[this.currentFocusIndex];
  if (!element) return;

  if (element.tagName === 'BUTTON') {
    (element as HTMLButtonElement).click();
  } else if (element.tagName === 'INPUT' && 
             (element as HTMLInputElement).type === 'checkbox') {
    const input = element as HTMLInputElement;
    input.checked = !input.checked;
    // Trigger change event if needed
    input.dispatchEvent(new Event('change'));
  } else {
    element.click();
  }
}

private focusCurrentElement() {
  if (this.focusableElements[this.currentFocusIndex]) {
    this.focusableElements[this.currentFocusIndex].focus();
  }
}

@HostListener('document:keydown', ['$event'])
handleKeydown(event: KeyboardEvent) {
  // Ignore if typing in an input/textarea
  const target = event.target as HTMLElement;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
    if (event.key === 'Escape') {
      if (this.currentModalId) {
        this.closeModal(this.currentModalId);
      }
    }
    return;
  }

  // Global shortcuts (work anywhere)
  switch (event.key) {
    case 'F1':
      event.preventDefault();
      this.addItem();
      break;
    case 'F2':
      event.preventDefault();
      this.handleForm();
      break;
  }

  // Form navigation
  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      event.preventDefault();
      this.moveFocus(1);
      break;
    case 'ArrowUp':
    case 'ArrowLeft':
      event.preventDefault();
      this.moveFocus(-1);
      break;
    case 'Enter':
      event.preventDefault();
      this.activateCurrentElement();
      break;
    case 'Tab':
      event.preventDefault();
      if (event.shiftKey) {
        this.moveFocus(-1);
      } else {
        this.moveFocus(1);
      }
      break;
    case 'Escape':
      if (this.currentModalId) {
        this.closeModal(this.currentModalId);
      }
      break;
  }
}

private moveFocus(direction: number) {
  this.currentFocusIndex = 
    (this.currentFocusIndex + direction + this.focusableElements.length) % 
    this.focusableElements.length;
  this.focusCurrentElement();
}

// private activateCurrentElement() {
//   const element = this.focusableElements[this.currentFocusIndex];
//   if (!element) return;

//   if (element.tagName === 'BUTTON') {
//     element.click();
//   } else if (element.tagName === 'INPUT' && element.type === 'checkbox') {
//     (element as HTMLInputElement).checked = !(element as HTMLInputElement).checked;
//   } else {
//     element.click(); // Fallback for other elements
//   }
// }

// Modify your modal open/close methods


// Add these shortcuts for common actions
@HostListener('document:keydown.control.n', ['$event'])
addNewItemShortcut(event: KeyboardEvent) {
  event.preventDefault();
  this.addItem();
}

@HostListener('document:keydown.control.s', ['$event'])
saveFormShortcut(event: KeyboardEvent) {
  event.preventDefault();
  this.handleForm();
}

@HostListener('document:keydown.escape', ['$event'])
closeModalShortcut(event: KeyboardEvent) {
  if (this.currentModalId) {
    event.preventDefault();
    this.closeModal(this.currentModalId);
  }
}

    /////  keyboard short cuts 


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