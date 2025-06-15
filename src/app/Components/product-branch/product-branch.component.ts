import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ProductBranchesService } from '../../shared/services/product_branches.service';
import { FormsModule ,FormGroup , ReactiveFormsModule,FormControl ,Validators} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Modal } from 'bootstrap';
import { ProductsService } from '../../shared/services/products.service';
import { ToastrService } from 'ngx-toastr';
import { PermissionService } from '../../shared/services/permission.service';

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
  Products: any;
  productImportForm: FormGroup = new FormGroup({
    file: new FormControl(null, [Validators.required]),
    template: new FormControl('1', [Validators.required]),
    file_name:new FormControl(null),
    product_id:new FormControl(null),
  });
  constructor(private _ProductBranchesService: ProductBranchesService,
    private router: Router,
    private _ProductsService:ProductsService,
    private toastr:ToastrService,
    public _PermissionService: PermissionService
) {}


  selectedTemplate: string = '';
  ngOnInit(): void {
    this.loadBranches(); 
    this.loadProducts();
    this.productImportForm.get('template')?.valueChanges.subscribe((value) => {
      this.selectedTemplate = value;
    });
    this.productImportForm.get('product_id')?.valueChanges.subscribe((productId) => {
      this.selectedProduct = this.Products.find((p: { id: number; }) => p.id === +productId);
    });
    
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

  handleExport(){

    const name = this.productImportForm.get('file_name')?.value || 'products template';
        const template =this.productImportForm.get('template')?.value;

        // if(template == '5'){
        //   const product_id =this.productImportForm.get('product_id')?.value;

        //   if(!product_id){
        //     this.toastr.error('يجب اختيار منتج اولا');
        //     return;
        //   }


        //   this._ProductBranchesService.exportProductBranches(product_id).subscribe({
        //     next: (response) => {
        //       const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        //       const url = window.URL.createObjectURL(blob);
        //       const link = document.createElement('a');
        //       link.href = url;
        //       link.setAttribute('download', name+'.xlsx'); 
        //       document.body.appendChild(link);
        //       link.click();
        //       document.body.removeChild(link);
        //     },
        //     error: (err) => {
        //       console.error("Error downloading file:", err);
        //     }
        //   });
        // }else{

          const product_id =this.productImportForm.get('product_id')?.value;

          if(template == '3' || template == '5'){
            if(!product_id){
              this.toastr.error('يجب اختيار منتج اولا');
              return;
            }
          }

          this._ProductBranchesService.exportProductBranchesTemplates(template,product_id ).subscribe({
            next: (response) => {
              const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', name+'.xlsx'); 
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            },
            error: (err) => {
              console.error("Error downloading file:", err);
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

ProductsearchQuery ='';
onProductSearchChange(){
}


handleForm(){
  this.isSubmitted =true;
    if (this.productImportForm.valid) {
        this.isLoading = true;
  
        const formData = new FormData();
          const file = this.productImportForm.get('file')?.value;
          formData.append('template', this.productImportForm.get('template')?.value);

        if (file instanceof File) { 
          formData.append('file', file, file.name);
        } else {
          console.error('Invalid file detected:', file);
          return; 
        }
        this._ProductBranchesService.importProductBranchesTemplates(formData).subscribe({
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

  //        handleForm(){
  // this.isSubmitted =true;
  //   if (this.productImportForm.valid) {
  //       this.isLoading = true;
  
  //       const formData = new FormData();
      
  //       // formData.append('file', this.productImportForm.get('file')?.value);
  //       const file = this.productImportForm.get('file')?.value;
  
  //       if (file instanceof File) { // Ensure it's a File object
  //         formData.append('file', file, file.name);
  //       } else {
  //         console.error('Invalid file detected:', file);
  //         return; // Prevent submission
  //       }
  //       this._ProductBranchesService.importProductBranchs(formData).subscribe({
  //         next: (response) => {
  //           console.log(response);
  //           if (response) {
  //             this.isLoading = false; 
  //             this.closeModal('ImportForm');       
  //           }
  //         },
  //         error: (err: HttpErrorResponse) => {
  //           this.isLoading = false;
             
  //         }
  //       });
  //     }
  //         }
  



    // productImportForm: FormGroup = new FormGroup({
    //     file: new FormControl(null, [Validators.required]),
       
    //   });


  deleteBranch(branchId: number): void {
    console.log(branchId)
    if (confirm('Are you sure you want to delete this Branch?')) {
      this._ProductBranchesService.deleteProductBranch(branchId).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف الفرع بنجاح');
            console.log(response)
            this.router.navigate(['/dashboard/productBranch']);
            this.loadBranches();
          }
        },
        error: (err) => {
          this.toastr.error('حدث خطا اثناء حذف الفرع');
          console.error(err);
          // alert('An error occurred while deleting the Branch.');
        }
      });
    }
  }





  loadProducts(): void {
    this._ProductsService.viewAllProducts().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.Products = response.data; 
          // this.filteredProducts = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }


}


