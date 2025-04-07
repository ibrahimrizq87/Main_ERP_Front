import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PriceService } from '../../shared/services/price.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-update-price-category',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule ,TranslateModule],
  templateUrl: './update-price-category.component.html',
  styleUrl: './update-price-category.component.css'
})
export class UpdatePriceCategoryComponent implements OnInit {
  msgError: string = '';
  msgSuccess:string ='';
  isLoading: boolean = false;
  categoryForm:FormGroup
    constructor(
    private _PriceService: PriceService,
    private _Router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
   this.categoryForm= new FormGroup({
    name: new FormControl(null, [Validators.required,Validators.maxLength(255)]),

    });
  }
    ngOnInit(): void {
    const categoryId = this.route.snapshot.paramMap.get('id'); 
    if (categoryId) {
      this.fetchCategoryData(categoryId);
    }
    
  }
  fetchCategoryData(categoryId: string): void {
    this._PriceService.getCategoryById(categoryId).subscribe({
      next: (response) => {
        if (response) {
          const categoryData = response.data ; 
          console.log(categoryData)
          this.categoryForm.patchValue({
            name:categoryData.name,
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.msgError = err.error.error;
      }
    });
  }
  handleForm() {
   
    if (this.categoryForm.valid) {
    
      this.isLoading = true;

      const formData = new FormData();
      formData.append('name', this.categoryForm.get('name')?.value);
    
      const categoryId = this.route.snapshot.paramMap.get('id');
      
      if (categoryId) {
      this._PriceService.updateCategory(categoryId,formData).subscribe({
      
      next: (response) => {
          console.log(response);
          if (response) {
            this.toastr.success('تم تعديل الفئة بنجاح');
            this.isLoading = false;
            this._Router.navigate(['/dashboard/priceCategory']);
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
  onCancel(): void {
        this.categoryForm.reset();
       
        this._Router.navigate(['/dashboard/priceCategory']); 
      }  
}

