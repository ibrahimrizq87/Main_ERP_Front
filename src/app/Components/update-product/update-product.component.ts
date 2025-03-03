import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators, ValidationErrors, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../shared/services/products.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CurrencyService } from '../../shared/services/currency.service';
import { PriceService } from '../../shared/services/price.service';
import { TranslateModule } from '@ngx-translate/core';
import { ProductUnitsService } from '../../shared/services/product_units.service';
import { ProductCategoriesService } from '../../shared/services/product_categories.service';

@Component({
  selector: 'app-update-product',
  standalone: true,
  imports: [CommonModule ,FormsModule, ReactiveFormsModule,TranslateModule],
  templateUrl: './update-product.component.html',
  styleUrl: './update-product.component.css'
})
export class UpdateProductComponent implements OnInit {

    productColors: ProductColor[] =[];
    productImages: ProductImage [] =[];
    msgError: string = '';
    isLoading: boolean = false;
    isSubmited=false;
    productForm: FormGroup;
    units: any[] = [];
    selectedFiles: any[] = [];
    selectedUnit: any ;
    selectedProductCategory: any ;
    productPrices:ProductPrice[]=[];
    priceCategories: PriceCategory[] = [];
    pricesAreValid=false;
    currentProductImage ='images/image.jpg';
    readonly maxImageSize = 2048 * 1024;
  productCategories :any;
    
    get colors(): FormArray {
      return this.productForm.get('colors') as FormArray;
    }
    addColor(myColor: ProductColor | null) {
      let colorName = myColor?.color ?? ''; 
      let colorId = myColor?.id ?? null; 
      let colorImage = myColor?.image ?? ''; 

      this.colors.push(this.fb.group({
        color: [colorName, [Validators.required]],
        image: [null],
        currentImage: [colorImage],
        id: [colorId],

      }));
    }
    removeColor(index: number) {
      const colorItem = this.colors.at(index).value; 

      if (colorItem.id) {
        this.productColors.push({
          id: colorItem.id,
          image: colorItem.currentImage || null, 
          color: colorItem.color || '' 
        });
      }
    
    
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
    // fetchImage(url: string) {
    //   fetch(url)
    //     .then(response => response.blob()) 
    //     .then(blob => {
    //       const file = new File([blob], "image.png", { type: blob.type }); 
    //       const reader = new FileReader();
    
    //       reader.onload = (e: any) => {
    //         this.selectedFiles.push({ file, preview: e.target.result });
    //       };

    //       console.log(url);
    
    //       reader.readAsDataURL(file); 
    //     })
    //     .catch(error => console.error("Error fetching image:", error));
    // }
    
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
      private _ProductCategoriesService:ProductCategoriesService,
        private route: ActivatedRoute
    ) {
      this.productForm = this.fb.group({
        name_ar: this.fb.control(null, [Validators.required, Validators.maxLength(255)]),
        product_name_en: this.fb.control(null, [Validators.required,Validators.maxLength(255)]),
        default_price :[null,[Validators.required]],
        product_category_id:[null,[Validators.required]],
  
        product_description:[null],
        image: this.fb.control(null, [this.validateImage.bind(this)]), // Removed required validator
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
    get prices(): FormArray {
      return this.productForm.get('prices') as FormArray;
    }
  
    removePrice(index: number) {
      if (this.prices.length > 1) {
        this.prices.removeAt(index);
      }
    }
    createRangeGroup(price:ProductPrice): FormGroup {
      return this.fb.group({
          id: [price.id], // Price ID
          range_from: [price.quantity_from], // Minimum quantity
          range_to: [price.quantity_to], // Maximum quantity
          price: [price.price], // Price value
      });
  }


    addPrice(priceCategory:PriceCategory ,price:PriceCategory |null) {
      if(price != null){

          const priceForm = this.fb.group({
            price_category_id: [priceCategory.id],
          price_category_name: [priceCategory.name],
          ranges: this.fb.array([]) 
        });

        this.prices.push(priceForm);

        price.prices.forEach((item)=>{
     const ranges = priceForm.get('ranges') as FormArray;
     
      
      ranges.push(this.fb.group({
        price: [item.price],
        range_to: [item.quantity_to],
        range_from: [item.quantity_from],
  
  
      }));
        })

// this.fb.array(
//             price.prices.map(price => this.createRangeGroup(price)) // Populate ranges
//         ),

        // const ranges = priceControl.get('ranges') as FormArray;




      }else{
        this.prices.push(this.fb.group({
          // price: [null],
          price_category_id: [priceCategory.id],
          price_category_name: [priceCategory.name],
          ranges: this.fb.array([]) 

        }));
      }
  
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
      const unitId = this.route.snapshot.paramMap.get('id'); 
      if (unitId) {
        this.fetchProduct(unitId);
      }
      this.loadUnits();
      // this.loadPriceCategories();
      this.loadProductCategories();
    }
  

    deleteImage(imageId:number){
      

      this._ProductsService.deleteProductImage(imageId).subscribe({
        next: (response) => {
          if (response) {
            this.productImages = this.productImages.filter(image => image.id !== imageId);
          }
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
    fetchProduct(unitId: string): void {
      this._ProductsService.viewProductById(unitId).subscribe({
        next: (response) => {
          if (response) {
            const categoryData = response.data ; 
            console.log(categoryData)
            this.productForm.patchValue({
              name_ar: categoryData.name_lang.ar,
              product_name_en: categoryData.name_lang.en,
              default_price :categoryData.default_price,
              product_category_id:categoryData.productCategory.id,
              unit_id: categoryData.product_unit.id,

              product_description:categoryData.description,
            
  
            });
            this.productImages = categoryData.images;
            this.productColors = categoryData.colors;
            this.currentProductImage = categoryData.cover_image;
            this.selectedUnit = categoryData.product_unit.id;
            this.selectedProductCategory = categoryData.productCategory.id;
            this.loadPriceCategories();
            this.productPrices = categoryData.prices;

          }
        },
        error: (err: HttpErrorResponse) => {
          this.msgError = err.error.error;
        }
      });
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
  

    updateColor(color:ProductColor){
      this.productColors = this.productColors.filter(myColor => myColor.id !== color.id);
      this.addColor(color);
    }

    deleteColor(colorId:number){
      

      this._ProductsService.deleteProductColor(colorId).subscribe({
        next: (response) => {
          if (response) {
            this.productColors = this.productColors.filter(color => color.id !== colorId);
          }
        },
        error: (err) => {
          console.error(err);
        }
      });
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
      // console.log(priceControl.get('price_category_id')?.value);

  
   }
  
    removeRange(index: number , rangeIndex: number) {
      const priceControl = this.prices.at(index) as FormGroup;
      const ranges = priceControl.get('ranges') as FormArray;
      
      if (ranges.length > 0) {
        ranges.removeAt(rangeIndex);
      }
   }
  
    loadPriceCategories(): void {
      this._PriceService.viewAllCategory().subscribe({
        next: (response) => {
          if (response) {
            this.priceCategories = response.data;
            console.log(this.priceCategories);
            console.log(this.productPrices);

            this.priceCategories.forEach((category)=>{
              let currentPrice =null;

              this.productPrices.forEach((price)=>{
                if(price.id == category.id){
                  currentPrice = price ;
                }
              
              });

              this.addPrice(category ,currentPrice );

            
            });
            
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
        formData.append('product_category_id', this.productForm.get('unit_id')?.value);
        formData.append('description', this.productForm.get('product_description')?.value || '');




        
        formData.append('default_price', this.productForm.get('default_price')?.value);
        if(this.productForm.get('image')?.value){
          formData.append('cover_image', this.productForm.get('image')?.value);

        }
  
        this.prices.controls.forEach((priceControl, index) => {
          const ranges = priceControl.get('ranges') as FormArray;


          

            // if(ranges.length>0){
  
              ranges.controls.forEach((rangeControl, index) => {
                if(!rangeControl.get('price')?.value){
                    alert('prices are invalid')
                    return;
                  
                }


                console.log('-----------------------------------------')

                console.log( rangeControl.get('price')?.value)
                console.log( rangeControl.get('range_from')?.value)
                console.log( rangeControl.get('range_to')?.value)
                console.log( priceControl.get('price_category_id')?.value)
                console.log('-----------------------------------------')

    
                // $table->integer('quantity_from');
                // $table->integer('quantity_to');
    
              formData.append(`prices[${index}][price]`, rangeControl.get('price')?.value);
              formData.append(`prices[${index}][quantity_from]`, rangeControl.get('range_from')?.value);
              formData.append(`prices[${index}][quantity_to]`, rangeControl.get('range_to')?.value);
              formData.append(`prices[${index}][price_category_id]`, priceControl.get('price_category_id')?.value);
              });
    
            

          
  
 
        });


        // this.prices.controls.forEach((priceControl, index) => {
        //   if(priceControl.get('price')?.value){

        //     if(priceControl.get('id')?.value){
        //       formData.append(`prices[${index}][id]`, priceControl.get('id')?.value);

        //     }
  
        //     formData.append(`prices[${index}][price]`, priceControl.get('price')?.value);
        //     formData.append(`prices[${index}][price_category_id]`, priceControl.get('price_category_id')?.value);
        //   }
        // });
  
        this.colors.controls.forEach((priceControl, index) => {
          if(priceControl.get('id')?.value){
            formData.append(`colors[${index}][id]`, priceControl.get('id')?.value);

          }
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
        const productId = this.route.snapshot.paramMap.get('id');
        if (productId) {
          this._ProductsService.updateProduct(productId ,formData).subscribe({
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
  }
  
  
  interface PriceCategory{
    id:number;
    name:string;
    prices:ProductPrice[];
  
  }

  interface ProductPrice{
    id:number;
    quantity_from:number;
    quantity_to:number;
    price:number;
    priceCategory:PriceCategory;
  }
  // quantity_from: [price.quantity_from], // Minimum quantity
  //         quantity_to: [price.quantity_to], 

  interface ProductImage{
    id:number;
    image:string;
  }

  interface ProductColor{
    id:number;
    image:string | null;
    color:string;
  }