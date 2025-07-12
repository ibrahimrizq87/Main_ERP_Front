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
  imports: [CommonModule, TranslateModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-stocktakings.component.html',
  styleUrl: './add-stocktakings.component.css'
})
export class AddStocktakingsComponent implements OnInit {
  private productSubscription: Subscription = Subscription.EMPTY;
  isSubmited = false;
  stocktackingForm: FormGroup;
  confirmationForm: FormGroup;
  Products: any[] = [];
  msgError: any[] = [];
  isLoading: boolean = false;
  stores: any[] = [];
  selectedStore: string = '';
  selectedStoreObject: any;

  dynamicInputs: FormArray<FormControl>;
  inputDisabled: boolean[] = [];
  confirmationData: any = null;
  showConfirmationModal: boolean = false;
  filteredProducts: any;
  ProductsearchQuery = '';
  selectedProduct: any;
  productIndex: number = -1;
  selectedPopUP: string = '';
  searchQuery: string = '';

  constructor(
    private fb: FormBuilder,
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
    this.confirmationForm = this.fb.group({
      note: [''],
      date: [this.getTodayDate(), Validators.required]
    });
    this.dynamicInputs = this.fb.array([]);
  }

  ngOnInit(): void {
    this.loadStores();
  }

  // Form methods
  createItem(): FormGroup {
    return this.fb.group({
      amount: [null, Validators.required],
      product: [null],
      branch_id: ['', Validators.required],
    });
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

  // Data methods
  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  loadStores() {
    this._StoreService.getAllStores(
      'all',
      this.storeSearchQuery
    ).subscribe({
      next: (response) => {
        if (response) {
          this.stores = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  // onStoreChange(event: Event): void {
  //   const selectedValue = (event.target as HTMLSelectElement).value;
  //   this.selectedStore = selectedValue;
  //   this.stocktackingForm.patchValue({ store_id: selectedValue });
  //   this.loadProductBranches(this.selectedStore);
  // }

  openStoreModal() {
    const modalElement = document.getElementById('storeModal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }
  
  closeStoreModal() {
const modalElement = document.getElementById('storeModal');
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }  }

   selectStore(store: any) {
    this.stocktackingForm.patchValue({ store_id: store.id });
      this.selectedStore = store.id;
    this.loadProductBranches(this.selectedStore);

      this.closeStoreModal(); // Close modal after selection
    }


storeSearchQuery = '';
  loadProductBranches(storeId: string) {
    this._StocktakingService.getBranchesByStore(storeId).subscribe({
      next: (response) => {
        if (response) {
          this.Products = response.data;
          this.filteredProducts = this.Products;
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  // Product selection methods
  selectProduct(productBranchStore: any) {
    const itemsArray = this.stocktackingForm.get('items') as FormArray;
    const itemGroup = itemsArray.at(this.productIndex) as FormGroup;
    itemGroup.patchValue({
      product: productBranchStore,
      branch_id: productBranchStore.id
    });
    itemGroup.get('amount')?.enable();
    this.closeProductModel();
    this.cdr.detectChanges();
  }

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

  // Search methods
  onProductSearchChange() {
    const query = this.ProductsearchQuery.toLowerCase();
    this.filteredProducts = this.Products.filter(product =>
      product.name.toLowerCase().includes(query) || 
      product.code?.toString().includes(query) || 
      product.stock?.toString().includes(query)
    );
  }

  // Form submission methods
  handleForm() {
    this.isSubmited = true;

    if (this.stocktackingForm.valid) {
      this.isLoading = true;
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

      this._StocktakingService.getDifference(formData).subscribe({
        next: (response) => {
          if (response) {
            this.isLoading = false;
            this.confirmationData = response.data;
            this.openConfirmationModal();
          }
        },
        error: (err: HttpErrorResponse) => {
          this.handleError(err);
        },
      });
    } else {
      this.validateForm();
    }
  }

  // Confirmation modal methods
  openConfirmationModal() {
    this.showConfirmationModal = true;
    this.cdr.detectChanges();
    const modalElement = document.getElementById('confirmationModal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }

  closeConfirmationModal() {
    this.showConfirmationModal = false;
    const modalElement = document.getElementById('confirmationModal');
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }

  submitConfirmedData() {
    if (this.confirmationForm.valid && this.confirmationData) {
      this.isLoading = true;
      const formData = new FormData();

      formData.append('store_id', this.stocktackingForm.get('store_id')?.value);
      formData.append('note', this.confirmationForm.get('note')?.value);
      formData.append('date', this.confirmationForm.get('date')?.value);
      this.confirmationData.forEach((product: any, index: number) => {
        formData.append(`products[${index}][branch_id]`, product.product.id);
        formData.append(`products[${index}][quantity]`, product.quantity);
        formData.append(`products[${index}][type]`, product.type);
      });

      this._StocktakingService.save(formData).subscribe({
        next: (response) => {
          this.toastr.success('Stocktaking saved successfully');
          this.closeConfirmationModal();
          this._Router.navigate(['/dashboard/stocktakings']);
        },
        error: (err: HttpErrorResponse) => {
          this.handleError(err);
        }
      });
    }
  }

  // Helper methods
  private handleError(err: HttpErrorResponse) {
    this.isLoading = false;
    this.msgError = [];
    this.toastr.error("Error in processing request");
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
  }

  private validateForm() {
    Object.keys(this.stocktackingForm.controls).forEach((key) => {
      const control = this.stocktackingForm.get(key);
      if (control && control.invalid) {
        console.log(`Invalid Field: ${key}`, control.errors);
      }
    });
  }
}