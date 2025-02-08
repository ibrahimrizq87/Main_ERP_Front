import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators, ValidationErrors, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductsService } from '../../shared/services/products.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CurrencyService } from '../../shared/services/currency.service';
import { PriceService } from '../../shared/services/price.service';
// import bootstrap from 'bootstrap';
import { Modal } from 'bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule ,FormsModule, ReactiveFormsModule,TranslateModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent implements OnInit {
  msgError: string = '';
  isLoading: boolean = false;
  productForm: FormGroup;
  units: any[] = [];
  selectedCurrency: any;
  selectedPriceCategory: any ;
  selectedUnit: any ;
  currencies: any[] = [];
  determinantsarray: any[] = [];
  priceCategories: any[] = [];
  selectedDeterminant: any
  readonly maxImageSize = 2048 * 1024;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private _ProductsService: ProductsService,
    private _CurrencyService: CurrencyService,
    private _PriceService: PriceService
  ) {
    this.productForm = this.fb.group({
      name_ar: this.fb.control(null, [Validators.required, Validators.maxLength(255)]),
      product_name_en: this.fb.control(null, [Validators.maxLength(255)]),
      product_dimension: this.fb.control(null),
      image: this.fb.control(null, [this.validateImage.bind(this)]), // Removed required validator
      unit_id: this.fb.control(null, [Validators.required]),
      prices: this.fb.array([]),
      determinants: this.fb.array([]),
      purchase_price:this.fb.control(null)
    });
    this.addPrice();
    this.addDeterminant();
  }
  openModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }
  
  closeModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }
  // selectCurrency(currency: any, modalId: string) {
  //   this.selectedCurrency = currency;
  //   this.closeModal(modalId);
  // }
  // selectCurrency(currency: any, modalId: string) {
  //   this.selectedCurrency = currency;
  //   this.prices.at(this.prices.length - 1).patchValue({ currency_id: currency.id });
  //   this.closeModal(modalId);
  // }
  // selectPriceCategory(priceCategory: any, modalId: string) {
  //   this.selectedPriceCategory = priceCategory;
  //   this.prices.at(this.prices.length - 1).patchValue({ price_category_id: priceCategory.id });
  //   this.closeModal(modalId);
  // }

  selectUnit(unit: any, modalId: string) {
    this.selectedUnit = unit;
    this.productForm.get('unit_id')?.setValue(unit.id);
    this.closeModal(modalId);
  }
  // selectPriceCategory(priceCategory: any, modalId: string) {
  //   this.selectedPriceCategory = priceCategory;
  //   this.closeModal(modalId);
  // }
  // selectDeterminant(determinant: any, modalId: string) {
  //   this.selectedDeterminant = determinant;
  //   this.determinants.at(this.determinants.length - 1).patchValue({ determinant_id: determinant.id });
  //   this.closeModal(modalId);
  // }
  get prices(): FormArray {
    return this.productForm.get('prices') as FormArray;
  }

  removePrice(index: number) {
    if (this.prices.length > 1) {
      this.prices.removeAt(index);
    }
  }

  addPrice() {
    this.prices.push(this.fb.group({
      price: [null],
      price_category_id: [null],
      currency_id: [null]
    }));
  }

  get determinants(): FormArray {
    return this.productForm.get('determinants') as FormArray;
  }

  removeDeterminant(index: number) {
    if (this.determinants.length > 1) {
      this.determinants.removeAt(index);
    }
  }

  addDeterminant() {
    this.determinants.push(this.fb.group({
      value: [null],
      determinant_id: [null],
    }));
  }

  selectedFile: File | null = null;

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.productForm.patchValue({ image: file });
    }
  }

  validateImage(control: AbstractControl): ValidationErrors | null {
    const file = this.selectedFile;
    if (file) {
      const fileType = file.type;
      const fileSize = file.size;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(fileType)) {
        return { invalidFileType: true };
      }
      if (fileSize > this.maxImageSize) {
        return { fileTooLarge: true };
      }
    }
    return null;
  }

  ngOnInit(): void {
    this.loadUnits();
    this.loadCurrencies();
    this.loadPriceCategories();
    this.loadDeteminants();
  }

  loadUnits(): void {
    this._ProductsService.viewProductUnits().subscribe({
      next: (response) => {
        if (response) {
          this.units = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  loadCurrencies(): void {
    this._CurrencyService.viewAllCurrency().subscribe({
      next: (response) => {
        if (response) {
          this.currencies = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  loadPriceCategories(): void {
    this._PriceService.viewAllCategory().subscribe({
      next: (response) => {
        if (response) {
          this.priceCategories = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  loadDeteminants(): void {
    this._ProductsService.viewAllDeterminants().subscribe({
      next: (response) => {
        if (response) {
          this.determinantsarray = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  handleForm() {
    if (this.productForm.valid) {
      this.isLoading = true;
      const formData = new FormData();

      formData.append('name_ar', this.productForm.get('name_ar')?.value);
      formData.append('name_en', this.productForm.get('product_name_en')?.value);
      formData.append('product_dimension', this.productForm.get('product_dimension')?.value);
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }
      formData.append('unit_id', this.productForm.get('unit_id')?.value);
      formData.append('amount','0') ;
      this.prices.controls.forEach((priceControl, index) => {
        formData.append(`prices[${index}][price]`, priceControl.get('price')?.value);
        formData.append(`prices[${index}][price_category_id]`, priceControl.get('price_category_id')?.value);
        formData.append(`prices[${index}][currency_id]`, priceControl.get('currency_id')?.value);
      });

      this.determinants.controls.forEach((determinantControl, index) => {
        formData.append(`determinants[${index}][value]`, determinantControl.get('value')?.value);
        formData.append(`determinants[${index}][determinant_id]`, determinantControl.get('determinant_id')?.value);
      });
      formData.append('purchase_price', this.productForm.get('purchase_price')?.value);
      this._ProductsService.addProduct(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response) {
            this.router.navigate(['/dashboard/products']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.msgError = err.error.error;
        }
      });
    }
  }
}
