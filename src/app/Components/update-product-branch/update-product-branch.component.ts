import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductsService } from '../../shared/services/products.service';
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { StoreService } from '../../shared/services/store.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-update-product-branch',
  standalone: true,
  imports: [CommonModule , ReactiveFormsModule, RouterModule , RouterLinkActive,TranslateModule],
  templateUrl: './update-product-branch.component.html',
  styleUrl: './update-product-branch.component.css'
})
export class UpdateProductBranchComponent implements OnInit {
  msgError: string = '';
  msgSuccess:string ='';
  isLoading: boolean = false;
  stores: any[] = []; 
  products: any[] = []; 
  parentAccounts: any[] = []; 
  hierarchicalAccounts: any[] = [];
  branchForm: FormGroup ;
    constructor(
    private _ProductsService: ProductsService,
    private router: Router,
    private route: ActivatedRoute,
    private _StoreService:StoreService
  ) {
   this.branchForm = new FormGroup({
      amount: new FormControl(null, [Validators.required]),
      price: new FormControl(null, [Validators.required]),
      store_id: new FormControl(null, [Validators.required]),
      product_id: new FormControl(null, [Validators.required]),
    });
  }
    ngOnInit(): void {
    const branchId = this.route.snapshot.paramMap.get('id'); 
    if (branchId) {
      this.fetchProductBranches(branchId);
    }
    this.loadStores();
    this.loadProducts();
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
      }
    });
  }
  loadStores(): void {
    this._StoreService.getAllStores().subscribe({
      next: (response) => {
        if (response) {
          console.log(response)
         
          this.parentAccounts = response.data;
         
          this.hierarchicalAccounts = this.buildAccountHierarchy(this.parentAccounts);
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  buildAccountHierarchy(accounts: any[]): any[] {
    return accounts.map(account => ({
      ...account,
      children: account.child ? this.buildAccountHierarchy(account.child) : []
    }));
  }
  fetchProductBranches(branchId: string): void {
    this._ProductsService.getBranchById(branchId).subscribe({
      next: (response) => {
        if (response) {
          const branchesData = response.data ; 
          console.log(branchesData)
          this.branchForm.patchValue({
            amount: branchesData.amount,
            price: branchesData.price,
            store_id: branchesData.store_id,
            product_id: branchesData.product_id,
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.msgError = err.error.error;
      }
    });
  }
  handleForm() {
   
    if (this.branchForm.valid) {
      this.isLoading = true;

      const formData = new FormData();
    
      formData.append('amount', this.branchForm.get('amount')?.value);
      formData.append('price', this.branchForm.get('price')?.value);
      formData.append('store_id', this.branchForm.get('store_id')?.value);
      formData.append('product_id', this.branchForm.get('product_id')?.value);
   
      const branchId = this.route.snapshot.paramMap.get('id');
      if (branchId) {
      this._ProductsService.updateBranch(branchId,formData).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.isLoading = false;
            this.router.navigate(['/dashboard/productBranch']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
           this.msgError = err.error.error;
          console.log(err.error.error);
        }
      });
    }
    }
  }
  onCancel(): void {
        this.branchForm.reset();
       
        this.router.navigate(['/dashboard/productBranch']); 
      }  
}


