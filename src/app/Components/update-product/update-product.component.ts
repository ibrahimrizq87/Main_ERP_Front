import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ProductsService } from '../../shared/services/products.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CurrencyService } from '../../shared/services/currency.service';
import { PriceService } from '../../shared/services/price.service';
import { Modal } from 'bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-update-product',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule ,TranslateModule],
  templateUrl: './update-product.component.html',
  styleUrl: './update-product.component.css'
})
export class UpdateProductComponent implements OnInit {
  msgError: string = '';
  msgSuccess: string = '';
  isLoading: boolean = false;
  productForm: FormGroup;
  units: any[] = [];
  readonly maxImageSize = 2048 * 1024;
  productImageUrl: string | null = null; 
  // selectedFile: File | null = null;
  determinantsarray:any[]=[];
  priceCategories:any[]=[];
  currencies: any[] = []; 
  selectedCurrency: any;
  selectedPriceCategory: any ;
  selectedUnit: any ;
  selectedDeterminant: any
  constructor(
    private fb: FormBuilder,
    private _ProductsService: ProductsService,
    private router: Router,
    private route: ActivatedRoute,
    private _CurrencyService:CurrencyService,
    private _PriceService:PriceService,
  ) {
    this.productForm = this.fb.group({
      name_ar: this.fb.control(null, [Validators.required,Validators.maxLength(255)]),
      product_name_en: this.fb.control(null,[Validators.maxLength(255)]),
      // type: this.fb.control(null ,[Validators.required]),
      product_dimension:this.fb.control(null),
      image: this.fb.control(null), 
      // amount:this.fb.control(null), 
      unit_id:this.fb.control(null),
      prices: this.fb.array([]),
      determinants:this.fb.array([]),
      purchase_price:this.fb.control(null)
    });
    this.addPrice();
    this.addDeterminant();
  }
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
      currency_id:[null]
    }));
  }
  get determinants (): FormArray {
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

  // selectUnit(unit: any, modalId: string) {
  //   this.selectedUnit = unit;
  //   this.productForm.get('unit_id')?.setValue(unit.id);
  //   this.closeModal(modalId);
  // }
  selectUnit(unit: any, modalId: string) {
    this.selectedUnit = unit; // Update selectedUnit
    this.productForm.get('unit_id')?.setValue(unit.id); // Update form control
    this.closeModal(modalId); // Close the modal
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
  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.fetchProductData(productId);
    }
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
          console.log(response);
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
          console.log(response);
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
          console.log(response);
          this.determinantsarray = response.data; 
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  // fetchProductData(productId: string): void {
  //   this._ProductsService.viewProductById(productId).subscribe({
  //     next: (response) => {
  //       if (response) {
  //         console.log(response)
  //         const product = response.product;
  //         this.productForm.patchValue({
  //           name_ar: product.name_ar,
  //           product_name_en: product.name_en,
  //           product_dimension: product.product_dimension,
  //           unit_id: product.unit_id,

  //         });
  //         this.productImageUrl = product.image; // Set the existing image URL
  //       }
  //     },
  //     error: (err: HttpErrorResponse) => {
  //       this.msgError = err.error.error;
  //     }
  //   });
  // }
  fetchProductData(productId: string): void {
    this._ProductsService.viewProductById(productId).subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          const product = response.product;
  
          // Patch main product fields
          this.productForm.patchValue({
            name_ar: product.name_ar,
            product_name_en: product.name_en,
            product_dimension: product.product_dimension,
            purchase_price:product.purchase_price
          });
  
          this.productImageUrl = product.image; // Set the existing image URL
          if (!this.selectedUnit) {
            this.selectedUnit = product.unit;
          }
          // this.selectedUnit = product.unit; // Set the unit
          this.prices.clear(); // Clear existing prices
          this.determinants.clear(); // Clear determinants
  
          // Patch product prices
          product.product_prices.forEach((price: any) => {
            this.prices.push(
              this.fb.group({
                price: [price.price, Validators.required],
                currency_id: [price.currency.id, Validators.required],
                price_category_id: [price.price_category.id, Validators.required],
              })
            );
  
            // Set selectedCurrency from the first price entry
            if (!this.selectedCurrency) {
              this.selectedCurrency = price.currency;
            }
  
            // Set selectedPriceCategory from the first price entry
            if (!this.selectedPriceCategory) {
              this.selectedPriceCategory = price.price_category;
            }
          });
  
          product.determinants.forEach((det: any) => {
            this.determinants.push(
              this.fb.group({
                determinant_id: [det.determinant.id, Validators.required],
                value: [det.value, Validators.required],
              })
            );
  
            // Set selectedDeterminant from the first determinant entry
            if (!this.selectedDeterminant) {
              this.selectedDeterminant = det.determinant;
            }
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.msgError = err.error.error;
      },
    });
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
  handleForm() {
    if (this.productForm.valid) {
      this.isLoading = true;
      const formData = new FormData();
  
      // Append general product form data
      formData.append('name_ar', this.productForm.get('name_ar')?.value);
      formData.append('name_en', this.productForm.get('product_name_en')?.value);
      formData.append('product_dimension', this.productForm.get('product_dimension')?.value);
      formData.append('amount', '0');
      // console.log(this.selectedUnit?.id)
      // formData.append('unit_id', this.productForm.get('unit_id')?.value);
      formData.append('unit_id', this.selectedUnit?.id);
      // Append image only if selected
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }
  
      // Append price data
      this.prices.controls.forEach((priceControl, index) => {
        formData.append(`prices[${index}][price]`, priceControl.get('price')?.value);
        formData.append(`prices[${index}][price_category_id]`, priceControl.get('price_category_id')?.value);
        formData.append(`prices[${index}][currency_id]`, priceControl.get('currency_id')?.value);
      });
  
      // Append determinants data
      this.determinants.controls.forEach((determinantControl, index) => {
        formData.append(`determinants[${index}][value]`, determinantControl.get('value')?.value);
        formData.append(`determinants[${index}][determinant_id]`, determinantControl.get('determinant_id')?.value);
      });
      formData.append('purchase_price', this.productForm.get('purchase_price')?.value);
  
      const branchId = this.route.snapshot.paramMap.get('id');
      if (branchId) {
        this._ProductsService.updateProduct(branchId, formData).subscribe({
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
  

  onCancel(): void {
    this.productForm.reset();
    this.router.navigate(['/dashboard/products']);
  }
}
