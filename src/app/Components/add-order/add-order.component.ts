import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { StoreService } from '../../shared/services/store.service';
import { CurrencyService } from '../../shared/services/currency.service';
import { ProductsService } from '../../shared/services/products.service';
import { AccountService } from '../../shared/services/account.service';
import { PurchasesService } from '../../shared/services/purchases.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-order',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormsModule,TranslateModule],
  templateUrl: './add-order.component.html',
  styleUrl: './add-order.component.css'
})
export class AddOrderComponent implements OnInit {
  orderForm: FormGroup;
  Products: any[] = [];
  msgError: any[] = [];
  isLoading: boolean = false;
 currencies:any;
stores:any[]=[];
  OrdersFrom:any[]=[];
 selectedType: string = '';
 delegates:any[]=[];
 cashAccounts:any[]=[];
 productDeterminants: any[] = [];
 dynamicInputs: FormArray<FormControl>; 
 inputDisabled: boolean[] = []; 
 overrideCount: number = 0; 
  constructor(private fb: FormBuilder,
    private _StoreService: StoreService,
    private _CurrencyService: CurrencyService,
    private _ProductsService:ProductsService,
    private _AccountService:AccountService,
    private _PurchasesService:PurchasesService,
    private _Router: Router,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
  ) {
    this.orderForm = this.fb.group({
      status: 'pending',
      numbering_type: ['null', [Validators.maxLength(255)]],
      manual_reference: ['null', Validators.maxLength(255)],
      order_date: [this.getTodayDate()],
      arrival_date: [null], 
      ordered_from_id: ['', Validators.required],
      store_id: ['', Validators.required],
      currency_id: ['', Validators.required],
      address: ['', [Validators.minLength(3), Validators.maxLength(255)]],

      // address:['',Validators.minLength(3),Validators.maxLength(255)],
      // note: ['', Validators.maxLength(255)],
      tax_type: ['included',Validators.required],
      delegate_id: [null],
      // credit_account_id: ['', Validators.required],
      // items: this.fb.array([]),
      items: this.fb.array([this.createItem()]),
      // supplier_id:[null],
      // cash_id:[null],
      notes:['',[Validators.minLength(3),Validators.maxLength(255)]],
      // showCashAccountsDropdown: [false],
      // amount: new FormControl(null, [Validators.required]),
    });
    this.dynamicInputs = this.fb.array([]);
      // Initialize dynamicInputs as FormArray<FormControl>
  }

  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

ngOnInit(): void {
this.loadCurrencies();
this.loadStores();
// this.loadSuplies();
// this.loadProducts();
this.loadOrdersFrom();
this.loadDelegates();
// this.loadCashAccounts();
// this.orderForm.get('items')?.valueChanges.subscribe((items) => {
//   console.log('Items:', items); // Log items to debug
//   items.forEach((item: any, index: number) => {
//     if (item.amount) {
//       this.updateDynamicInputs(index, item.amount);
//     }
//   });
// });
}

loadOrdersFrom(): void {
  this._AccountService.getAccountsByParent('621').subscribe({
    next: (response) => {
      if (response) {
        console.log("OrdersFrom",response)
        const OrdersFrom = response.data;
        OrdersFrom.forEach((account: { hasChildren: any; id: any; }) => {
          account.hasChildren = OrdersFrom.some((childAccount: { parent_id: any; }) => childAccount.parent_id === account.id);
        });

        this.OrdersFrom = OrdersFrom;
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
        console.log("delegates",response)
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
// loadCashAccounts(): void {
 
//     this._AccountService.getAccountsByParent('111').subscribe({
//       next: (response) => {
//         if (response) {
//           console.log("CashAccounts",response)
//           const cashAccounts = response.data;
//           cashAccounts.forEach((account: { hasChildren: any; id: any; }) => {
//             account.hasChildren = cashAccounts.some((childAccount: { parent_id: any; }) => childAccount.parent_id === account.id);
//           });
  
//           this.cashAccounts = cashAccounts;
//         }
//       },
//       error: (err) => {
//         console.error(err);
//       }
//     });
  
// }

loadStores(){
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
  this._ProductsService.getProductsByStore(selectedValue).subscribe({
    next: (response) => {
      if (response) {
        this.Products = response.products;
      }
    },
    error: (err) => {
      console.error(err);
    },
  });
}


onProductChange(event: Event, index: number): void {
  const selectedProductId = (event.target as HTMLSelectElement).value;

  const itemsArray = this.orderForm.get('items') as FormArray;
  const itemGroup = itemsArray.at(index) as FormGroup;

  this._ProductsService.getDeterminantByProduct(selectedProductId).subscribe({
    next: (response) => {
      if (response) {
        const productDeterminants = this.getGroupedDeterminants(response.data);

        itemGroup.patchValue({
          total_price: this.Products.find((product) => product.id === +selectedProductId)?.purchase_price,
          determinants: productDeterminants,
        });

        // Dynamically add form controls for determinants
        productDeterminants.forEach((det) => {
          if (!itemGroup.get('determinants.' + det.determinantId)) {
            itemGroup.addControl('determinant-' + det.determinantId, this.fb.control(''));
          }
        });

        itemGroup.updateValueAndValidity();

        // Trigger change detection to ensure the form updates immediately
        this.cdr.detectChanges();
      }
    },
    error: (err) => {
      console.error(err);
    },
  });
}

getGroupedDeterminants(productDeterminants: any[]): any[] {
  const grouped = new Map();
  productDeterminants.forEach((item) => {
    if (!grouped.has(item.determinant.id)) {
      grouped.set(item.determinant.id, {
        determinantId: item.determinant.id,
        determinantName: item.determinant.determinant,
        determinantValues: [],
      });
    }
    grouped.get(item.determinant.id).determinantValues.push({
      id: item.id,
      value: item.value,
    });
  });
  return Array.from(grouped.values());
}

onDeterminantValueSelect(determinantId: number, itemIndex: number, event: Event): void {
  const selectedValueId = Number((event.target as HTMLSelectElement).value);
  const selectedValueText = (event.target as HTMLSelectElement).options[(event.target as HTMLSelectElement).selectedIndex].text;
   console.log(selectedValueId)
   console.log(selectedValueText)
  const itemsArray = this.orderForm.get('items') as FormArray;
  const itemGroup = itemsArray.at(itemIndex) as FormGroup;

  const determinants = itemGroup.get('determinants')?.value || [];

  const updatedDeterminants = determinants.map((det: any) =>
    det.determinantId === determinantId
      ? { ...det, selectedValue: selectedValueId, selectedValueText }
      : det
  );

  // Update the determinants array in the item
  itemGroup.patchValue({ determinants: updatedDeterminants });

  // Trigger change detection to immediately update the view
  this.cdr.detectChanges();
}

trackByDeterminantId(index: number, det: any): number {
  return det.determinantId;
}

createItem(): FormGroup {
  return this.fb.group({
    // quantity: ['', Validators.required],
    total_price: ['', Validators.required],
    product_id: ['', Validators.required],
    // determinants: [[]], // Store determinants for the product
    amount: [null, Validators.required], // Ensure 'amount' is part of each item
    // dynamicInputs: this.fb.array([])
  });
}

// updateDynamicInputs(index: number, amount: number): void {
//   const items = this.orderForm.get('items') as FormArray;
//   const item = items.at(index) as FormGroup;

//   let dynamicInputs = item.get('dynamicInputs') as FormArray<FormControl>;
//   if (!dynamicInputs) {
//     dynamicInputs = this.fb.array([]);
//     item.setControl('dynamicInputs', dynamicInputs);
//   }

//   const currentLength = dynamicInputs.length;
//   if (currentLength < amount) {
//     for (let i = currentLength; i < amount; i++) {
//       dynamicInputs.push(this.fb.control('', Validators.required));
//     }
//   } else if (currentLength > amount) {
//     for (let i = currentLength - 1; i >= amount; i--) {
//       dynamicInputs.removeAt(i);
//     }
//   }
// }

// onAmountChange(index: number): void {
//   const items = this.orderForm.get('items') as FormArray;
//   const item = items.at(index) as FormGroup;
//   const amount = item.get('amount')?.value || 0;

//   // Ensure the amount is always a valid number before passing it to updateDynamicInputs
//   if (typeof amount === 'number' && amount >= 0) {
//     this.updateDynamicInputs(index, amount);
//   } else {
//     console.warn('Invalid amount:', amount);
//   }
// }


// disableInput(itemIndex: number, inputIndex: number): void {
//   const items = this.orderForm.get('items') as FormArray;
//   const item = items.at(itemIndex) as FormGroup;
//   const dynamicInputs = item.get('dynamicInputs') as FormArray<FormControl>;

//   const control = dynamicInputs.at(inputIndex);
//   if (control) control.disable();
// }

// get dynamicInputsFormArray(): FormArray<FormControl> {
//   return this.dynamicInputs;
// }
// getDynamicInputs(item: AbstractControl): FormArray {
//   return (item.get('dynamicInputs') as FormArray);
// }



loadCurrencies(){
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

  // get items() {
  //   return (this.orderForm.get('items') as FormArray);
  // }
  get items() {
    return (this.orderForm.get('items') as FormArray);
  }
 
  // addItem(): void {
  //   this.items.push(this.createItem());
  // }

  // removeItem(index: number): void {
  //   this.items.removeAt(index);
  // }
  addItem(): void {
    this.items.push(this.createItem());
  }

  
  removeItem(index: number): void {
    this.items.removeAt(index);
  }

handleForm() {
    if (this.orderForm.valid) {
        this.isLoading = true;

        const formData = new FormData();

        // Add form values
       
        formData.append('status', "in-process");
        formData.append('numbering_type', this.orderForm.get('numbering_type')?.value || '');
        formData.append('manual_reference', this.orderForm.get('manual_reference')?.value || '');
        formData.append('order_date', this.orderForm.get('order_date')?.value || '');
        formData.append('arrival_date', this.orderForm.get('arrival_date')?.value || '');
        formData.append('store_id', this.orderForm.get('store_id')?.value || '');
        formData.append('tax_type', this.orderForm.get('tax_type')?.value || '');
        formData.append('currency_id', this.orderForm.get('currency_id')?.value || '');
        formData.append('ordered_from_id', this.orderForm.get('ordered_from_id')?.value || '');
        formData.append('address', this.orderForm.get('address')?.value || '');
        // formData.append('delegate_id', '1');
        formData.append('delegate_id', this.orderForm.get('delegate_id')?.value || '');
        // formData.append('box_account_id', this.orderForm.get('cash_id')?.value || '');
        formData.append('notes', this.orderForm.get('notes')?.value || '');
        // formData.append('total_amount',"0");
        if (this.items && this.items.controls) {
            this.items.controls.forEach((itemControl, index) => {
                const itemValue = itemControl.value;

                if (itemValue) {
                    formData.append(`purchasesOrderItems[${index}][product_id]`, itemValue.product_id || '');
                    formData.append(`purchasesOrderItems[${index}][quantity]`, itemValue.amount || '0');
                    formData.append(`purchasesOrderItems[${index}][price]`, itemValue.total_price || '0');

                  

                    
                }
            });
        }

      

        this._PurchasesService.addOrder(formData).subscribe({
            next: (response) => {
                if (response) {
                    this.toastr.success('تم اضافه الطلب بنجاح');
                    console.log(response);
                    this.isLoading = false;
                    this._Router.navigate(['/dashboard/orders']);
                }
            },
           
            error: (err: HttpErrorResponse) => {
              this.toastr.error('حدث خطا اثناء اضافه الطلب');
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
}



}
