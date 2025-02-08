import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { StoreService } from '../../shared/services/store.service';
import { CurrencyService } from '../../shared/services/currency.service';
import { ProductsService } from '../../shared/services/products.service';
import { AccountService } from '../../shared/services/account.service';
import { PurchasesService } from '../../shared/services/purchases.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SalesService } from '../../shared/services/sales.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-addsales',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,TranslateModule],
  templateUrl: './addsales.component.html',
  styleUrl: './addsales.component.css'
})
export class AddsalesComponent  implements OnInit {
private productSubscription: Subscription = Subscription.EMPTY;
  // showCashAccountsDropdown: boolean = false
  saleForm: FormGroup;
  Products: any[] = [];
  msgError: any[] = [];
  isLoading: boolean = false;
 currencies:any;
 stores:any[]=[];
//  Suppliers:any[]=[];
 selectedType: string = 'purchase';
 selectedStore: string = '';
 customers:any[]=[];
 delegates:any[]=[];
 cashAccounts:any[]=[];
 productDeterminants: any[] = [];
 dynamicInputs: FormArray<FormControl>; // Dynamic inputs array
 inputDisabled: boolean[] = []; // Tracks which inputs are disabled
 overrideCount: number = 0; 
  constructor(private fb: FormBuilder,
    private _StoreService: StoreService,
    private _CurrencyService: CurrencyService,
    private _ProductsService:ProductsService,
    private _AccountService:AccountService,
    private _SalesService:SalesService,
    private _Router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.saleForm = this.fb.group({


      type: ['sale', Validators.required],
      status: 'pending',
      numbering_type: ['null', [Validators.maxLength(255)]],
      manual_reference: ['null', Validators.maxLength(255)],
      invoice_date: [this.getTodayDate()],
      due_date: [null], //
      // purchased_from_id: ['', Validators.required],
      store_id: ['', Validators.required],
      currency_id: ['', Validators.required],
     
      // note: ['', Validators.maxLength(255)],
      tax_type: ['included', Validators.required],
      delegate_id: [null],
      customer_id: [null, Validators.required],
      // credit_account_id: ['', Validators.required],
      // items: this.fb.array([]),
      items: this.fb.array([this.createItem()]),
      // supplier_id:[null],
      cash_id:[null],
      notes:[''],
      address:[''],
      showCashAccountsDropdown: [false],
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
// this.loadSuppliers();
this.loadDelegates();
this.loadCashAccounts();
this.loadCustomers();
this.saleForm.get('items')?.valueChanges.subscribe((items) => {
  console.log('Items:', items); // Log items to debug
  items.forEach((item: any, index: number) => {
    if (item.amount) {
      this.updateDynamicInputs(index, item.amount);
    }
  });
});
}

// loadSuppliers(): void {
//   this._AccountService.getAccountsByParent('621').subscribe({
//     next: (response) => {
//       if (response) {
//         console.log("suppliers",response)
//         const Suppliers = response.data;
//         Suppliers.forEach((account: { hasChildren: any; id: any; }) => {
//           account.hasChildren = Suppliers.some((childAccount: { parent_id: any; }) => childAccount.parent_id === account.id);
//         });

//         this.Suppliers = Suppliers;
//       }
//     },
//     error: (err) => {
//       console.error(err);
//     }
//   });
// }
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
loadCashAccounts(): void {
 
    this._AccountService.getAccountsByParent('111').subscribe({
      next: (response) => {
        if (response) {
          console.log("CashAccounts",response)
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

onTypeChange(event: Event): void {


  const selectedValue = (event.target as HTMLSelectElement).value;

  this.selectedType = selectedValue;
  console.log(selectedValue);
  const itemsArray = this.saleForm.get('items') as FormArray;

  itemsArray.clear();
  if (this.selectedStore){
    this.loadProducts(this.selectedStore);

  }

}
onStoreChange(event: Event): void {
  const selectedValue = (event.target as HTMLSelectElement).value;

this.selectedStore = selectedValue;
this.loadProducts(this.selectedStore);

}
loadProducts(store:string){
  this._ProductsService.getProductBranchsByStore(store).subscribe({
    next: (response) => {
      if (response) {
        this.Products = response.products;
        console.log(this.Products);

        const productName =  this.Products[5].product.name_ar; // "iphone 15"
const quantity = this.Products[5].amount;    // -2
const determinant = this.Products[5].productDeterminant[0]?.productDetermiant.determinant.determinant; // "color"
const determinantValue = this.Products[5].productDeterminant[0]?.productDetermiant.value; // "red"

// Log the results
console.log("Product Name:", productName);
console.log("Quantity:", quantity);
console.log("Determinant:", determinant);
console.log("Determinant Value:", determinantValue);

      }
    },
    error: (err) => {
      console.error(err);
    },
  });

}


onProductChange(event: Event, index: number): void {
  const selectedProductId = (event.target as HTMLSelectElement).value;

  const itemsArray = this.saleForm.get('items') as FormArray;
  const itemGroup = itemsArray.at(index) as FormGroup;
  if (this.selectedType == 'purchase'){
    // this.loadProductDeterminant(selectedProductId , itemGroup);

  }

}

// loadProductDeterminant(selectedProductId:string ,itemGroup:FormGroup){
//   this._ProductsService.getDeterminantByProduct(selectedProductId).subscribe({
//     next: (response) => {
//       if (response) {
//         const productDeterminants = this.getGroupedDeterminants(response.data);

//         itemGroup.patchValue({
//           total_price: this.Products.find((product) => product.id === +selectedProductId)?.purchase_price,
//           determinants: productDeterminants,
//         });

//         // Dynamically add form controls for determinants
//         productDeterminants.forEach((det) => {
//           if (!itemGroup.get('determinants.' + det.determinantId)) {
//             itemGroup.addControl('determinant-' + det.determinantId, this.fb.control(''));
//           }
//         });

//         itemGroup.updateValueAndValidity();

//         this.cdr.detectChanges();
//       }
//     },
//     error: (err) => {
//       console.error(err);
//     },
//   });
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
//   const itemsArray = this.saleForm.get('items') as FormArray;
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

createItem(): FormGroup {
  return this.fb.group({
    // quantity: ['', Validators.required],
    total_price: ['', Validators.required],
    product_id: ['', Validators.required],
    amount: [null, Validators.required], // Ensure 'amount' is part of each item
    dynamicInputs: this.fb.array([])
  });
}

updateDynamicInputs(index: number, amount: number): void {
  const items = this.saleForm.get('items') as FormArray;
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
  const items = this.saleForm.get('items') as FormArray;
  const item = items.at(index) as FormGroup;
  const amount = item.get('amount')?.value || 0;

  // Ensure the amount is always a valid number before passing it to updateDynamicInputs
  if (typeof amount === 'number' && amount >= 0) {
    this.updateDynamicInputs(index, amount);
  } else {
    console.warn('Invalid amount:', amount);
  }
}


disableInput(itemIndex: number, inputIndex: number): void {
  const items = this.saleForm.get('items') as FormArray;
  const item = items.at(itemIndex) as FormGroup;
  const dynamicInputs = item.get('dynamicInputs') as FormArray<FormControl>;

  const control = dynamicInputs.at(inputIndex);
  if (control) control.disable();
}

// get dynamicInputsFormArray(): FormArray<FormControl> {
//   return this.dynamicInputs;
// }
getDynamicInputs(item: AbstractControl): FormArray {
  return (item.get('dynamicInputs') as FormArray);
}
loadCustomers(): void {
  this._AccountService.getAccountsByParent('611').subscribe({
    next: (response) => {
      if (response) {
        console.log("customers",response)
        const customers = response.data;
        customers.forEach((account: { hasChildren: any; id: any; }) => {
          account.hasChildren = customers.some((childAccount: { parent_id: any; }) => childAccount.parent_id === account.id);
        });

        this.customers = customers;
      }
    },
    error: (err) => {
      console.error(err);
    }
  });
}


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

 
  get items() {
    return (this.saleForm.get('items') as FormArray);
  }
 

  addItem(): void {
    this.items.push(this.createItem());
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

 
handleForm() {
    if (this.saleForm.valid) {
        this.isLoading = true;

        const formData = new FormData();

        // Add form values
        formData.append('type', this.saleForm.get('type')?.value || '');
        formData.append('status', "pending");
        formData.append('numbering_type', this.saleForm.get('numbering_type')?.value || '');
        formData.append('manual_reference', this.saleForm.get('manual_reference')?.value || '');
        formData.append('invoice_date', this.saleForm.get('invoice_date')?.value || '');
        formData.append('due_date', this.saleForm.get('due_date')?.value || '');
        formData.append('store_id', this.saleForm.get('store_id')?.value || '');
        formData.append('tax_type', this.saleForm.get('tax_type')?.value || '');
        formData.append('currency_id', this.saleForm.get('currency_id')?.value || '');
        // formData.append('purchased_from_id', this.saleForm.get('purchased_from_id')?.value || '');
        formData.append('account_delegate_id', this.saleForm.get('delegate_id')?.value || '');
        formData.append('account_client_id', this.saleForm.get('customer_id')?.value || '');
        formData.append('box_id', this.saleForm.get('cash_id')?.value || '');
        formData.append('note', this.saleForm.get('notes')?.value || '');
        formData.append('address', this.saleForm.get('address')?.value || '');
      
        if (this.items && this.items.controls) {
            this.items.controls.forEach((itemControl, index) => {
                const itemValue = itemControl.value;

                if (itemValue) {
                    formData.append(`products[${index}][product_id]`, itemValue.product_id || '');
                    formData.append(`products[${index}][amount]`, itemValue.amount || '0');
                    formData.append(`products[${index}][sale_price]`, itemValue.total_price || '0');

                    // Handle determinants
                    // if (itemValue.determinants && Array.isArray(itemValue.determinants)) {
                    //   itemValue.determinants.forEach((det: any, detIndex: number) => {
                    //     formData.append(
                    //         `billItems[${index}][determinants][${detIndex}][product_determinant_id]`,
                    //         det.selectedValue || ''  // Ensure it's not empty
                    //     );
                    //     formData.append(
                    //         `billItems[${index}][determinants][${detIndex}][selectedValue]`,
                    //         det.selectedValue || ''
                    //     );
                    //     console.log(`Determinant for item ${index}:`, det);  // Log determinant for debugging
                    // });
                    
                    // }

                    // Handle barcodes
                    const barcodes = itemValue.dynamicInputs || [];
                    if (Array.isArray(barcodes) && barcodes.length > 0) {
                      barcodes.forEach((barcode: string) => {
                          formData.append(`products[${index}][barcodes][]`, barcode || '');
                      });
                      console.log(`Barcodes for item ${index}:`, barcodes); // Log barcodes for debugging
                  } else {
                      // Do not append empty barcode field
                      console.log(`No barcodes for item ${index}`);
                  }
                  
                  const override = itemValue.amount -barcodes.length ;
                    formData.append(`products[${index}][override]`, override.toString() || '0');
                }
            });
        }

      

        this._SalesService.addSale(formData).subscribe({
            next: (response) => {
                if (response) {
                    console.log(response);
                    this.isLoading = false;
                    this._Router.navigate(['/dashboard/sales']);
                }
            },
           
            error: (err: HttpErrorResponse) => {
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
      
      }}}