import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { StoreService } from '../../shared/services/store.service';
import { CurrencyService } from '../../shared/services/currency.service';
import { ProductsService } from '../../shared/services/products.service';
import { ProductBranchesService } from '../../shared/services/product_branches.service';
import { ClientService } from '../../shared/services/client.service';
import { ProductBranchStoresService } from '../../shared/services/product-branch-stores.service';
import { AccountService } from '../../shared/services/account.service';
import { SalesService } from '../../shared/services/sales.service';
import { Router } from '@angular/router';
import { CheckService } from '../../shared/services/check.service';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-add-return-sales',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, TranslateModule],
  templateUrl: './add-return-sales.component.html',
  styleUrl: './add-return-sales.component.css'
})
export class AddReturnSalesComponent implements OnInit {


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
  selectedCheck: any;
  total = 0;
  totalPayed = 0;
  currencyPriceValue: number = 0;

  constructor(private fb: FormBuilder,
    private _StoreService: StoreService,
    private _CurrencyService: CurrencyService,
    private _ProductsService: ProductsService,
    private _ProductBranchesService: ProductBranchesService,
    private _ClientService: ClientService,
    private _ProductBranchStoresService: ProductBranchStoresService,

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
    this._ClientService.getClientsForSales().subscribe({
      next: (response) => {
        if (response) {
          console.log("suppliers", response)
          this.vendors = response.data.clients;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  loadDelegates(): void {
    this._AccountService.getAccountsByParent('623').subscribe({
      next: (response) => {
        if (response) {
          console.log("delegates", response)
          const delegates = response.data;
          delegates.forEach((account: { hasChildren: any; id: any; }) => {
            account.hasChildren = delegates.some((childAccount: { parent_id: any; }) => childAccount.parent_id === account.id);
          });

          this.delegates = delegates;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  loadCashAccounts(): void {
    this._AccountService.getAccountsByParent('111').subscribe({
      next: (response) => {
        if (response) {
          console.log("CashAccounts", response)
          const cashAccounts = response.data;
          cashAccounts.forEach((account: { hasChildren: any; id: any; }) => {
            account.hasChildren = cashAccounts.some((childAccount: { parent_id: any; }) => childAccount.parent_id === account.id);
          });

          this.cashAccounts = cashAccounts;
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
    this._ProductBranchStoresService.getByStoreId(storeId).subscribe({
      next: (response) => {
        if (response) {
          this.Products = response.data.products;

          console.log('product branches', this.Products);
          this.filteredProducts = this.Products;
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  createItem(): FormGroup {
    return this.fb.group({
      amount: [null, Validators.required],
     
      price: ['', Validators.required],
      priceRanges: [[]],
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
      const tempList = serialNumbers.filter(item => item.barcode !== serialNumber);
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
            formData.append(`items[${index}][has_overrided_price]`, '0');
            const serialNumbers = itemControl.get('serialNumbers')?.value;

            if (serialNumbers.length > 0) {

              serialNumbers.forEach((item: any, internalIndex: number) => {
                formData.append(`items[${index}][serial_numbers][${internalIndex}][serial_number]`, item.barcode);

              });

            }





          }
        });
      }


      if (!error) {

        this._SalesService.addReturnSales(formData).subscribe({
          next: (response) => {
            if (response) {
              this.toastr.success('تم اضافه الفاتوره بنجاح');
              console.log(response);
              this.isLoading = false;
              this._Router.navigate(['/dashboard/return-sales/waiting']);
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
    } else {
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
    //  this.entryForm.patchValue({'delegate_id':null});
  }
  onCheckSearchChange() {

  }

  selectcheck(check: any) {
    this.saleForm.patchValue({ 'check_id': check.id })
    this.selectedCheck = check;
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
      // this.popUpIndex = index;
      // const entryItem = this.entryForm.get('entryItems') as FormArray;
      if (type == 'cash') {
        this.filteredAccounts = this.cashAccounts;
      } else if (type == 'delegate') {
        this.filteredAccounts = this.delegates;
      } else if (type == 'vendor') {
        this.filteredAccounts = this.vendors;

      }


    }

    // console.log('hrerererer');
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }



  onSearchChange() {


    if (this.selectedPopUP == 'cash') {
      this.filteredAccounts = this.cashAccounts.filter(account =>
        account.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );

    } else if (this.selectedPopUP == 'delegate') {
      this.filteredAccounts = this.delegates.filter(account =>
        account.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else if (this.selectedPopUP == 'vendor') {
      this.filteredAccounts = this.vendors.filter(account =>
        account.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
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

    }  else if (this.selectedPopUP == 'vendor') {


      this.selectedClient = account;
      this.saleForm.patchValue({ 'vendor_id': this.selectedClient.account.id });
      console.log('selectedClient', this.selectedClient);

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
    const query = this.ProductsearchQuery.toLowerCase();
    this.filteredProducts = this.Products.filter(product =>
      product.product_branch.product.name.toLowerCase().includes(query) || product.product_branch.code.toString().includes(query) || product.product_branch.stock.toString().includes(query)
    );

  }


  getSerialNumbers(productId: string, storeId: string, index: number) {
    console.log('productId', productId);
    console.log('storeId', storeId);
    this._ProductsService.getSerialNumbersForReturnSales(productId, storeId).subscribe({
      next: (response) => {
        if (response) {
          this.serialNumber = response.data;
          const itemsArray = this.saleForm.get('items') as FormArray;
          const itemGroup = itemsArray.at(this.productIndex) as FormGroup;
          itemGroup.patchValue({ productSerialNumbers: this.serialNumber });

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