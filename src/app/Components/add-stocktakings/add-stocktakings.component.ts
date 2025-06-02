import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { StoreService } from '../../shared/services/store.service';
import { StocktakingService } from '../../shared/services/stocktaking.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { Modal } from 'bootstrap';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-stocktakings',
  standalone: true,
  imports: [CommonModule ,TranslateModule,FormsModule ,ReactiveFormsModule],
  templateUrl: './add-stocktakings.component.html',
  styleUrl: './add-stocktakings.component.css'
})
export class AddStocktakingsComponent implements OnInit {


  private productSubscription: Subscription = Subscription.EMPTY;
  isSubmited = false;

  stocktackingForm: FormGroup;
  Products: any[] = [];
  msgError: any[] = [];
  isLoading: boolean = false;
 
  stores: any[] = [];
  selectedStore: string = '';

  dynamicInputs: FormArray<FormControl>;
  inputDisabled: boolean[] = [];
 

  constructor(private fb: FormBuilder,
    private _StoreService: StoreService,
    private _StocktakingService: StocktakingService,
    private _Router: Router,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,

  ) {
    this.stocktackingForm = this.fb.group({
      store_id: ['', Validators.required],
      items: this.fb.array([this.createItem()]),
    });
    this.dynamicInputs = this.fb.array([]);
  }





  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  ngOnInit(): void {
    this.loadStores();
   
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
    this.loadProductBranches(this.selectedStore);

  }
  selectedCurrency: any;
  onCurrencyChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;

    this.selectedCurrency = selectedValue;
  }

  loadProductBranches(storeId: string) {
    this._StocktakingService.getBranchesByStore(storeId).subscribe({
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
      amount: [null, Validators.required],
      product:[null],
      branch_id: ['', Validators.required],
    });
  }
  searchTerm = new FormControl('')
 

  disableInput(itemIndex: number, inputIndex: number): void {
    const items = this.stocktackingForm.get('items') as FormArray;
    const item = items.at(itemIndex) as FormGroup;
    const dynamicInputs = item.get('dynamicInputs') as FormArray<FormControl>;

    const control = dynamicInputs.at(inputIndex);
    if (control) control.disable();
  }


  getDynamicInputs(item: AbstractControl): FormArray {
    return (item.get('dynamicInputs') as FormArray);
  }





  get items() {
    return (this.stocktackingForm.get('items') as FormArray);
  }


  addItem(): void {
    this.items.push(this.createItem());
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

 
  handleForm() {

    this.isSubmited = true;


    if (this.stocktackingForm.valid) {
      this.isLoading = true;
      let error = false;
      const formData = new FormData();

      formData.append('store_id', this.stocktackingForm.get('store_id')?.value);
      if (this.items && this.items.controls) {
        this.items.controls.forEach((itemControl, index) => {
          const itemValue = itemControl.value;
       

          if (itemValue) {
            formData.append(`products[${index}][branch_id]`, itemValue.branch_id);
            formData.append(`products[${index}][quantity]`, itemValue.amount || '0');
          }
        });
      }


      if (!error) {

        this._StocktakingService.getDifference(formData).subscribe({
          next: (response) => {
            if (response) {
              this.toastr.success(' Stocktaking created successfully');
              console.log(response);
              this.isLoading = false;
              // this._Router.navigate(['/dashboard/stocktakings']);
            }
          },

          error: (err: HttpErrorResponse) => {
            this.isLoading = false;
            this.msgError = [];
            this.toastr.error(" Error in creating stocktaking");
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
      Object.keys(this.stocktackingForm.controls).forEach((key) => {
        const control = this.stocktackingForm.get(key);
        if (control && control.invalid) {
          console.log(`Invalid Field: ${key}`, control.errors);
        }
      });
    }
  }

 
  selectedPopUP: string = '';
  searchQuery: string = '';
 


  
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
     


    }

    // console.log('hrerererer');
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
      product.name.toLowerCase().includes(query) || product.code.toString().includes(query) || product.stock.toString().includes(query)
    );

  }


 

  selectProduct(productBranchStore: any) {
    const itemsArray = this.stocktackingForm.get('items') as FormArray;
    const itemGroup = itemsArray.at(this.productIndex) as FormGroup;

    itemGroup.patchValue({ product: productBranchStore });
    console.log('productBranchStore', productBranchStore);
    itemGroup.patchValue({ branch_id: productBranchStore.id });
    itemGroup.patchValue({ color: productBranchStore.color });
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





