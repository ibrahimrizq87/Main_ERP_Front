import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../shared/services/products.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { StoreService } from '../../shared/services/store.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ProductBranchesService } from '../../shared/services/product_branches.service';
import { DeterminantService } from '../../shared/services/determinants.service';
import { PriceService } from '../../shared/services/price.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-update-product-branch',
  standalone: true,
  imports: [CommonModule , ReactiveFormsModule, RouterModule ,TranslateModule],
  templateUrl: './update-product-branch.component.html',
  styleUrl: './update-product-branch.component.css'
})
export class UpdateProductBranchComponent implements OnInit {
currentProductBranch:any;

    selectedType: string = '';
    msgError: string = '';
    isLoading: boolean = false;
    MainDeterminants:Determinant [] = [];
    stores: any[] = [];
    productColors:ProductColor[] = [];
    products: Product[] = [];
    parentAccounts: any[] = [];
    hierarchicalAccounts: any[] = [];
    productDeterminants: any[] = [];
    branchForm: FormGroup;
    inputDisabled: boolean[] = []; 
    overrideCount: number = 0; 
    selectedColor :ProductColor|null = null;
    isSubmited =false;
    pricesAreValid=false;
  
    selectedStore :string|null=null;
    selectedProduct :string|null=null;
    priceCategories: PriceCategory[] = [];
  
    get determinants(): FormArray {
      return this.branchForm.get('determinants') as FormArray;
    }
  
  
    addDeterminant(determinant: any) {
      console.log('values', determinant.values);
    
      this.determinants.push(this.fb.group({
        determinant_name: [determinant?.name],
        determinant_id: [determinant?.id],
        value_id: [null, [Validators.required]], 
        values: [determinant.values],
      }));
    }
    
    constructor(
          private fb: FormBuilder,
          private _PriceService: PriceService,
              private route: ActivatedRoute,
      private _ProductsService: ProductsService,
      private _Router: Router,
      private _DeterminantService: DeterminantService,
      private _StoreService: StoreService,
      private _ProductBranchesService:ProductBranchesService,
      private toastr: ToastrService,
    ) {
      this.branchForm = new FormGroup({
        // store_id: new FormControl(null, [Validators.required]),
        // product_id: new FormControl(null, [Validators.required]),
        color_id: new FormControl(null),
        default_price: new FormControl(null, [Validators.required]),
        determinants: this.fb.array([]),
        prices: this.fb.array([]),
  
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
      price: [null, [Validators.required]],
      range_to: [null, [Validators.required]],
      range_from: [last_price],
  
  
    }));
  }
  
  
  
  getRanges(index: number): FormArray {
    return (this.prices.at(index).get('ranges') as FormArray);
  }
  
  
    get prices(): FormArray {
      return this.branchForm.get('prices') as FormArray;
    }
  
    removePrice(index: number) {
      if (this.prices.length > 1) {
        this.prices.removeAt(index);
      }
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
  

  
        }else{
          this.prices.push(this.fb.group({
            price_category_id: [priceCategory.id],
            price_category_name: [priceCategory.name],
            ranges: this.fb.array([]) 
  
          }));
        }
    
      }
    
  
    // loadPriceCategories(): void {
    //   this._PriceService.viewAllCategory().subscribe({
    //     next: (response) => {
    //       if (response) {
    //         this.priceCategories = response.data;
    //         this.priceCategories.forEach((category)=>{
    //           this.addPrice(category);
    //         })
            
    //       }
    //     },
    //     error: (err) => {
    //       console.error(err);
    //     }
    //   });
    // }
    productPrices:ProductPrice[]=[];

  
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
  
  
    onColorChange(event: Event) {
      const selectedValue = (event.target as HTMLSelectElement).value;
      this.selectedColor = this.productColors.find(color => color.id == selectedValue)||null ;
    }
    onStoreChange(event: Event) {
      const selectedValue = (event.target as HTMLSelectElement).value;
      this.selectedStore =selectedValue||null ;
    }
    ngOnInit(): void {

      const unitId = this.route.snapshot.paramMap.get('id'); 
      if (unitId) {
        this.fetchProductBranch(unitId);
      }


      this.loadStores();
      this.loadProducts();
      // this.loadPriceCategories();
  
      // this.loadDeterminants();
    }
  
    
  
    fetchProductBranch(id:string){
      this._ProductBranchesService.viewProductBranchById(id).subscribe({
        next: (response) => {
          if (response) {
            const categoryData = response.data;
            this.currentProductBranch =  categoryData;
            console.log(categoryData)
            this.branchForm.patchValue({
              // store_id: new FormControl(null, [Validators.required]),
              // product_id: new FormControl(null, [Validators.required]),
              color_id: categoryData.product_color?.id,
              default_price: categoryData.default_price,
  
            });
            this.selectedColor = categoryData.product_color;

         

            categoryData.determinantValues.forEach((element:any) => {
              console.log(element)
              this.determinants.push(this.fb.group({
                determinant_name: [element?.determinantValue.determinant.name],
                determinant_id: [element?.determinantValue.determinant.id],
                value_id: [element.determinantValue.id, [Validators.required]], 
                values: [element.determinantValue.determinant.values],
              }));
            });
            this.productPrices = categoryData.prices;

            this.productColors = categoryData.product.colors
            this.loadPriceCategories();
          }
        },
        error: (err: HttpErrorResponse) => {
          this.msgError = err.error.error;
        }
      });
    }
  
    loadProducts(): void {
      this._ProductsService.viewAllProducts().subscribe({
        next: (response) => {
          if (response) {
            console.log(response);
            this.products = response.data;
          }
        },
        error: (err) => {
          console.error(err);
        },
      });
    }
  
    loadStores(): void {
      this._StoreService.getAllStores().subscribe({
        next: (response) => {
          if (response) {
            console.log(response);
            this.stores = response.data;      
          }
        },
        error: (err) => {
          console.error(err);
        },
      });
    }
  
  
    
  
  onProductChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedType = selectedValue;
    this.loadDeterminants(selectedValue);
    const selectedProduct = this.products.find(product => product.id == selectedValue);
  this.selectedProduct =selectedValue;
    this.productColors = selectedProduct?.colors|| [];
  }
  
  loadDeterminants(productId:string): void {
    this._DeterminantService.getDeterminantsByProduct(productId).subscribe({
      next: (response) => {
        if (response) {
          this.MainDeterminants = response.data;
          this.determinants.clear();
          console.log(this.MainDeterminants );
          this.MainDeterminants.forEach((item)=>{

            this.addDeterminant(item);
          })
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  
    handleForm() {
  
      //   if(!this.pricesAreValid){
      //   alert('الرجاء ادخال كل الاسعار المطلوبه')
      //   return;
      // }
  
  
      this.isSubmited =true;
      if (this.branchForm.valid ) {
  
        if(this.selectedColor == null &&this.productColors.length>0){
          return;
        }
        this.isLoading = true;
  
    
        const formData = new FormData();
        // formData.append('store_id', this.branchForm.get('store_id')?.value);
        // formData.append('product_id', this.branchForm.get('product_id')?.value);
        if(this.selectedColor){
          formData.append('product_color_id', this.branchForm.get('color_id')?.value);
        }


        this.determinants.controls.forEach((item,index)=>{
          formData.append(`determinant_values[${index}][determinant_value_id]`, item.get('value_id')?.value);
        });
        
        formData.append('default_price', this.branchForm.get('default_price')?.value);
  
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
      
  
       
        const productId = this.route.snapshot.paramMap.get('id');
        if (productId) {
        this._ProductBranchesService.updateProductBranch(productId,formData).subscribe({
          next: (response) => {
            console.log(response);
            if (response) {
              this.toastr.success('تم تعديل المنتج بنجاح');
              this.isLoading = false;
              this._Router.navigate(['/dashboard/productBranch']);
            }
          },
          error: (err: HttpErrorResponse) => {
            this.toastr.error('حدث خطا اثناء تعديل المنتج');
            this.isLoading = false;
            this.msgError = err.error.error;
            console.log(err.error.error);
          },
        });
      
      }}}}
  
      interface Product{
        id:string;
        name:string;
        colors:ProductColor[];
      }
      interface ProductColor{
        id:string;
        image:string | null;
        color:Color;
      }
  
  
      interface Color{
        id:string;
        color:string;
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
      
      
      
      interface ProductPrice{
        id:number;
        quantity_from:number;
        quantity_to:number;
        price:number;
        priceCategory:PriceCategory;
      }


      interface PriceCategory{
        id:number;
        name:string;
        prices:ProductPrice[];
      
      }