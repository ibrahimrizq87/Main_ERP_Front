import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { StoreService } from '../../shared/services/store.service';
import { CurrencyService } from '../../shared/services/currency.service';
import { ProductsService } from '../../shared/services/products.service';
import { AccountService } from '../../shared/services/account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { Modal } from 'bootstrap';
import { CheckService } from '../../shared/services/check.service';
import { CommonModule } from '@angular/common';
import { ProductBranchesService } from '../../shared/services/product_branches.service';
import { ClientService } from '../../shared/services/client.service';
import { SalesService } from '../../shared/services/sales.service';
import { ToastrService } from 'ngx-toastr';
import { ProductBranchStoresService } from '../../shared/services/product-branch-stores.service';
import { SaleOrdersService } from '../../shared/services/sale_orders.service';
@Component({
  selector: 'app-update-sales',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, TranslateModule],
  templateUrl: './update-sales.component.html',
  styleUrl: './update-sales.component.css'
})
export class UpdateSalesComponent implements OnInit {


  private productSubscription: Subscription = Subscription.EMPTY;
  isSubmited = false;
  serialNumber: SerialNumber[] = [];
  salesData: any;
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
    private route: ActivatedRoute

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
    const unitId = this.route.snapshot.paramMap.get('id');
    if (unitId) {
      this.loadSaleBill(unitId);
    }
    this.loadStores();
    this.loadSuppliers();
    this.loadDelegates();
    this.loadCashAccounts();
    this.loadChecks();
  }

  // loadSaleBill(id: string) {
  //   this._SalesService.getSaleById(id).subscribe({
  //     next: (response) => {
  //       if (response) {
  //         const UnitsData = response.data;
  //         this.salesData = UnitsData;
  //         console.log("purchase data", UnitsData)
  //         this.saleForm.patchValue({
  //           invoice_date: UnitsData.invoice_date,
  //           vendor_id: UnitsData.vendor.account.id,
  //           store_id: UnitsData.store.id,
  //           payment_type: UnitsData.payment_type,
  //           payed_price: UnitsData.total_payed || 0,
  //           notes: UnitsData.notes || '',
  //           showCashAccountsDropdown: !!UnitsData.payed_from_account || !!UnitsData.check
  //         });

  //         UnitsData.purchaseBillItems.forEach((item: any) => {
  //           this.addItem(item)
  //         });

  //         this.total = UnitsData.total;
  //         this.totalPayed = UnitsData.total_payed;


  //         this.selectedClient = UnitsData.vendor;
  //         this.selectedCurrency = UnitsData.currency.id;
  //         this.selectedStore = UnitsData.store.id;
  //         if (UnitsData.payment_type == 'check') {
  //           this.selectedCheck = UnitsData.check || null;
  //           this.saleForm.patchValue({
  //             showCashAccountsDropdown: true,
  //             payment_type: ['check'],
  //             check_id: UnitsData.check.id
  //           });

  //         } else if (UnitsData.payment_type == 'cash') {
  //           this.selectedCashAccount = UnitsData.payed_from_account || null;
  //           this.saleForm.patchValue({
  //             showCashAccountsDropdown: true,
  //             cash_id: UnitsData.payed_from_account?.id,
  //           });
  //         }





  //       }
  //     },
  //     error: (err: HttpErrorResponse) => {
  //       this.msgError = err.error.error;
  //     }
  //   });
  // }

  // loadSaleBill(id: string) {
  //   this._SalesService.getSaleById(id).subscribe({
  //     next: (response) => {
  //       if (response) {
  //         const saleData = response.data;
  //         this.salesData = saleData;
  //         console.log("sales data", saleData);
  
  //       // Initialize client data
  //       this.selectedClient = {
  //         ...saleData.client_details,
  //         account: {
  //           id: saleData.client.id,
  //           name: saleData.client.name
  //         }
  //       };

  //       // Initialize delegate data if exists
  //       if (saleData.delegate) {
  //         this.selecteddelegateAccount = {
  //           id: saleData.delegate.id,
  //           name: saleData.delegate.name,
  //           account: saleData.delegate, // or whatever structure your Account interface expects
  //           currency: saleData.delegate.currency // Ensure to include the currency property
  //         };
  //       }
  //         // Patch basic form values
  //         this.saleForm.patchValue({
  //           invoice_date: saleData.date,
  //           vendor_id: saleData.client.id,
  //           store_id: saleData.store.id,
  //           payment_type: saleData.payment_type,
  //           payed_price: saleData.total_payed || 0,
  //           notes: saleData.note || '',
  //           delegate_id: saleData.delegate?.id || null,
  //           showCashAccountsDropdown: !!saleData.payed_to_account || !!saleData.check
  //         });
  
  //         // Clear existing items
  //         while (this.items.length) {
  //           this.items.removeAt(0);
  //         }
  
  //         // Add items from sale data
  //         saleData.saleBillItems.forEach((item: any) => {
  //           const serialNumbers = item.productSerialNumbers || [];
  //           const newItem = this.createItem(item.quantity, serialNumbers);
            
  //           this.items.push(newItem);
  //           const index = this.items.length - 1;
            
  //           // Patch product data
  //           const itemGroup = this.items.at(index) as FormGroup;
  //           itemGroup.patchValue({
  //             product_id: item.product_branch.id,
  //             product: {
  //               id: item.product_branch.product.id,
  //               name: item.product_branch.product.name,
  //               need_serial_number: item.product_branch.product.need_serial_number,
  //               stock: item.quantity // You might need to adjust this based on your actual data
  //             },
  //             price: item.price,
  //             color: item.product_color,
  //             serialNumbers: serialNumbers,
  //             neededSerialNumbers: item.product_branch.product.need_serial_number ? item.quantity - serialNumbers.length : 0
  //           });
  
  //           // If there are price ranges, patch them
  //           if (item.priceRanges) {
  //             itemGroup.patchValue({
  //               priceRanges: item.priceRanges
  //             });
  //           }
  //         });
  
  //         this.total = saleData.total;
  //         this.totalPayed = saleData.total_payed;
  
  //         this.selectedClient = saleData.client_details;
  //         this.selectedStore = saleData.store.id;
  
  //         // Handle payment type specific data
  //         if (saleData.payment_type == 'check') {
  //           this.selectedCheck = saleData.check || null;
  //           this.saleForm.patchValue({
  //             check_id: saleData.check?.id
  //           });
  //         } else if (saleData.payment_type == 'cash') {
  //           this.selectedCashAccount = saleData.payed_to_account || null;
  //           this.saleForm.patchValue({
  //             cash_id: saleData.payed_to_account?.id
  //           });
  //         }
  
  //         // Handle currency if needed
  //         if (saleData.currency) {
  //           this.selectedCurrency = saleData.currency.id;
  //           this.needCurrecyPrice = true;
  //           this.forignCurrencyName = saleData.currency.name;
  //           this.saleForm.patchValue({
  //             currency_price_value: saleData.currency_price_value
  //           });
  //         }
  //       }
  //     },
  //     error: (err: HttpErrorResponse) => {
  //       this.msgError = err.error.error;
  //       this.toastr.error('Failed to load sale bill');
  //     }
  //   });
  // }
  loadSaleBill(id: string) {
    this._SalesService.getSaleById(id).subscribe({
      next: (response) => {
        if (response) {
          const saleData = response.data;
          this.salesData = saleData;
          console.log("Sales data:", saleData);
    // Initialize payment account data
    if (saleData.payed_to_account) {
      this.selectedCashAccount = {
        id: saleData.payed_to_account.id,
        name: saleData.payed_to_account.name,
        account: saleData.payed_to_account, // Include the account property
        currency: saleData.payed_to_account.currency,
        current_balance: saleData.payed_to_account.current_balance
      };
      
      // Update the form control
      this.saleForm.patchValue({
        cash_id: saleData.payed_to_account.id,
        showCashAccountsDropdown: true
      });

      // Handle currency if different from default
      // if (saleData.payed_to_account.currency) {
      //   this.needCurrecyPrice = true;
      //   this.forignCurrencyName = saleData.payed_to_account.currency.name;
      // }
    }
          // Patch basic form values
          this.saleForm.patchValue({
            invoice_date: saleData.date,
            vendor_id: saleData.client.id,
            store_id: saleData.store.id,
            payment_type: saleData.payment_type,
            payed_price: saleData.total_payed || 0,
            notes: saleData.note || '',
            delegate_id: saleData.delegate?.id || null,
            showCashAccountsDropdown: !!saleData.payed_to_account || !!saleData.check
          });
  
          // Clear existing items
          while (this.items.length !== 0) {
            this.items.removeAt(0);
          }
  
          // Add items from sale data
          saleData.SaleBillItems.forEach((item: any) => {
            const newItem = this.createItem(item.quantity, item.productSerialNumbers || []);
            this.items.push(newItem);
            
            const index = this.items.length - 1;
            const itemGroup = this.items.at(index) as FormGroup;
  
            // Prepare product data for the form
            const productData = {
              id: item.product_branch.id,
              name: item.product_branch.product.name,
              need_serial_number: item.product_branch.product.need_serial_number,
              stock: item.quantity // You might need to adjust this based on actual stock
            };
  
            // Patch item values
            itemGroup.patchValue({
              product_id: item.product_branch.id,
              product: productData,
              price: item.price,
              color: item.product_color,
              amount: item.quantity,
              serialNumbers: item.productSerialNumbers || [],
              neededSerialNumbers: item.product_branch.product.need_serial_number 
                ? item.quantity - (item.productSerialNumbers?.length || 0) 
                : 0
            });
  
            // Log for debugging
            console.log(`Item ${index} patched:`, itemGroup.value);
          });
  
          this.total = saleData.total;
          this.totalPayed = saleData.total_payed;
  
          // Set client and delegate
          this.selectedClient = {
            ...saleData.client_details,
            account: {
              id: saleData.client.id,
              name: saleData.client.name
            }
          };
  
          if (saleData.delegate) {
            this.selecteddelegateAccount = {
              id: saleData.delegate.id,
              name: saleData.delegate.name,
              account: saleData.delegate.account, // Ensure to include the account property
              currency: saleData.delegate.currency // Ensure to include the currency property
            };
          }
  
          // Load products for the store
          this.loadProducts(saleData.store.id.toString());
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error("Error loading sale bill:", err);
        this.msgError = err.error.error;
        this.toastr.error('Failed to load sale bill');
      }
    });
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
      , this.searchQuery
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

  createItem(amount: number | null = null, serialNumbers: string[] = []): FormGroup {
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
      const tempList = serialNumbers.filter(item => item.barcode !== serialNumber);
      item.patchValue({ serialNumbers: tempList });
      item.patchValue({ neededSerialNumbers: neededBars + 1 });
    }
  }
  addParcode(index: number, givenBarcode: string | null = null) {
    const items = this.saleForm.get('items') as FormArray;
    const item = items.at(index) as FormGroup;

    const barcode = givenBarcode ? givenBarcode : item.get('barcode')?.value;
    const neededBars = item.get('neededSerialNumbers')?.value;
    if (neededBars == 0) {

      return;
    }
    let tempList = item.get('serialNumbers')?.value || [];
    const updatedTemplist = tempList.filter((b: string) => b !== barcode);


    // tempList.forEach((barcode:any) => {

    //   if(){}

    // });

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

  showselectOrder = false;
  onFileTypeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.showselectOrder = value === 'sale_order';

  }

  addItem(data: any | null = null): void {

    if (data) {

      this.items.push(this.createItem(data.quantity));

      // selectProduct
      const index = this.items.length - 1;


      this.selectProduct(data, index);
      this.onAmountChange(index);
      if (data.serialNumbers) {
        data.serialNumbers.forEach((element: any) => {
          this.addParcode(index, element.barcode);
        });
        // addParcode
      }

    } else {
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

      if (this.showselectOrder && this.selectedOrderId) {
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
                formData.append(`items[${index}][serial_numbers][${internalIndex}][serial_number]`, item.barcode);

              });

            }
          }
        });
      }


      if (!error) {
        const unitId = this.route.snapshot.paramMap.get('id');
        if(unitId){
        this._SalesService.updateSale(unitId,formData).subscribe({
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
  }
  onCheckSearchChange() {

  }

  selectcheck(check: any) {
    this.saleForm.patchValue({ 'check_id': check.id })
    this.selectedCheck = check;
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

      if (this.selectedClient.delegate) {
        this.selecteddelegateAccount = this.selectedClient.delegate;
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
    this._ProductsService.getSerialNumbers(productId, storeId).subscribe({
      next: (response) => {
        if (response) {
          this.serialNumber = response.data;
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


  selectProduct(productBranchStore: any, index: number | null = null) {
    const itemsArray = this.saleForm.get('items') as FormArray;
    const itemGroup = itemsArray.at(index != null ? index : this.productIndex) as FormGroup;

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

    console.log(productBranchStore.product.id, this.selectedStore, index != null ? index : this.productIndex);

    this.getSerialNumbers(productBranchStore.product.id, this.selectedStore, index ? index : this.productIndex);
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



  updateAccounts() {

    const type = this.selectedPopUP;
    if (type == 'cash') {
      this.filteredAccounts = this.cashAccounts;
    } else if (type == 'delegate') {
      this.filteredAccounts = this.delegates;
    } else if (type == 'vendor') {
      this.filteredAccounts = this.vendors;
    }

  }

  onCancel() {
    this.saleForm.reset();
    this._Router.navigate(['/dashboard/sales/' + this.salesData?.status]);
  }












  saleOrders: any;

  orderSearchDate = this.getTodayDate();

  loadOrders() {
    if (this.selectedClient) {
      this._SaleOrdersService.getAllSaleOrdersForPopup(
        '',
        this.selectedClient.account.id,
        this.orderSearchDate
      ).subscribe({
        next: (response) => {
          if (response) {
            this.saleOrders = response.data.bills;
            console.log('my data::', response, this.selectedClient.id, this.orderSearchDate);
          }
        },
        error: (err) => {
          console.error(err);
        },
      });
    }
  }


  selectedOrderId = '';
  loadOrderById(id: string) {
    this._SaleOrdersService.getSaleOrderById(id).subscribe({
      next: (response) => {
        if (response) {


          this.items.clear();
          this.selectedOrderId = id;
          this.selectedStore = response.data.store.id;

          console.log('my store_id', this.selectedStore);
          this.saleForm.patchValue({ store_id: this.selectedStore });
          console.log(response)
          response.data.items.forEach((item: any) => {
            this.addItem(item);

          });

        }
      },
      error: (err) => {
        console.error(err);
      },
    });

  }



  onSaleOrderSearchChange() {
    this.loadOrders();

  }

  selectSaleOrder(order: any) {
    this.loadOrderById(order.id);
  }

}





interface Account {
  id: string;
  name: string;
  account: Account;
  currency: Currency;
  current_balance?: number;
}



interface Currency {
  id: string;
  name: string;
}

interface SerialNumber {
  serialNumber: string;

}