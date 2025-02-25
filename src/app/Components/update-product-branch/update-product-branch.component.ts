import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../shared/services/products.service';
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { StoreService } from '../../shared/services/store.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ProductBranchesService } from '../../shared/services/product_branches.service';


@Component({
  selector: 'app-update-product-branch',
  standalone: true,
  imports: [CommonModule , ReactiveFormsModule, RouterModule , RouterLinkActive,TranslateModule],
  templateUrl: './update-product-branch.component.html',
  styleUrl: './update-product-branch.component.css'
})
export class UpdateProductBranchComponent implements OnInit {

    selectedType: string = '';
    msgError: string = '';
    isLoading: boolean = false;
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
  selectedStore :string|null=null;
  selectedProduct :string|null=null;
  
    constructor(
      private _ProductsService: ProductsService,
      private _Router: Router,
      private translate: TranslateService,
      private _StoreService: StoreService,
          private route: ActivatedRoute
      ,
      private _ProductBranchesService:ProductBranchesService
    ) {
      this.branchForm = new FormGroup({
        store_id: new FormControl(null, [Validators.required]),
        product_id: new FormControl(null, [Validators.required]),
        color_id: new FormControl(null),
  
        
      });
    }
    onColorChange(event: Event) {
      const selectedValue = (event.target as HTMLSelectElement).value;
      this.selectedColor = this.productColors.find(color => color.id == selectedValue)||null ;
  
      console.log( this.selectedColor )
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
  
    }
  
    
  
    fetchProductBranch(unitId: string): void {
      this._ProductBranchesService.viewProductBranchById(unitId).subscribe({
        next: (response) => {
          if (response) {
            const categoryData = response.data ; 
            console.log(categoryData)
            this.branchForm.patchValue({
              name: categoryData.name,
              product_id: categoryData.product.id,
              store_id: categoryData.store.id,
              color_id: categoryData.product_color?.id||null,
  
            });

            this.selectedColor = categoryData.product_color ||null;
            this.selectedProduct = categoryData.product;
            this.selectedStore =  categoryData.store;
            this.productColors = categoryData.product.colors;
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
    const selectedProduct = this.products.find(product => product.id == selectedValue);
  this.selectedProduct =selectedValue;
    this.productColors = selectedProduct?.colors|| [];
  }
  
  
  
    handleForm() {
      this.isSubmited =true;
      if (this.branchForm.valid ) {
  
        if(this.selectedColor == null &&this.productColors.length>0){
          return;
        }
        this.isLoading = true;
  
    
        const formData = new FormData();
        formData.append('store_id', this.branchForm.get('store_id')?.value);
        formData.append('product_id', this.branchForm.get('product_id')?.value);
        if(this.selectedColor){
          formData.append('product_color_id', this.branchForm.get('color_id')?.value);
        }
  
      
  
       
        const productId = this.route.snapshot.paramMap.get('id');
        if (productId) {
        this._ProductBranchesService.updateProductBranch(productId,formData).subscribe({
          next: (response) => {
            console.log(response);
            if (response) {
              this.isLoading = false;
              this._Router.navigate(['/dashboard/productBranch']);
            }
          },
          error: (err: HttpErrorResponse) => {
            this.isLoading = false;
            this.msgError = err.error.error;
            console.log(err.error.error);
          },
        });
        }
      }}}
  
      interface Product{
        id:string;
        name:string;
        colors:ProductColor[];
      }
      interface ProductColor{
        id:string;
        image:string | null;
        color:string;
      }