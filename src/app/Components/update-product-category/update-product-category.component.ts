import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ProductCategoriesService } from '../../shared/services/product_categories.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-update-product-category',
  standalone: true,
  imports: [CommonModule,FormsModule ,ReactiveFormsModule,TranslateModule ],
  templateUrl: './update-product-category.component.html',
  styleUrl: './update-product-category.component.css'
})
export class UpdateProductCategoryComponent {


  msgError: string = '';
  isLoading: boolean = false;

  constructor(private _ProductCategoriesService:ProductCategoriesService ,private _Router: Router,private translate: TranslateService,
        private route: ActivatedRoute,
        private toastr: ToastrService
    
  ) {
  
  }
  categoryImage: string | ArrayBuffer | undefined| null = null;

  selectedFile: File | null = null;
  ngOnInit(): void {
    const unitId = this.route.snapshot.paramMap.get('id'); 
    if (unitId) {
      this.fetchProductCategory(unitId);
    }
  }

  fetchProductCategory(unitId: string): void {
    this._ProductCategoriesService.getAllProductCategoryById(unitId).subscribe({
      next: (response) => {
        if (response) {
          const categoryData = response.data ; 
          console.log(categoryData)
          this.categoryForm.patchValue({
            name: categoryData.name,
            // image: UnitsData.name,

          });
        this.categoryImage = categoryData.image;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.msgError = err.error.error;
      }
    });
  }
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

      const unitId = this.route.snapshot.paramMap.get('id');

      if(unitId){
        this._ProductCategoriesService.updateProductCategory(unitId , formData).subscribe({
          next: (response) => {
            console.log(response);
            if (response) {
              this.toastr.success('تم تعديل الفئة بنجاح');
              this.isLoading = false;
              this._Router.navigate(['/dashboard/productCategories']);
            }
          },
          error: (err: HttpErrorResponse) => {
            this.toastr.error('حدث خطا اثناء تعديل الفئة');
            this.isLoading = false;
             this.msgError = err.error.error;
            console.log(err);
          }
        }); 
      }



    }
  }
}
