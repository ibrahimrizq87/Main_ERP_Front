import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { StoreService } from '../../shared/services/store.service';
import { ProductsService } from '../../shared/services/products.service';
import { ProductBranchStoresService } from '../../shared/services/product-branch-stores.service';
import { ProductInternalMovesService } from '../../shared/services/product-internal-moves.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Modal } from 'bootstrap';
import { Store } from '../../models/product.model';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-update-product-internal-moves',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,TranslateModule,FormsModule],
  templateUrl: './update-product-internal-moves.component.html',
  styleUrl: './update-product-internal-moves.component.css'
})
export class UpdateProductInternalMovesComponent implements OnInit, AfterViewInit  {
  private productSubscription: Subscription = Subscription.EMPTY;
  isSubmited = false;
  serialNumber: SerialNumber[] = [];
  productMoves: FormGroup;
  Products: any[] = [];
  msgError: any[] = [];
  isLoading: boolean = false;
  stores: any[] = [];
  selectedType: string = 'purchase';
  selectedStore: string = '';
  productDeterminants: any[] = [];
  dynamicInputs: FormArray<FormControl>; 
  inputDisabled: boolean[] = []; 
 
 ///////////////////////
 selectedFromStore: any = null;
selectedToStore: any = null;
storeModalTarget: 'from' | 'to' = 'from';
storeSearchQuery: string = '';
filteredStores: any[] = [];

  constructor(private fb: FormBuilder,
    private _StoreService: StoreService,
    private _ProductsService: ProductsService,
    private _ProductBranchStoresService: ProductBranchStoresService,
    private _ProductInternalMovesService: ProductInternalMovesService,
    private _Router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute,

  ) {
    this.productMoves = this.fb.group({
      supervisor_name: ['',Validators.maxLength(255)],
      from_store_id: ['', Validators.required],
      to_store_id: ['', Validators.required],
      note: [''],
      items: this.fb.array([this.createItem()])
    });
    this.dynamicInputs = this.fb.array([]);
  }
 
  @ViewChild('storeModalRef', { static: false }) storeModalRef: any;
  storeModal: Modal | null = null;
  ngAfterViewInit(): void {
    if (this.storeModalRef) {
      this.storeModal = new Modal(this.storeModalRef.nativeElement);
    }
  }
 
  ngOnInit(): void {
    this.loadStores();
    const productMoveId = this.route.snapshot.paramMap.get('id');
    if (productMoveId) {
      this.fetchMoveData(productMoveId);
    }
  }
  fetchMoveData(productMoveId: string): void {
    this._ProductInternalMovesService.getProductMovesById(productMoveId).subscribe({
      next: (response) => {

        const moveData = response.data;
        console.log('moveData:' , response.data);
        this.productMoves.patchValue({
          supervisor_name: moveData.supervisor_name,
          from_store_id: moveData.from_store?.id,
          to_store_id: moveData.to_store?.id,
          note: moveData.note,
        });





          while (this.items.length !== 0) {
            this.items.removeAt(0);
          }



          moveData.items.forEach((item: any) => {
            const newItem = this.createItem();
            this.items.push(newItem);

            const index = this.items.length - 1;
            const itemGroup = this.items.at(index) as FormGroup;
            itemGroup.patchValue({
              product_id: item.product_branch.id,
              product: item.product_branch,
              color: item.product_branch?.color ? {
                color: item.product_branch.color.color,
                image: item.product_branch.color.image
              } : null,
              quantity: item.quantity,
              serialNumbers: item.serials || [],
              neededSerialNumbers: 0
            });
          });


        

        this.selectedFromStore =moveData.from_store;
        this.selectedToStore = moveData.to_store;


        this.loadProducts(this.selectedFromStore.id);







      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching purchase data:', err.message);
      }
    });
  }
  openStoreModal(target: 'from' | 'to') {
    this.storeModalTarget = target;
    this.filteredStores = [...this.stores]; // Reset search
    this.storeModal?.show();
  }
  
  closeStoreModal() {
    this.storeModal?.hide();
  }
  selectStore(store: Store) {
    if (this.storeModalTarget === 'from') {
      this.selectedFromStore = store;
      this.productMoves.get('from_store_id')?.setValue(store.id);
      this.onStoreChangeByStore(store.id.toString()); // Convert store.id to a string
    } else {
      this.selectedToStore = store;
      this.productMoves.get('to_store_id')?.setValue(store.id);
    }
    this.closeStoreModal(); // Close modal after selection
  }
  onStoreChangeByStore(storeId: string): void {
    this.selectedStore = storeId;
    this.loadProducts(storeId);
  }  
  filterStores() {
    const query = this.storeSearchQuery.toLowerCase();
    this.filteredStores = this.stores.filter(store =>
      store.name.toLowerCase().includes(query) || store.id.toString().includes(query)
    );
  }
  loadStores() {
    this._StoreService.getAllStores().subscribe({
      next: (response) => {
        if (response) {
          // console.log(response);
          this.stores = response.data.stores;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  loadProducts(storeId: string) {
    this._ProductBranchStoresService.getByStoreIdWithoutPrices(storeId,
       this.ProductsearchQuery
    ).subscribe({
      next: (response) => {
        if (response) {
          this.Products = response.data.products;

          console.log('product branches', response);
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
      quantity: [null, Validators.required],
      product_id: ['', Validators.required],
      product: [null],
      need_serial: [false],
      barcode: [null],
      productSerialNumbers: [[]],
      serialNumbers: [[]],
      neededSerialNumbers: [0],
    });
  }
  searchTerm = new FormControl('');

  onBarcodeSelect(barcode: Event, index: number) {
    {
      const selectedValue = (barcode.target as HTMLSelectElement).value;

      const items = this.productMoves.get('items') as FormArray;
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
    const items = this.productMoves.get('items') as FormArray;
    const item = items.at(index) as FormGroup;
    const neededBars = item.get('neededSerialNumbers')?.value;
    const serialNumbers = item.get('serialNumbers')?.value;
    if (serialNumbers && Array.isArray(serialNumbers)) {
      const tempList = serialNumbers.filter(item => item.serial_number !== serialNumber);
      item.patchValue({ serialNumbers: tempList });
      item.patchValue({ neededSerialNumbers: neededBars + 1 });
    }
  }



  onquantityChange(index: number): void {

    const items = this.productMoves.get('items') as FormArray;
    const item = items.at(index) as FormGroup;
    let quantity = item.get('quantity')?.value || 0;
    const stock = item.get('product')?.value.stock;
    const serialNumbers = item.get('serialNumbers')?.value.length || 0;

    if (quantity > stock) {
      quantity = stock;
      item.patchValue({ quantity: stock });
    }

    if (item.get('product')?.value?.product.need_serial_number) {
      if (typeof quantity === 'number' && quantity >= 0) {
        item.patchValue({ neededSerialNumbers: quantity - serialNumbers })

      } else {
        console.warn('Invalid quantity:', quantity);
      }
    }

  }
 
  

  disableInput(itemIndex: number, inputIndex: number): void {
    const items = this.productMoves.get('items') as FormArray;
    const item = items.at(itemIndex) as FormGroup;
    const dynamicInputs = item.get('dynamicInputs') as FormArray<FormControl>;

    const control = dynamicInputs.at(inputIndex);
    if (control) control.disable();
  }


  getDynamicInputs(item: AbstractControl): FormArray {
    return (item.get('dynamicInputs') as FormArray);
  }
  get items() {
    return (this.productMoves.get('items') as FormArray);
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
    if (this.productMoves.valid) {
      this.isLoading = true;
      let error = false;
      const formData = new FormData();
      formData.append('supervisor_name', this.productMoves.get('supervisor_name')?.value);
      formData.append('from_store_id', this.productMoves.get('from_store_id')?.value);
      formData.append('to_store_id', this.productMoves.get('to_store_id')?.value);
      formData.append('note', this.productMoves.get('note')?.value);
      // formData.append('product_branch_id', "1");
      // formData.append('quantity', "2");
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
            formData.append(`items[${index}][quantity]`, itemValue.quantity || '0');
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
        const productMoveId = this.route.snapshot.paramMap.get('id');
        if(productMoveId){
        this._ProductInternalMovesService.updateProductMovesById(productMoveId,formData).subscribe({
          next: (response) => {
            if (response) {
              this.toastr.success('تم تعديل Move بنجاح');
              console.log(response);
              this.isLoading = false;
              this._Router.navigate(['/dashboard/productInternalMoves/waiting']);
            }
          },

          error: (err: HttpErrorResponse) => {
            this.isLoading = false;
            this.msgError = [];
            this.toastr.error('حدث خطا اثناء اضافه Move');
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
      }}
    } else {
      Object.keys(this.productMoves.controls).forEach((key) => {
        const control = this.productMoves.get(key);
        if (control && control.invalid) {
          console.log(`Invalid Field: ${key}`, control.errors);
        }
      });
    }
  }

  closeModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }

  openModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }
 

  filteredProducts: any;
  ProductsearchQuery = '';
  selectedProduct: any;
  onProductSearchChange() {
    const query = this.ProductsearchQuery.toLowerCase();
    this.filteredProducts = this.Products.filter(product =>
      product.product_branch.product.name.toLowerCase().includes(query) || product.product_branch.code.toString().includes(query)||product.product_branch.stock.toString().includes(query)
    );
  }

  getSerialNumbers(productId: string, storeId: string, index: number) {
    console.log('productId', productId);
    console.log('storeId', storeId);
    this._ProductsService.getSerialNumbers(productId, storeId).subscribe({
      next: (response) => {
        if (response) {
          this.serialNumber = response.data;
          const itemsArray = this.productMoves.get('items') as FormArray;
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
    const itemsArray = this.productMoves.get('items') as FormArray;
    const itemGroup = itemsArray.at(this.productIndex) as FormGroup;

    itemGroup.patchValue({ product: productBranchStore });
    console.log('productBranchStore', productBranchStore);
    itemGroup.patchValue({ product_id: productBranchStore.branch.id });
  
    this.lastSelectedIndex =-1;
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
  onCancel(): void {
    this.productMoves.reset();
   
    this._Router.navigate(['/dashboard/productInternalMoves/waiting']); 
  }  








  searchText: string = '';
  selectedSerachIndex = -1;
  lastSelectedIndex = -1;



  productSerialNumbers: any = [];
  loadingSerialNumbers = false;

  searchSerialNumber(event: Event, index: number) {
    this.searchText = (event.target as HTMLSelectElement).value;
    this.selectedSerachIndex = index;
    const itemsArray = this.productMoves.get('items') as FormArray;

    const itemGroup = itemsArray.at(index) as FormGroup;
    const store_id = this.productMoves.get('store_id')?.value;
    const productId = itemGroup.get('product')?.value?.id;

    if (store_id && productId) {
      this.loadSerialNumbers(store_id, productId);
    }
  }

  onFocus(index: number) {
    const itemsArray = this.productMoves.get('items') as FormArray;
    this.selectedSerachIndex = index;

    const itemGroup = itemsArray.at(index) as FormGroup;
    const store_id = this.productMoves.get('from_store_id')?.value;
    const productId = itemGroup.get('product')?.value?.product.id;
    const searchText = itemGroup.get('barcode')?.value || '';
    // const serialNumbers = itemGroup.get('serialNumbers')?.value || '';

  console.log(store_id ,productId, searchText);





  
    

    if (store_id && productId && this.lastSelectedIndex != index) {
      this.productSerialNumbers = [];
      this.searchText = searchText;
      this.loadSerialNumbers(store_id, productId);
    }
    this.lastSelectedIndex = index;

  }
  selectOption(serialNumber: any, index: number, GivenserialNumber: any = null) {
    const items = this.productMoves.get('items') as FormArray;
    const item = items.at(index) as FormGroup;

    const CurrentSerialNumber = GivenserialNumber ? GivenserialNumber : serialNumber;
    const neededBars = item.get('neededSerialNumbers')?.value;
    if (neededBars == 0) {
      return;
    }
    let tempList = item.get('serialNumbers')?.value || [];
    console.log(CurrentSerialNumber);

    if (CurrentSerialNumber) {
      tempList.push({ serial_number: CurrentSerialNumber.serial_number, id: CurrentSerialNumber.id })
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



  loadSerialNumbers(store_id: string, productId: string) {
    this.loadingSerialNumbers = true;

    this._ProductsService.getSerialNumbers(productId, store_id,
      this.searchText,
      'sale'
    ).subscribe({
      next: (response) => {
        if (response) {
          this.productSerialNumbers = response.data.serial_numbers;
          console.log(this.productSerialNumbers);
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

  isOptionDisabled(serialNumber: any, index: number): boolean {
    const items = this.productMoves.get('items') as FormArray;
    const item = items.at(index) as FormGroup;
    const tempList = item.get('serialNumbers')?.value || [];
    let value = false;
    tempList.forEach((element: any) => {
      if (serialNumber.serial_number == element.serial_number) {
        value = true;
      }
    });

    return value;
  }


}





interface Account {
  id: string;
  name: string;
  account:Account;
  currency: Currency
}



interface Currency {
  id: string;
  name: string;
}

interface SerialNumber {
  serialNumber: string;

}