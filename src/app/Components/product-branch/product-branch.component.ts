import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ProductBranchesService } from '../../shared/services/product_branches.service';
import { FormsModule ,FormGroup , ReactiveFormsModule,FormControl ,Validators} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Modal } from 'bootstrap';
import { ProductsService } from '../../shared/services/products.service';

@Component({
  selector: 'app-product-branch',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RouterLinkActive ,TranslateModule ,ReactiveFormsModule],
  templateUrl: './product-branch.component.html',
  styleUrl: './product-branch.component.css'
})
export class ProductBranchComponent implements OnInit {

  branches: any[] = []; 
  searchQuery: string = '';
  isLoading =false;
  isSubmitted =false;
  selectedProduct:any;
  filteredProducts:any;
  constructor(private _ProductBranchesService: ProductBranchesService,
     private router: Router,
    private _ProductsService:ProductsService) {}

  ngOnInit(): void {
    this.loadBranches(); 
  }

  loadBranches(): void {
    this._ProductBranchesService.viewAllProductBranches().subscribe({
      next: (response) => {
        if (response) {
          console.log(response)
          this.branches = response.data; 
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  
  onFileColorSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.productImportForm.patchValue({ file: file }); 
      console.log(file)
      this.productImportForm.get('file')?.updateValueAndValidity();
    }else{
      console.error('No file selected');
    }
    
  }


  closeModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
   this.productImportForm.patchValue({file:null});  
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }


  openModal(modalId:string){
    const modalElement = document.getElementById(modalId);
    if (modalId == 'productModel'){
      this.loadProducts();
    }
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }


selectProduct(product:any){
  this.selectedProduct = product;
  this.closeModal('productModel');
}

exportProductBranchByProduct(){
  if (!this.selectedProduct){
    alert('يجب اختيار منتج اولا');
  }else{

    // this._ProductBranchesService.exportProductBranches(this.selectedProduct.id).subscribe({
    //   next: (response) => {
    //     const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    //     const url = window.URL.createObjectURL(blob);
    //     const link = document.createElement('a');
    //     link.href = url;
    //     link.setAttribute('download', 'products.xlsx'); 
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);
    //   },
    //   error: (err) => {
    //     console.error("Error downloading file:", err);
    //     console.log("my error Error downloading file:", err);

    //   }
    // });
    this._ProductBranchesService.exportProductBranches(this.selectedProduct.id).subscribe({
      next: (response) => {
        console.log('hererererer');
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'products.xlsx'); 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      error: (err) => {
        console.error("Error downloading file:", err);
      }
    });
    

  }
}

ProductsearchQuery ='';
onProductSearchChange(){
}

         handleForm(){
  this.isSubmitted =true;
    if (this.productImportForm.valid) {
        this.isLoading = true;
  
        const formData = new FormData();
      
        // formData.append('file', this.productImportForm.get('file')?.value);
        const file = this.productImportForm.get('file')?.value;
  
        if (file instanceof File) { // Ensure it's a File object
          formData.append('file', file, file.name);
        } else {
          console.error('Invalid file detected:', file);
          return; // Prevent submission
        }
        this._ProductBranchesService.importProductBranchs(formData).subscribe({
          next: (response) => {
            console.log(response);
            if (response) {
              this.isLoading = false; 
              this.closeModal('ImportForm');       
            }
          },
          error: (err: HttpErrorResponse) => {
            this.isLoading = false;
             
          }
        });
      }
          }
  



    productImportForm: FormGroup = new FormGroup({
        file: new FormControl(null, [Validators.required]),
       
      });


  deleteBranch(branchId: number): void {
    console.log(branchId)
    if (confirm('Are you sure you want to delete this Branch?')) {
      this._ProductBranchesService.deleteProductBranch(branchId).subscribe({
        next: (response) => {
          if (response) {
            console.log(response)
            this.router.navigate(['/dashboard/productBranch']);
            this.loadBranches();
          }
        },
        error: (err) => {
          console.error(err);
          alert('An error occurred while deleting the Branch.');
        }
      });
    }
  }





  loadProducts(): void {
    this._ProductsService.viewAllProducts().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          // this.Products = response.data; 
          this.filteredProducts = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }


}


