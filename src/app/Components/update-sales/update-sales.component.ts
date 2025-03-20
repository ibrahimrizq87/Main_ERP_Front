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
@Component({
  selector: 'app-update-sales',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,FormsModule,TranslateModule],
  templateUrl: './update-sales.component.html',
  styleUrl: './update-sales.component.css'
})
export class UpdateSalesComponent {

  private productSubscription: Subscription = Subscription.EMPTY;
  isSubmited=false;
  serialNumber:SerialNumber [] =[];
  // neededSerialNumbers =0;
  saleForm: FormGroup;
  Products: any[] = [];
  msgError: any[] = [];
  isLoading: boolean = false;
  currencies:any;
  stores:any[]=[];
 vendors:any[]=[];
 selectedType: string = 'purchase';
 selectedStore: string = '';
 checks:any;

 delegates:any[]=[];
 cashAccounts:any[]=[];
 productDeterminants: any[] = [];
 inputDisabled: boolean[] = []; // Tracks which inputs are disabled
 overrideCount: number = 0; 
selectedCheck:any;
 total = 0;
 totalPayed =0;

  constructor(private fb: FormBuilder,
    private _StoreService: StoreService,
    private _CurrencyService: CurrencyService,
    private _ProductsService:ProductsService,
    private _ProductBranchesService:ProductBranchesService,
    private _ClientService:ClientService,
    private route: ActivatedRoute,
    private _AccountService:AccountService,
    private _SalesService:SalesService,
    private _Router: Router,
    private cdr: ChangeDetectorRef,
    private _CheckService: CheckService

  ) {
    this.saleForm = this.fb.group({
      invoice_date: [this.getTodayDate()],
      payed_price:[null],
      vendor_id: ['', Validators.required],
      store_id: ['', Validators.required],
      currency_id: ['', Validators.required],
      payment_type: ['cash'],
      check_id: [''],
      tax_type: 'included',
      delegate_id: [null],
      items: this.fb.array([]),
      supplier_id:[null],
      cash_id:[null],
      notes:[''],
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


  loadChecks(){
    this._CheckService.getCheckByPayedToAccount('112').subscribe({
      next: (response) => {
        if (response) {
          const cashAccounts = response.data;
      // console.log("checks",cashAccounts)
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
this.loadCurrencies();
this.loadStores();
this.loadSuppliers();
this.loadDelegates();
this.loadCashAccounts();
this.loadChecks();
}

loadSaleBill(id:string){
    this._SalesService.getSaleById(id).subscribe({
      next: (response) => {
        if (response) {
          const UnitsData = response.data;
          console.log("purchase data", UnitsData)
          this.saleForm.patchValue({
            invoice_date: [this.getTodayDate()],
            payed_price: UnitsData.total_payed,
            vendor_id: UnitsData.vendor.id,
            store_id: UnitsData.store.id,
            currency_id: UnitsData.currency.id,
            notes: UnitsData.note,
          });

          UnitsData.purchaseBillItems.forEach((item: any) => {
            this.addItem(item)
          });

          this.total = UnitsData.total;
          this.totalPayed = UnitsData.total_payed;


          this.selectedClient = UnitsData.vendor;
          this.selectedCurrency = UnitsData.currency.id;
          this.selectedStore = UnitsData.store.id;
          if (UnitsData.payment_type == 'check') {
            this.selectedCheck = UnitsData.check || null;
            this.saleForm.patchValue({
              showCashAccountsDropdown: true,
              payment_type: ['check'],
              check_id: UnitsData.check.id
            });

          } else if (UnitsData.payment_type == 'cash') {
            this.selectedCashAccount = UnitsData.payed_from_account || null;
            this.saleForm.patchValue({
              showCashAccountsDropdown: true,
              cash_id: UnitsData.payed_from_account?.id,
            });
          }





        }
      },
      error: (err: HttpErrorResponse) => {
        this.msgError = err.error.error;
      }
    });
  }



loadSuppliers(): void {
  this._ClientService.getAllClients().subscribe({
    next: (response) => {
      if (response) {
        console.log("suppliers",response)
   
        this.vendors =response.data;
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
  const itemsArray = this.saleForm.get('items') as FormArray;

  itemsArray.clear();
  if (this.selectedStore){
    // this.loadProducts(this.selectedStore);

  }

}
onStoreChange(event: Event): void {
  const selectedValue = (event.target as HTMLSelectElement).value;

this.selectedStore = selectedValue;
this.loadProducts(this.selectedStore);

}
selectedCurrency:any;
onCurrencyChange(event: Event): void {
  const selectedValue = (event.target as HTMLSelectElement).value;

this.selectedCurrency = selectedValue;
// this.loadProducts(this.selectedStore);

}



loadProducts(storeId:string){
  

    this._ProductBranchesService.getProductBranchByStoreId(storeId).subscribe({
      next: (response) => {
        if (response) {
          this.Products = response.data;

          console.log('product branches',this.Products );
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

  const itemsArray = this.saleForm.get('items') as FormArray;
  const itemGroup = itemsArray.at(index) as FormGroup;
  if (this.selectedType == 'purchase'){
  }
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



onColorChange(event:Event, index :number){

  const selectedProductId = (event.target as HTMLSelectElement).value;
  const itemsArray = this.saleForm.get('items') as FormArray;
  const itemGroup = itemsArray.at(index) as FormGroup;
  itemGroup.patchValue({color:selectedProductId});
  console.log(itemGroup.get('color_id')?.value);
  console.log(selectedProductId);

}


searchTerm = new FormControl('');

onBarcodeSelect(barcode: Event , index:number){ {
  const selectedValue = (barcode.target as HTMLSelectElement).value;

  const items = this.saleForm.get('items') as FormArray;
  const item = items.at(index) as FormGroup;

  const neededBars =item.get('neededSerialNumbers')?.value;
  if(neededBars == 0){
    item.patchValue({barcode: null});
    return ;
  }
  let tempList =item.get('serialNumbers')?.value||[];
let isdublicated =false;
  tempList.forEach((item:any)=>{
    if(item.barcode == selectedValue){
      alert('هذا السيريال موجود بالفعل');
      isdublicated = true;
      return;
    }
  });


if(isdublicated){
  item.patchValue({barcode: null});

  return;
}
  if(selectedValue){
    tempList.push({barcode:selectedValue })
    item.patchValue({serialNumbers: tempList});
    console.log(tempList);
    item.patchValue({barcode: null});
    item.patchValue({neededSerialNumbers: neededBars -1});


  }}
}


removeSerialNumber(serialNumber:string , index :number){
  const items = this.saleForm.get('items') as FormArray;
  const item = items.at(index) as FormGroup;
  // const barcode =item.get('barcode')?.value;
  const neededBars =item.get('neededSerialNumbers')?.value;

  // let tempList =(item.get('serialNumbers')?.value).filter( item=> item.barcode != serialNumber);
  const serialNumbers = item.get('serialNumbers')?.value;

  if (serialNumbers && Array.isArray(serialNumbers)) {
    const tempList = serialNumbers.filter(item => item.barcode !== serialNumber);

    item.patchValue({serialNumbers: tempList});
        item.patchValue({neededSerialNumbers: neededBars +1});

  } 

    // item.patchValue({serialNumbers: tempList});
    // console.log(tempList);
    // item.patchValue({barcode: null});
    // item.patchValue({neededSerialNumbers: neededBars -1});


  

}
addParcode(index:number){
  const items = this.saleForm.get('items') as FormArray;
  const item = items.at(index) as FormGroup;

  const barcode =item.get('barcode')?.value;
  const neededBars =item.get('neededSerialNumbers')?.value;
  if(neededBars == 0){
  
    return ;
  }
  let tempList =item.get('serialNumbers')?.value||[];

  tempList.forEach(()=>{

  });



  if(barcode){
    tempList.push({barcode:barcode })
    item.patchValue({serialNumbers: tempList});
    console.log(tempList);
    item.patchValue({barcode: null});
    item.patchValue({neededSerialNumbers: neededBars -1});


  }

}


onAmountChange(index: number): void {
 
  const items = this.saleForm.get('items') as FormArray;
  const item = items.at(index) as FormGroup;
  let amount = item.get('amount')?.value || 0;
  const stock =item.get('product')?.value.stock;
  const serialNumbers =item.get('serialNumbers')?.value.length || 0;

  if(amount > stock){
    amount = stock;
    item.patchValue({amount:stock});
  }
  const priceRanges = item.get('priceRanges')?.value || [];
  priceRanges.forEach((price:any)=>{
    console.log('quantity_from',price.quantity_from);
    console.log('quantity_to',price.quantity_to);

    console.log('amount',amount);
    if(price.quantity_from < amount && price.quantity_to >= amount ){
      item.patchValue({price:price.price});
    }
  })
  if(item.get('product')?.value?.product.need_serial_number){
    if (typeof amount === 'number' && amount >= 0) {
      item.patchValue({neededSerialNumbers:amount - serialNumbers})
      
    } else {
      console.warn('Invalid amount:', amount);
    }
  }

  this.onPrice();

}
payedAmount(){
  if((this.saleForm.get('payed_price')?.value || 0) > this.total){
    this.saleForm.patchValue({payed_price: this.total});
  }
  this.totalPayed =  (this.saleForm.get('payed_price')?.value || 0);
}
paymentTriggerChange(){
if(!this.saleForm.get('showCashAccountsDropdown')?.value){
this.totalPayed =0;
}else{
  this.totalPayed =  (this.saleForm.get('payed_price')?.value || 0);
}}



onPrice(){
  this.total =0;
  this.items.controls.forEach((itemControl) => {
    const itemValue = itemControl.value;
    console.log('amount' , itemValue.amount);
    console.log('price' , itemValue.price);

                if (itemValue) {
                  this.total +=  (itemValue.amount || 0) *  (itemValue.price || 0);
                  }
  });
}

// isDisabled = true; // Change this condition dynamically


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
 
  addItem(item: any = null): void {

    let currentSerials: { barcode: string }[] = [];
    item.serial_numbers?.forEach((serial: any) => {
      currentSerials.push({ barcode: serial.serial_number });
    });

    if (item != null) {
      const newItem = this.fb.group({
        amount: [item.quantity, Validators.required],
        price: [item.price, Validators.required],
        product_id: item ? item.product_id : ['', Validators.required],
        product: item ? item.product : [null],
        color_id: item ? item.product_color_id : [null],
        need_serial: item ? item.product.need_serial_number : [false],
        barcode: [null],
        colors: item ? item.product.colors : [[]],
        serialNumbers: [currentSerials],
        neededSerialNumbers: [0],
      });

      (this.items as FormArray).push(newItem);
    } else {
      const newItem = this.fb.group({

        amount: [null, Validators.required], 
        overridePrice: [false],
    
        price: ['', Validators.required],
        priceRanges: [[]],
        product_id: ['', Validators.required],
        product: [null],
        need_serial: [false], 
        barcode:[null],
        color: [null], 
        productSerialNumbers:[[]], 
        serialNumbers: [[]], 
        neededSerialNumbers: [0],
      }
      );

      (this.items as FormArray).push(newItem);


    }

  }




  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  onPaymentTypeChange(event:Event){

  }
handleForm() {

  this.isSubmited =true;
    if (this.saleForm.valid ) {
        this.isLoading = true;
        let error = false;
        const formData = new FormData();

    if(this.saleForm.get('showCashAccountsDropdown')?.value){
      if(this.saleForm.get('cash_id')?.value && this.saleForm.get('payment_type')?.value == 'cash'){
        formData.append('payed_to_account_id', this.saleForm.get('cash_id')?.value);
        formData.append('payment_type', 'cash');
      }else if(this.saleForm.get('check_id')?.value && this.saleForm.get('payment_type')?.value == 'check'){
        formData.append('payment_type', 'check');
        formData.append('check_id', this.saleForm.get('check_id')?.value);
      }
    }


        formData.append('client_id', this.saleForm.get('vendor_id')?.value);
        if(this.selecteddelegateAccount){
          formData.append('delegate_id', this.saleForm.get('delegate_id')?.value || '');
        }
        formData.append('store_id', this.saleForm.get('store_id')?.value );
        formData.append('currency_id', this.saleForm.get('currency_id')?.value || '');
        formData.append('invoice_date', this.saleForm.get('date')?.value);
        formData.append('delegate_id', this.saleForm.get('delegate_id')?.value || '');
       
        formData.append('total',this.total.toString());
        formData.append('total_payed',this.totalPayed.toString());

        
        formData.append('notes', this.saleForm.get('notes')?.value || '');
        formData.append('date', this.saleForm.get('invoice_date')?.value );



        if (this.items && this.items.controls) {



            this.items.controls.forEach((itemControl, index) => {
                const itemValue = itemControl.value;

                if(itemValue.neededSerialNumbers >0){
                  alert('يجب ادخال كل السيريا المطلوب')
                  error =true;

                  return;

                }

                if (itemValue) {
                    formData.append(`items[${index}][product_branch_id]`, itemValue.product_id );
                    formData.append(`items[${index}][quantity]`, itemValue.amount || '0');
                    formData.append(`items[${index}][price]`, itemValue.price || '0');


                    const serialNumbers = itemControl.get('serialNumbers')?.value;

                  if(serialNumbers.length>0){

                    serialNumbers.forEach((item :any ,internalIndex:number)=>{
                      formData.append(`items[${index}][serial_numbers][${internalIndex}][serial_number]`, item.barcode );

                    });

                  }




              
                }
            });
        }

      
if(!error){

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
}
    }else{
      Object.keys(this.saleForm.controls).forEach((key) => {
        const control = this.saleForm.get(key);
        if (control && control.invalid) {
            console.log(`Invalid Field: ${key}`, control.errors);
        }
    });
    }
}

filteredAccounts: any[] = [];
selectedPopUP:string ='';
searchQuery: string = '';
selectedCashAccount:Account | null= null;
selecteddelegateAccount:Account | null= null;
selectedClient:any | null= null;

 
    removeCurrentDelegate(){
      this.selecteddelegateAccount =null;
    //  this.entryForm.patchValue({'delegate_id':null});
    }
    onCheckSearchChange(){
      
    }

    selectcheck(check:any){
      this.saleForm.patchValue({'check_id':check.id})
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
    

      openModal(modalId: string , type:string ) {
        if(modalId == 'checkModel'){}else if(modalId =='shiftModal'){

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
        this.saleForm.patchValue({'cash_id':account.id})

      }else if (this.selectedPopUP  == 'delegate'){
        this.selecteddelegateAccount = account;
        // this.entryForm.patchValue({'delegate_id':account.id})
        this.saleForm.patchValue({'delegate_id':account.id})

      }else if (this.selectedPopUP  == 'vendor'){
        this.selectedClient = account;
        this.saleForm.patchValue({'vendor_id':this.selectedClient.account.id});
        console.log('selectedClient',this.selectedClient);
      }

            this.cdr.detectChanges();

      this.closeModal('shiftModal');

    }
  
    filteredProducts:any;

    ProductsearchQuery ='';
    selectedProduct:any;
    onProductSearchChange(){

    }


    getSerialNumbers(productId:string , storeId:string , index:number){
      console.log('productId',productId);
      console.log('storeId',storeId);
      this._ProductsService.getSerialNumbers(productId ,storeId).subscribe({
        next: (response) => {
          if (response) {
            this.serialNumber = response.data;
            const itemsArray = this.saleForm.get('items') as FormArray;
            const itemGroup = itemsArray.at(this.productIndex) as FormGroup;
            itemGroup.patchValue({productSerialNumbers: this.serialNumber});
          
          }
        },
        error: (err) => {
          console.error(err);
        },
      });
    }


    selectProduct(product:any){
      const itemsArray = this.saleForm.get('items') as FormArray;
      const itemGroup = itemsArray.at(this.productIndex) as FormGroup;
    
      itemGroup.patchValue({product: product});
      itemGroup.patchValue({product_id: product.id});
      itemGroup.patchValue({color: product.product_color});

      
      product.product.prices.forEach((price:any)=>{
        if(price.id == this.selectedClient.price_category.id){
          itemGroup.patchValue({priceRanges: price.prices});
          console.log('price ranges' , price.prices);
          price.prices.forEach((price:any)=>{
            if(price.quantity_from == 0){
              itemGroup.patchValue({price: price.price});
              return;
            }
          })
        }
      });


      if(!itemGroup.get('price')?.value){
        itemGroup.patchValue({price: product.product.default_price});
      }

      // itemGroup.patchValue({price: product});


      this.getSerialNumbers(product.product.id ,this.selectedStore,this.productIndex );

      if(product.colors){

 if(product.colors.length>0){
        
  itemGroup.patchValue({colors: product.colors});

      }
      }
    

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


interface SerialNumber {
  serialNumber: string;
  
}