import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators, ValidationErrors, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductsService } from '../../shared/services/products.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CurrencyService } from '../../shared/services/currency.service';
import { PriceService } from '../../shared/services/price.service';
import { TranslateModule } from '@ngx-translate/core';
import { ProductUnitsService } from '../../shared/services/product_units.service';
import { ProductCategoriesService } from '../../shared/services/product_categories.service';

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
  isSubmited=false;
  productForm: FormGroup;
  units: any[] = [];
  selectedFiles: any[] = [];
  selectedUnit: any ;
  selectedProductCategory: any ;
  pricesAreValid=false;
  priceCategories: PriceCategory[] = [];
  readonly maxImageSize = 2048 * 1024;
productCategories :any;
  
  get colors(): FormArray {
    return this.productForm.get('colors') as FormArray;
  }
  addColor() {
    this.colors.push(this.fb.group({
      color: [null,[Validators.required]],
      image: [null],
    }));
  }
  removeColor(index: number) {
    this.colors.removeAt(index);
  }
  onFileSelect(event: any) {
    if (event.target.files) {
      this.selectedFiles = [];
      for (let file of event.target.files) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.selectedFiles.push({ file, preview: e.target.result });
        };
        reader.readAsDataURL(file);
      }
    }
  }
  onFileColorSelect(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.colors.at(index).patchValue({ image: file }); // Storing Base64
      };
      reader.readAsDataURL(file);
    }
  }
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private _ProductsService: ProductsService,
    private _CurrencyService: CurrencyService,
    private _PriceService: PriceService,
    private _ProductUnitsService:ProductUnitsService,
    private _ProductCategoriesService:ProductCategoriesService
  ) {
    this.productForm = this.fb.group({
      name_ar: this.fb.control(null, [Validators.required, Validators.maxLength(255)]),
      product_name_en: this.fb.control(null, [Validators.required,Validators.maxLength(255)]),
      default_price :[null,[Validators.required]],
      product_category_id:[null,[Validators.required]],
      need_serial: this.fb.control(false), 
      product_description:[null],
      image: this.fb.control(null, [this.validateImage.bind(this),Validators.required]), // Removed required validator
      unit_id: this.fb.control(null, [Validators.required]),
      prices: this.fb.array([]),
      colors:  this.fb.array([]),
    });
    // this.addPrice();
    // this.addDeterminant();
  }
  onProductCategoryChange(event:Event){
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedProductCategory =selectedValue;
    // console.log(this.selectedUnit);
  }
  onUnitChange(event:Event){
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedUnit =selectedValue;
    // console.log(this.selectedUnit);
  }


  onPriceRangeChange(index: number ,rangeIndex: number, event: any) {
    const priceControl = this.prices.at(index) as FormGroup;
    const ranges = priceControl.get('ranges') as FormArray;
     let from_value= event.target.value;  

    if (ranges.length > rangeIndex+1) {
      const lastRange = ranges.at(rangeIndex + 1) as FormGroup;
      lastRange.patchValue({range_from: from_value} )
    }

    const range = ranges.at(rangeIndex) as FormGroup;

    if(range.get('range_from')?.value < range.get('range_to')?.value){
      this.pricesAreValid =true;
    }

 }


  removeRange(index: number , rangeIndex: number) {
    const priceControl = this.prices.at(index) as FormGroup;
    const ranges = priceControl.get('ranges') as FormArray;
    
    if (ranges.length > 0) {
      ranges.removeAt(rangeIndex);
    }
 }


  addPriceRange(index: number) {
    const priceControl = this.prices.at(index) as FormGroup;
    const ranges = priceControl.get('ranges') as FormArray;
    let last_price =0;
    this.pricesAreValid = false;
    if (ranges.length > 0) {
      const lastRange = ranges.at(ranges.length - 1) as FormGroup;
      last_price = lastRange.get('range_to')?.value;
    }
    
    ranges.push(this.fb.group({
      price: [null],
      range_to: [null],
      range_from: [last_price],


    }));
 }


 getRanges(index: number): FormArray {
  return (this.prices.at(index).get('ranges') as FormArray);
}
  // addPriceRange(){

  //   this.prices.ranges.push(this.fb.group({
  //     price: [null],
  //     // price_category_id: [priceCategory.id],
  //     // price_category_name: [priceCategory.name],
  //     // ranges:  this.fb.array([]),
  //   }));

  // }
  get prices(): FormArray {
    return this.productForm.get('prices') as FormArray;
  }

  removePrice(index: number) {
    if (this.prices.length > 1) {
      this.prices.removeAt(index);
    }
  }

  addPrice(priceCategory:PriceCategory) {
    this.prices.push(this.fb.group({
      price: [null],
      price_category_id: [priceCategory.id],
      price_category_name: [priceCategory.name],
      ranges:  this.fb.array([]),
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



  selectedFile: File | null = null;


  onFileCoverImageSelect(event: any): void {
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
    this.loadPriceCategories();
    this.loadProductCategories();
  }

  loadUnits(): void {
    this._ProductUnitsService.getAllProductUnits().subscribe({
      next: (response) => {
        if (response) {
          this.units = response.data;
          console.log('units:' ,this.units);
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }


  loadProductCategories(): void {
    this._ProductCategoriesService.getAllProductCategories().subscribe({
      next: (response) => {
        if (response) {
          this.productCategories = response.data;
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
          this.priceCategories.forEach((category)=>{
            this.addPrice(category);
          })
          
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  handleForm() {


    if(!this.pricesAreValid){
      alert('prices are invalid')
      return;
    }
    this.isSubmited =true;
    if (this.productForm.valid) {

 
      this.isLoading = true;
      const formData = new FormData();

      formData.append('name[ar]', this.productForm.get('name_ar')?.value);
      formData.append('name[en]', this.productForm.get('product_name_en')?.value);
      formData.append('product_unit_id', this.productForm.get('unit_id')?.value);
      formData.append('product_category_id', this.productForm.get('product_category_id')?.value);

      formData.append('default_price', this.productForm.get('default_price')?.value);
      formData.append('cover_image', this.productForm.get('image')?.value);
      formData.append('description', this.productForm.get('product_description')?.value || '');
 
      

      if(this.productForm.get('need_serial')?.value ){
        formData.append('need_serial_number', '1');
      } 


      let counter = 0;
      this.prices.controls.forEach((priceControl) => {
        const ranges = priceControl.get('ranges') as FormArray;

        if(ranges.length>0){

          ranges.controls.forEach((rangeControl) => {
            if(!rangeControl.get('price')?.value){
                alert('prices are invalid')
                return;
              
            }
           

            // $table->integer('quantity_from');
            // $table->integer('quantity_to');

          formData.append(`prices[${counter }][price]`, rangeControl.get('price')?.value);
          formData.append(`prices[${counter}][quantity_from]`, rangeControl.get('range_from')?.value);
          formData.append(`prices[${counter}][quantity_to]`, rangeControl.get('range_to')?.value);
          formData.append(`prices[${counter}][price_category_id]`, priceControl.get('price_category_id')?.value);
          counter++;
          });

        }
      });

      this.colors.controls.forEach((priceControl, index) => {
        formData.append(`colors[${index}][color]`, priceControl.get('color')?.value);
        if(priceControl.get('image')?.value){
          formData.append(`colors[${index}][image]`, priceControl.get('image')?.value);
        }
        
      });


      if(this.selectedFiles.length>0){
        this.selectedFiles.forEach((image , index)=>{
          formData.append(`images[${index}][image]`, image.file);

        });

      }
     
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


interface PriceCategory{
  id:number;
  name:string;

}