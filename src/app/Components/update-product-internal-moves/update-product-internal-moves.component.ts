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
        console.log(response.data);
        this.productMoves.patchValue({
          supervisor_name: response.data.supervisor_name,
          from_store_id: response.data.from_store_id?.id,
          to_store_id: response.data.to_store_id?.id,
          note: response.data.note,
        });
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
          console.log(response);
          this.stores = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  loadProducts(storeId: string) {
    this._ProductBranchStoresService.getByStoreId(storeId).subscribe({
      next: (response) => {
        if (response) {
          this.Products = response.data;

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
      const tempList = serialNumbers.filter(item => item.barcode !== serialNumber);
      item.patchValue({ serialNumbers: tempList });
      item.patchValue({ neededSerialNumbers: neededBars + 1 });
    }
  }
  addParcode(index: number) {
    const items = this.productMoves.get('items') as FormArray;
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
    const priceRanges = item.get('priceRanges')?.value || [];
    priceRanges.forEach((price: any) => {
      console.log('quantity_from', price.quantity_from);
      console.log('quantity_to', price.quantity_to);

      console.log('quantity', quantity);
      if (price.quantity_from < quantity && price.quantity_to >= quantity) {
        item.patchValue({ price: price.price });
      }
    })
    if (item.get('product')?.value?.product_branch.product.need_serial_number) {
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
                formData.append(`items[${index}][serial_numbers][${internalIndex}][serial_number]`, item.barcode);

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
    itemGroup.patchValue({ product_id: productBranchStore.product_branch.id });
  
    this.getSerialNumbers(productBranchStore.product_branch.product.id, this.selectedStore, this.productIndex);
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