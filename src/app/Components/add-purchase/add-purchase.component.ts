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

@Component({
  selector: 'app-add-purchase',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, TranslateModule],
  templateUrl: './add-purchase.component.html',
  styleUrl: './add-purchase.component.css'
})
export class AddPurchaseComponent implements OnInit {

  private productSubscription: Subscription = Subscription.EMPTY;
  isSubmited = false;
  serialNumber: SerialNumber[] = [];
  purchasesBillForm: FormGroup;
  Products: any[] = [];
  msgError: any[] = [];
  isLoading: boolean = false;
  currencies: any;
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

  constructor(private fb: FormBuilder,
    private _StoreService: StoreService,
    private _CurrencyService: CurrencyService,
    private _ProductsService: ProductsService,
    private _AccountService: AccountService,
    private _PurchasesService: PurchasesService,
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
      // currency_id: ['', Validators.required],
      payment_type: ['cash'],
      check_id: [''],
      items: this.fb.array([this.createItem()]),
      supplier_id: [null],
      cash_id: [null],
      notes: [''],
      showCashAccountsDropdown: [false],
    });
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

    this.loadProducts();
    this.loadDefaultCurrency();
    this.loadStores();
    this.loadSuppliers();
    this.loadCashAccounts();
    this.loadChecks();
  }

  currencyPriceValue: number = 0;

  currencyPrice(){


    const currencyPriceValue = this.purchasesBillForm.get('currency_price_value')?.value || 0;
    this.currencyPriceValue = currencyPriceValue;
    if ((currencyPriceValue * this.totalPayed) > this.total) {
      this.purchasesBillForm.patchValue({ payed_price: this.total / currencyPriceValue });
    }

    if(this.currencyPriceValue>0){
      this.totalPayed = (this.purchasesBillForm.get('payed_price')?.value || 0) * this.currencyPriceValue; 
    }
  }




  loadDefaultCurrency() {
    this._CurrencyService.getDefultCurrency().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.currencies = response.data;
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
  loadSuppliers(): void {
    this._AccountService.getAccountsByParent('621').subscribe({
      next: (response) => {
        if (response) {
          console.log("suppliers", response)
          const Suppliers = response.data;
          Suppliers.forEach((account: { hasChildren: any; id: any; }) => {
            account.hasChildren = Suppliers.some((childAccount: { parent_id: any; }) => childAccount.parent_id === account.id);
          });

          this.vendors = Suppliers;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  // loadDelegates(): void {
  //   this._AccountService.getAccountsByParent('623').subscribe({
  //     next: (response) => {
  //       if (response) {
  //         console.log("delegates",response)
  //         const delegates = response.data;
  //         delegates.forEach((account: { hasChildren: any; id: any; }) => {
  //           account.hasChildren = delegates.some((childAccount: { parent_id: any; }) => childAccount.parent_id === account.id);
  //         });

  //         this.delegates = delegates;
  //       }
  //     },
  //     error: (err) => {
  //       console.error(err);
  //     }
  //   });
  // }
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

  // onTypeChange(event: Event): void {


  //   const selectedValue = (event.target as HTMLSelectElement).value;

  //   this.selectedType = selectedValue;
  //   console.log(selectedValue);
  //   const itemsArray = this.purchasesBillForm.get('items') as FormArray;

  //   itemsArray.clear();
  //   if (this.selectedStore){
  //     // this.loadProducts(this.selectedStore);

  //   }

  // }
  onStoreChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedStore = selectedValue;
  }
  // selectedCurrency:any;
  // onCurrencyChange(event: Event): void {
  //   const selectedValue = (event.target as HTMLSelectElement).value;

  // this.selectedCurrency = selectedValue;
  // }



  loadProducts() {

    this._ProductsService.getProductsForOperations().subscribe({
      next: (response) => {
        if (response) {
          this.Products = response.data;
          console.log('products', response);
          this.filteredProducts = this.Products;
        }
      },
      error: (err) => {
        console.error(err);
      },
    });


  }



  // onProductChange(event: Event, index: number): void {
  //   const selectedProductId = (event.target as HTMLSelectElement).value;

  //   const itemsArray = this.purchasesBillForm.get('items') as FormArray;
  //   const itemGroup = itemsArray.at(index) as FormGroup;
  //   if (this.selectedType == 'purchase'){

  //   }

  // }



  // getGroupedDeterminants(productDeterminants: any[]): any[] {
  //   const grouped = new Map();
  //   productDeterminants.forEach((item) => {
  //     if (!grouped.has(item.determinant.id)) {
  //       grouped.set(item.determinant.id, {
  //         determinantId: item.determinant.id,
  //         determinantName: item.determinant.determinant,
  //         determinantValues: [],
  //       });
  //     }
  //     grouped.get(item.determinant.id).determinantValues.push({
  //       id: item.id,
  //       value: item.value,
  //     });
  //   });
  //   return Array.from(grouped.values());
  // }

  // onDeterminantValueSelect(determinantId: number, itemIndex: number, event: Event): void {
  //   const selectedValueId = Number((event.target as HTMLSelectElement).value);
  //   const selectedValueText = (event.target as HTMLSelectElement).options[(event.target as HTMLSelectElement).selectedIndex].text;
  //    console.log(selectedValueId)
  //    console.log(selectedValueText)
  //   const itemsArray = this.purchasesBillForm.get('items') as FormArray;
  //   const itemGroup = itemsArray.at(itemIndex) as FormGroup;

  //   const determinants = itemGroup.get('determinants')?.value || [];

  //   const updatedDeterminants = determinants.map((det: any) =>
  //     det.determinantId === determinantId
  //       ? { ...det, selectedValue: selectedValueId, selectedValueText }
  //       : det
  //   );

  //   // Update the determinants array in the item
  //   itemGroup.patchValue({ determinants: updatedDeterminants });

  //   // Trigger change detection to immediately update the view
  //   this.cdr.detectChanges();
  // }

  trackByDeterminantId(index: number, det: any): number {
    return det.determinantId;
  }
  onColorChange(event: Event, index: number) {

    const selectedProductId = (event.target as HTMLSelectElement).value;
    const itemsArray = this.purchasesBillForm.get('items') as FormArray;
    const itemGroup = itemsArray.at(index) as FormGroup;
    itemGroup.patchValue({ color: selectedProductId });
    console.log(itemGroup.get('color_id')?.value);
    console.log(selectedProductId);

  }

  addItem(): void {
    this.items.push(this.createItem());
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
      color_id: [null],
      type: [null],
      // determinant_values: this.fb.array([]),
      need_serial: [false],
      barcode: [null],
      colors: [[]],
      branch_data: [null],

      determinants: this.fb.array([]),

      serialNumbers: [[]],
      neededSerialNumbers: [0],


      // dynamicInputs: this.fb.array([])

    });
  }




  removeSerialNumber(serialNumber: string, index: number) {
    const items = this.purchasesBillForm.get('items') as FormArray;
    const item = items.at(index) as FormGroup;
    // const barcode =item.get('barcode')?.value;
    const neededBars = item.get('neededSerialNumbers')?.value;

    // let tempList =(item.get('serialNumbers')?.value).filter( item=> item.barcode != serialNumber);
    const serialNumbers = item.get('serialNumbers')?.value;

    if (serialNumbers && Array.isArray(serialNumbers)) {
      const tempList = serialNumbers.filter(item => item.barcode !== serialNumber);

      item.patchValue({ serialNumbers: tempList });
      item.patchValue({ neededSerialNumbers: neededBars + 1 });

    }

    // item.patchValue({serialNumbers: tempList});
    // console.log(tempList);
    // item.patchValue({barcode: null});
    // item.patchValue({neededSerialNumbers: neededBars -1});




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
  payedAmount() {
    if ((this.purchasesBillForm.get('payed_price')?.value || 0) > this.total) {
      this.purchasesBillForm.patchValue({ payed_price: this.total });
    }

    if(this.currencyPriceValue>0){
      this.totalPayed = (this.purchasesBillForm.get('payed_price')?.value || 0) * this.currencyPriceValue; 
    }
    // this.totalPayed = (this.purchasesBillForm.get('payed_price')?.value || 0);
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

    if(this.purchasesBillForm.get('payment_type')?.value == 'cash' && this.selectedVendor &&(this.selectedVendor?.currency?.id != this.currencies.id) && !this.purchasesBillForm.get('currency_price_value')?.value){
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


          if((this.selectedVendor?.currency?.id != this.currencies.id) && this.purchasesBillForm.get('currency_price_value')?.value){
            formData.append('currency_price_value', this.purchasesBillForm.get('currency_price_value')?.value);

          }


        } else if (this.purchasesBillForm.get('check_id')?.value && this.purchasesBillForm.get('payment_type')?.value == 'check') {

          formData.append('payment_type', 'check');
          formData.append('check_id', this.purchasesBillForm.get('check_id')?.value);

        }

      }




      formData.append('vendor_id', this.purchasesBillForm.get('vendor_id')?.value);
      console.log(this.purchasesBillForm.get('vendor_id')?.value);
      // if (this.selecteddelegateAccount) {
      //   formData.append('delegate_id', this.purchasesBillForm.get('delegate_id')?.value || '');
      // }
      formData.append('store_id', this.purchasesBillForm.get('store_id')?.value);
      // formData.append('currency_id', this.purchasesBillForm.get('currency_id')?.value || '');
      formData.append('invoice_date', this.purchasesBillForm.get('date')?.value);
      // formData.append('delegate_id', this.purchasesBillForm.get('delegate_id')?.value || '');

      formData.append('total', this.total.toString());
      formData.append('total_payed', this.totalPayed.toString());


      formData.append('notes', this.purchasesBillForm.get('notes')?.value || '');
      formData.append('date', this.purchasesBillForm.get('invoice_date')?.value);





      if (this.items && this.items.controls) {



        this.items.controls.forEach((itemControl, index) => {
          const itemValue = itemControl.value;

          if (itemValue.neededSerialNumbers > 0) {
            this.toastr.error('يجب ادخال كل السيريا المطلوب');
            // alert('يجب ادخال كل السيريا المطلوب')
            error = true;

            return;

          }

          if (itemValue) {


            if(itemValue.type == 'product'){
              formData.append(`items[${index}][product_id]`, itemValue.product_id);
              const determinants = itemControl.get('determinants')?.value;
              if (determinants.length > 0) {

                determinants.forEach((determinant_item: any, internalIndex: number) => {
                  formData.append(`items[${index}][determinant_values][${internalIndex}][determinant_value_id]`, determinant_item.selected_id);
  
                });
  
              }


            }else if(itemValue.type == 'branch'){
              formData.append(`items[${index}][product_branch_id]`, itemValue.product_id);

            }
            formData.append(`items[${index}][quantity]`, itemValue.amount || '0');
            formData.append(`items[${index}][price]`, itemValue.price || '0');

            if (itemValue.colors.length > 0) {

              if (itemValue.color_id) {
                formData.append(`items[${index}][product_color_id]`, itemValue.color_id);

              } else {
                this.toastr.error('لازم تضيف لون للمنتجات اللى ليها اللوان');
                // alert('لازم تضيف لون للمنتجات اللى ليها اللوان');
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


      if (!error) {

        this._PurchasesService.addPurchase(formData).subscribe({
          next: (response) => {
            if (response) {
              this.toastr.success('تم اضافه الفاتوره بنجاح');
              console.log(response);
              this.isLoading = false;
              this._Router.navigate(['/dashboard/purchases/waiting']);
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


  // removeCurrentDelegate(){
  //   this.selecteddelegateAccount =null;
  // //  this.entryForm.patchValue({'delegate_id':null});
  // }
  onCheckSearchChange() {

  }

  selectcheck(check: any) {
    this.purchasesBillForm.patchValue({ 'check_id': check.id })
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
    if (this.selectedPopUP == 'cash') {
      this.selectedCashAccount = account;
      this.purchasesBillForm.patchValue({ 'cash_id': account.id })

    } else if (this.selectedPopUP == 'vendor') {
      this.selectedVendor = account;
      this.purchasesBillForm.patchValue({ 'vendor_id': account.id })

    }
    this.cdr.detectChanges();
    this.closeModal('shiftModal');
  }

  filteredProducts: any;

  ProductsearchQuery = '';
  selectedProduct: any;
  onProductSearchChange() {

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
          //  console.log(itemGroup.get('colors')?.value);

        }
      }


      if (product.productDeterminants) {
        const determinantsFromArray = itemGroup.get('determinants') as FormArray;
        determinantsFromArray.clear();

        if (product.productDeterminants.length > 0) {
          console.log(product.productDeterminants);
          product.productDeterminants.forEach((determinant: any) => {
            determinantsFromArray.push(this.fb.group({
              selected_id: [null, Validators.required],
              values: [determinant.determinant.values],
              name: [determinant.determinant.name],

            }));

            console.log('herer')
          });

          //  itemGroup.patchValue({determinants: product.productDeterminants});
          //  console.log(itemGroup.get('determinants')?.value);

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
  }
  // Called when store is selected
  
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