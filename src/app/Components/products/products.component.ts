import { Component, importProvidersFrom, OnInit } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { ProductsService } from '../../shared/services/products.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule ,FormGroup , ReactiveFormsModule,FormControl ,Validators} from '@angular/forms';
import { Modal } from 'bootstrap';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { PermissionService } from '../../shared/services/permission.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterLinkActive, RouterModule,CommonModule,TranslateModule,FormsModule,ReactiveFormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {

  Products: any[] = []; 
  filteredProducts: any[] = [];  
  searchTerm: string = ''; 
  
  // productImportForm: FormGroup;
  
  isLoading =false;
  isSubmitted=false;
  productImportForm: FormGroup = new FormGroup({
      file: new FormControl(null, [Validators.required]),
      template: new FormControl('1', [Validators.required]),
      file_name:new FormControl(null),

     
    });
  constructor(private _ProductsService: ProductsService, private router: Router,
    private toastr:ToastrService , public _PermissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.loadProducts(); 
  }

  exportProductExcel(){

const name = this.productImportForm.get('file_name')?.value || 'products template';
    const template =this.productImportForm.get('template')?.value;
    this._ProductsService.exportProductsTemplates(template).subscribe({
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
      


        handleForm(){
      this.isSubmitted =true;
        if (this.productImportForm.valid) {
            this.isLoading = true;

      const formData = new FormData();
    
      formData.append('template', this.productImportForm.get('template')?.value);
      const file = this.productImportForm.get('file')?.value;

      if (file instanceof File) { 
        formData.append('file', file, file.name);
      } else {
        console.error('Invalid file detected:', file);
        return; 
      }
      this._ProductsService.importProductsTemplates(formData).subscribe({
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

  exportProducts() {
    this._ProductsService.exportProducts().subscribe({
      next: (response) => {
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

  
  
  loadProducts(): void {
    this._ProductsService.viewAllProducts().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.Products = response.data; 
          this.filteredProducts = this.Products;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  deleteProduct(productId: number): void {
    if (confirm('Are you sure you want to delete this Product?')) {
      this._ProductsService.deleteProduct(productId).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف المنتج بنجاح');
            this.router.navigate(['/dashboard/products']);
            this.loadProducts();
          }
        },
        error: (err) => {
          this.toastr.error('حدث خطا اثناء حذف المنتج');
          console.error(err);
          // alert('An error occurred while deleting the Product.');
        }
      });
    }
  }



  openModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }




  searchProducts(): void {
    this.filteredProducts = this.Products.filter(product => 
      product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
      product.unit?.unit.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      product.product_dimension.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}


