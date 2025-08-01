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
import { ColorService } from '../../shared/services/colors.service';
import { DeterminantService } from '../../shared/services/determinants.service';
import { ToastrService } from 'ngx-toastr';

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
  mainColors:any;
  MainDeterminants:Determinant [] = [];

loadDeterminants(): void {
  this._DeterminantService.getAllDeterminants().subscribe({
    next: (response) => {
      if (response) {
        this.MainDeterminants = response.data;
      }
    },
    error: (err) => {
      console.error(err);
    }
  });
}
  get colors(): FormArray {
    return this.productForm.get('colors') as FormArray;
  }
  get determinants(): FormArray {
    return this.productForm.get('determinants') as FormArray;
  }

  removeDeterminant(index: number) {
    this.determinants.removeAt(index);
  }
  
  barcode = '';
  generateBarcode() {
    this.barcode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
  }
  onDeterminantChnage(event:Event , index:number){

  }
  addDeterminant() {
    const id = this.productForm.get('determinant_id')?.value;

    if(id){
    let isDublicted = false;

    this.determinants.controls.forEach((element) => {
      if(element.get('determinant_id')?.value ==  id){
        isDublicted = true;
      }
    });
      if (!isDublicted){
        const determinant = this.MainDeterminants.find(d => d.id == id);
         this.determinants.push(this.fb.group({
           determinant_name: [determinant?.name],
           determinant_id: [determinant?.id],
     
         }));
      }else{
     
        this.toastr.error('لقد تم اختيار هذا المحمدد من قبل');
      }
      this.productForm.patchValue({determinant_id : null});

    }
   
  }

  addColor() {
    this.colors.push(this.fb.group({
      color_id: [null,[Validators.required]],
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
        this.colors.at(index).patchValue({ image: file }); 
      };
      reader.readAsDataURL(file);
    }
  }
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private _ColorService:ColorService,
    private _ProductsService: ProductsService,
    private _DeterminantService: DeterminantService,
    private _PriceService: PriceService,
    private _ProductUnitsService:ProductUnitsService,
    private _ProductCategoriesService:ProductCategoriesService,
    private toastr: ToastrService,

  ) {
    this.productForm = this.fb.group({
      name_ar: this.fb.control(null, [Validators.required, Validators.maxLength(255)]),
      product_name_en: this.fb.control(null, [Validators.required,Validators.maxLength(255)]),
      product_category_id:[null,[Validators.required]],
      need_serial: this.fb.control(false), 
      need_customer_details :this.fb.control(false), 
      product_description:[null],
      determinant_id:[null],
      image: this.fb.control(null, [this.validateImage.bind(this),Validators.required]),
      unit_id: this.fb.control(null, [Validators.required]),
      prices: this.fb.array([]),
      colors:  this.fb.array([]),
      determinants: this.fb.array([]),
    });
  }
  onProductCategoryChange(event:Event){
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedProductCategory =selectedValue;
   }
  onUnitChange(event:Event){
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedUnit =selectedValue;
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
    this.generateBarcode();
    this.loadColors();
    this.loadUnits();
    this.loadDeterminants();
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


  loadColors(): void {
    this._ColorService.viewAllColors().subscribe({
      next: (response) => {
        if (response) {
          this.mainColors = response.data; 
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  handleForm() {

    this.isSubmited =true;
    if (this.productForm.valid) {

 
      this.isLoading = true;
      const formData = new FormData();

      formData.append('name[ar]', this.productForm.get('name_ar')?.value);
      formData.append('name[en]', this.productForm.get('product_name_en')?.value);
      formData.append('product_unit_id', this.productForm.get('unit_id')?.value);
      formData.append('product_category_id', this.productForm.get('product_category_id')?.value);
      formData.append('cover_image', this.productForm.get('image')?.value);
      formData.append('description', this.productForm.get('product_description')?.value || '');
 
      formData.append('barcode', this.barcode);

      if(this.productForm.get('need_serial')?.value ){
        formData.append('need_serial_number', '1');
      } 

    if(this.productForm.get('need_customer_details')?.value ){
        formData.append('need_customer_details', '1');
      } 

      let counter = 0;
      this.determinants.controls.forEach((determinant ,index) => {
        formData.append(`determinants[${index}][determinant_id]`, determinant.get('determinant_id')?.value);
      });
      this.colors.controls.forEach((priceControl, index) => {
        formData.append(`colors[${index}][color_id]`, priceControl.get('color_id')?.value);
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
            this.toastr.success('تم اضافه المنتج بنجاح');
            this.router.navigate(['/dashboard/products']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error('حدث خطا اثناء اضافه المنتج');
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



interface Determinant{
  id:number;
  name:string;
  values: DeterminantValues[];

}

interface DeterminantValues{
  id:number;
  value:string;
}