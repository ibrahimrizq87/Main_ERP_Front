import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ProductCategoriesService } from '../../shared/services/product_categories.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-product-category',
  standalone: true,
  imports: [CommonModule,FormsModule ,ReactiveFormsModule,TranslateModule ],
  templateUrl: './add-product-category.component.html',
  styleUrl: './add-product-category.component.css'
})
export class AddProductCategoryComponent {

  msgError: string = '';
  isLoading: boolean = false;

  constructor(private _ProductCategoriesService:ProductCategoriesService ,private _Router: Router,private translate: TranslateService,private toastr: ToastrService) {
    // this.translate.setDefaultLang('en'); 
  
  }
  categoryImage: string | ArrayBuffer | undefined| null = null;

  selectedFile: File | null = null;

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.categoryForm.patchValue({ image: file });
    }
   
      // Preview Image
      const reader = new FileReader();
      reader.onload = (e) => {
        this.categoryImage = e.target?.result;
      };
      reader.readAsDataURL(file);
  }
  categoryForm: FormGroup = new FormGroup({
    name: new FormControl(null, [Validators.required,Validators.maxLength(255)]),
    image: new FormControl(null),
  });

  handleForm() {
   
    if (this.categoryForm.valid) {
      this.isLoading = true;

      const formData = new FormData();
    
      formData.append('name', this.categoryForm.get('name')?.value);
      if( this.selectedFile){
        formData.append('image', this.categoryForm.get('image')?.value);
      }


      this._ProductCategoriesService.addProductCategory(formData).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.toastr.success('تم اضافه الفئه بنجاح');
            this.isLoading = false;
            this._Router.navigate(['/dashboard/productCategories']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error('حدث خطا اثناء اضافه الفئه');
          this.isLoading = false;
           this.msgError = err.error.error;
          console.log(err);
        }
      });
    }
  }
}
