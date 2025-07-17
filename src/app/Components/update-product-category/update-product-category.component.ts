import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ProductCategoriesService } from '../../shared/services/product_categories.service';
import { ToastrService } from 'ngx-toastr';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-update-product-category',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './update-product-category.component.html',
  styleUrl: './update-product-category.component.css'
})
export class UpdateProductCategoryComponent {

  selectedCategory:any;
  msgError: string = '';
  isLoading: boolean = false;
  isSubmitted = false;
  constructor(private _ProductCategoriesService: ProductCategoriesService, private _Router: Router, private translate: TranslateService,
    private route: ActivatedRoute,
    private toastr: ToastrService

  ) {

  }
  categoryImage: string | ArrayBuffer | undefined | null = null;

  selectedFile: File | null = null;
  ngOnInit(): void {
    const unitId = this.route.snapshot.paramMap.get('id');
    if (unitId) {
      this.fetchProductCategory(unitId);
    }
    this.loadParents();

  }

  fetchProductCategory(unitId: string): void {
    this._ProductCategoriesService.getAllProductCategoryById(unitId).subscribe({
      next: (response) => {
        if (response) {
          const categoryData = response.data;
          console.log(categoryData)
          this.categoryForm.patchValue({
            name: categoryData.name,
          });

          this.selectedCategory =categoryData.parent || null;
          while (this.commissions.length) {
            this.commissions.removeAt(0);
          }
          
          // Add commissions from the response
          if (categoryData.commissions && categoryData.commissions.length > 0) {
            categoryData.commissions.forEach((commission: { from: any; to: any; precentage: any; }) => {
              this.commissions.push(new FormGroup({
                from: new FormControl(commission.from, [Validators.required, Validators.min(0)]),
                to: new FormControl(commission.to, [Validators.required, Validators.min(0)]),
                precentage: new FormControl(commission.precentage, [Validators.required, Validators.min(0), Validators.max(100)]),
              }));
            });
          }
          
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
    commissions: new FormArray([]),
  });
  get commissions(): FormArray {
    return this.categoryForm.get('commissions') as FormArray;
  }
  addCommissions(): void {
    this.commissions.push(new FormGroup({
      from: new FormControl('', [Validators.required, Validators.min(0)]),
      to: new FormControl('', [Validators.required, Validators.min(0)]),
      precentage: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
    }));
  }
  removeCommissions(index: number): void {
    this.commissions.removeAt(index);
  }
  handleForm() {
   
    if (this.categoryForm.valid) {
      this.isSubmitted = true;
      this.isLoading = true;

      const formData = new FormData();
    
      formData.append('name', this.categoryForm.get('name')?.value);
      if( this.selectedFile){
        formData.append('image', this.categoryForm.get('image')?.value);
      }


      if(this.selectedCategory){
        formData.append('parent_id', this.selectedCategory.id);    
      }

      this.commissions.controls.forEach((element, index) => {
       
        formData.append(`commissions[${index}][from]`, element.get('from')?.value);
        formData.append(`commissions[${index}][to]`, element.get('to')?.value);
        formData.append(`commissions[${index}][precentage]`, element.get('precentage')?.value);

      });
      const unitId = this.route.snapshot.paramMap.get('id');

      if (unitId) {
        this._ProductCategoriesService.updateProductCategory(unitId, formData).subscribe({
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
  }}
  onCancel() {
    this.categoryForm.reset();
    this._Router.navigate(['/dashboard/productCategories']);
  }




      openModal(modalId: string) {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
          const modal = new Modal(modalElement);
          modal.show();
        }
      }
    closeModal(modalId: string) {
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        const modal = Modal.getInstance(modalElement);
        modal?.hide();
      }
    }
  
  searchQuery = '';
  parents:any;
      loadParents(): void {
      // searchQuery: string = '',
      // type: string = '',
      // parent_id: string = '',
      this._ProductCategoriesService.getAllProductCategories(
        this.searchQuery,
        'parent' 
  
      ).subscribe({
        next: (response) => {
          if (response) {
            this.parents = response.data; 
            // this.filteredCategories = [...this.categories];
          }
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
  
  selectCategory(parent:any){
    this.selectedCategory = parent;
    this.closeModal('categoryModal'); 
  
  }


}
