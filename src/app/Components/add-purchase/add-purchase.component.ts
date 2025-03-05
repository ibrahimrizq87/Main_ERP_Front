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

@Component({
  selector: 'app-add-purchase',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,FormsModule,TranslateModule],
  templateUrl: './add-purchase.component.html',
  styleUrl: './add-purchase.component.css'
})
export class AddPurchaseComponent implements OnInit {
  
  private productSubscription: Subscription = Subscription.EMPTY;
  // showCashAccountsDropdown: boolean = false
  purchasesBillForm: FormGroup;
  Products: any[] = [];
  msgError: any[] = [];
  isLoading: boolean = false;
 currencies:any;
stores:any[]=[];
 vendors:any[]=[];
 selectedType: string = 'purchase';
 selectedStore: string = '';

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
    private _PurchasesService:PurchasesService,
    private _Router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.purchasesBillForm = this.fb.group({
      type: ['purchase', Validators.required],
      status: 'pending',
      numbering_type: ['null', [Validators.maxLength(255)]],
      manual_reference: ['null', Validators.maxLength(255)],
      invoice_date: [this.getTodayDate()],
      due_date: [null], //
      purchased_from_id: ['', Validators.required],
      store_id: ['', Validators.required],
      currency_id: ['', Validators.required],
      // note: ['', Validators.maxLength(255)],
      tax_type: 'included',
      delegate_id: [null],
      // credit_account_id: ['', Validators.required],
      // items: this.fb.array([]),
      items: this.fb.array([this.createItem()]),
      supplier_id:[null],
      cash_id:[null],
      notes:[''],
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

this.loadProducts();
this.loadCurrencies();
this.loadStores();
this.loadSuppliers();
this.loadDelegates();
this.loadCashAccounts();

this.purchasesBillForm.get('items')?.valueChanges.subscribe((items) => {
  console.log('Items:', items); // Log items to debug
  items.forEach((item: any, index: number) => {
    if (item.amount) {
      this.updateDynamicInputs(index, item.amount);
    }
  });
});
}

loadSuppliers(): void {
  this._AccountService.getAccountsByParent('621').subscribe({
    next: (response) => {
      if (response) {
        console.log("suppliers",response)
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
  const itemsArray = this.purchasesBillForm.get('items') as FormArray;

  itemsArray.clear();
  if (this.selectedStore){
    // this.loadProducts(this.selectedStore);

  }

}
onStoreChange(event: Event): void {
  const selectedValue = (event.target as HTMLSelectElement).value;

this.selectedStore = selectedValue;
// this.loadProducts(this.selectedStore);

}
// loadProducts(store:string){
  

//   if( this.selectedType == 'purchase'){
//     this._ProductsService.getProductsByStore(store).subscribe({
//       next: (response) => {
//         if (response) {
//           this.Products = response.products;
//           console.log(this.Products);

//         }
//       },
//       error: (err) => {
//         console.error(err);
//       },
//     });
//   }else  if (this.selectedType == 'return'){
//     this._ProductsService.getProductBranchsByStore(store).subscribe({
//       next: (response) => {
//         if (response) {
//           this.Products = response.products;
//           console.log(this.Products);

//         }
//       },
//       error: (err) => {
//         console.error(err);
//       },
//     });
//   }

// }


loadProducts(){
  

    this._ProductsService.viewAllProducts().subscribe({
      next: (response) => {
        if (response) {
          this.Products = response.data;

          console.log('products',this.Products );
          this.filteredProducts = this.Products ;
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  

}



onProductChange(event: Event, index: number): void {
  const selectedProductId = (event.target as HTMLSelectElement).value;

  const itemsArray = this.purchasesBillForm.get('items') as FormArray;
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
  const itemsArray = this.purchasesBillForm.get('items') as FormArray;
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
    price: ['', Validators.required],
    total_price: ['', Validators.required],

    product_id: ['', Validators.required],
    colors: [], 
    amount: [null, Validators.required], 
    dynamicInputs: this.fb.array([])
  });
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

  // Ensure the amount is always a valid number before passing it to updateDynamicInputs
  if (typeof amount === 'number' && amount >= 0) {
    this.updateDynamicInputs(index, amount);
  } else {
    console.warn('Invalid amount:', amount);
  }
}


disableInput(itemIndex: number, inputIndex: number): void {
  const items = this.purchasesBillForm.get('items') as FormArray;
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
    return (this.purchasesBillForm.get('items') as FormArray);
  }
 

  addItem(): void {
    this.items.push(this.createItem());
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

 
handleForm() {
    if (this.purchasesBillForm.valid) {
        this.isLoading = true;

        const formData = new FormData();

        // Add form values
        formData.append('type', this.purchasesBillForm.get('type')?.value || '');
        formData.append('status', "pending");
        formData.append('numbering_type', this.purchasesBillForm.get('numbering_type')?.value || '');
        formData.append('manual_reference', this.purchasesBillForm.get('manual_reference')?.value || '');
        formData.append('invoice_date', this.purchasesBillForm.get('invoice_date')?.value || '');
        formData.append('due_date', this.purchasesBillForm.get('due_date')?.value || '');
        formData.append('store_id', this.purchasesBillForm.get('store_id')?.value || '');
        formData.append('tax_type', this.purchasesBillForm.get('tax_type')?.value || '');
        formData.append('currency_id', this.purchasesBillForm.get('currency_id')?.value || '');
        formData.append('purchased_from_id', this.purchasesBillForm.get('purchased_from_id')?.value || '');
        formData.append('delegate_id', this.purchasesBillForm.get('delegate_id')?.value || '');
        formData.append('box_account_id', this.purchasesBillForm.get('cash_id')?.value || '');
        formData.append('notes', this.purchasesBillForm.get('notes')?.value || '');
        formData.append('total_amount',"0");
        if (this.items && this.items.controls) {
            this.items.controls.forEach((itemControl, index) => {
                const itemValue = itemControl.value;

                if (itemValue) {
                    formData.append(`billItems[${index}][product_id]`, itemValue.product_id || '');
                    formData.append(`billItems[${index}][quantity]`, itemValue.amount || '0');
                    formData.append(`billItems[${index}][price]`, itemValue.total_price || '0');

                    // Handle determinants
                    if (itemValue.determinants && Array.isArray(itemValue.determinants)) {
                      itemValue.determinants.forEach((det: any, detIndex: number) => {
                        formData.append(
                            `billItems[${index}][determinants][${detIndex}][product_determinant_id]`,
                            det.selectedValue || ''  // Ensure it's not empty
                        );
                        formData.append(
                            `billItems[${index}][determinants][${detIndex}][selectedValue]`,
                            det.selectedValue || ''
                        );
                        console.log(`Determinant for item ${index}:`, det);  // Log determinant for debugging
                    });
                    
                    }

                    // Handle barcodes
                    const barcodes = itemValue.dynamicInputs || [];
                    if (Array.isArray(barcodes) && barcodes.length > 0) {
                      barcodes.forEach((barcode: string) => {
                          formData.append(`billItems[${index}][barcodes][]`, barcode || '');
                      });
                      console.log(`Barcodes for item ${index}:`, barcodes); // Log barcodes for debugging
                  } else {
                      // Do not append empty barcode field
                      console.log(`No barcodes for item ${index}`);
                  }
                  
                  const override = itemValue.amount -barcodes.length ;
                    formData.append(`billItems[${index}][override]`, override.toString() || '0');
                }
            });
        }

      

        this._PurchasesService.addPurchase(formData).subscribe({
            next: (response) => {
                if (response) {
                    console.log(response);
                    this.isLoading = false;
                    this._Router.navigate(['/dashboard/purchases']);
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
    }
}

filteredAccounts: Account[] = [];
selectedPopUP:string ='';
searchQuery: string = '';
selectedCashAccount:Account | null= null;
selecteddelegateAccount:Account | null= null;
selectedVendor:Account | null= null;

 
    removeCurrentDelegate(){
      this.selecteddelegateAccount =null;
    //  this.entryForm.patchValue({'delegate_id':null});
    }
  


      closeModal(modalId: string) {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
          const modal = Modal.getInstance(modalElement);
          modal?.hide();
        }
      }
    

      openModal(modalId: string , type:string ) {
        this.selectedPopUP = type;
        // this.popUpIndex = index;
        // const entryItem = this.entryForm.get('entryItems') as FormArray;
        if(type == 'cash'){
          this.filteredAccounts =this.cashAccounts;
        }else if (type == 'delegate'){
          this.filteredAccounts =this.delegates;
        }else if(type =='vendor'){
          this.filteredAccounts =this.vendors;

        }
        // console.log('hrerererer');
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
          const modal = new Modal(modalElement);
          modal.show();
        }
      }
    
  

      onSearchChange(){
  
    
        if(this.selectedPopUP == 'cash'){
          this.filteredAccounts = this.cashAccounts.filter(account =>
            account.name.toLowerCase().includes(this.searchQuery.toLowerCase())
          );
      
        }else if (this.selectedPopUP == 'delegate'){
          this.filteredAccounts = this.delegates.filter(account =>
            account.name.toLowerCase().includes(this.searchQuery.toLowerCase())
          );
        }else if (this.selectedPopUP == 'vendor'){
          this.filteredAccounts = this.vendors.filter(account =>
            account.name.toLowerCase().includes(this.searchQuery.toLowerCase())
          );
        }
       
      }
    


    selectAccount(account:Account){
      // const entryItem = this.purchasesBillForm.get('entryItems') as FormArray;
    
      if(this.selectedPopUP  == 'cash'){
        
        
        this.selectedCashAccount = account;

      }else if (this.selectedPopUP  == 'delegate'){
        this.selecteddelegateAccount = account;
        // this.entryForm.patchValue({'delegate_id':account.id})
  
      }else if (this.selectedPopUP  == 'vendor'){
        this.selectedVendor = account;
        // this.entryForm.patchValue({'delegate_id':account.id})
  
      }
      // const accomdkdcd =entryItem.at(this.popUpIndex).get('account')?.value;
      // console.log('here 1',account);
      //       console.log('here 2',      accomdkdcd         );

            this.cdr.detectChanges();

      this.closeModal('shiftModal');

    }
  
    filteredProducts:any;

    ProductsearchQuery ='';
    selectedProduct:any;
    onProductSearchChange(){

    }
    selectProduct(product:any){



      const itemsArray = this.purchasesBillForm.get('items') as FormArray;
      const itemGroup = itemsArray.at(this.productIndex) as FormGroup;
    



      this.closeProductModel();
    }
    productIndex:number=-1;
    openProductModal(index:number){
      this.productIndex =index;
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
  
}