import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProductCategoriesService } from '../../shared/services/product_categories.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-category',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormsModule,RouterLinkActive,RouterModule ,TranslateModule],
  templateUrl: './product-category.component.html',
  styleUrl: './product-category.component.css'
})
export class ProductCategoryComponent {

  categories: any[] = []; 
  filteredCategories: any[] = [];
  searchTerm: string = '';

  constructor(private _ProductCategoriesService: ProductCategoriesService, private router: Router
    ,private toastr:ToastrService
  ) {}

  ngOnInit(): void {
    this.loadUnits(); 
  }

  loadUnits(): void {
    this._ProductCategoriesService.getAllProductCategories().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.categories = response.data; 
          this.filteredCategories = [...this.categories];
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  deleteCategory(unitId: number): void {
    if (confirm('Are you sure you want to delete this Unit?')) {
      this._ProductCategoriesService.deleteProductCategory(unitId).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف الوحدة بنجاح');
            this.router.navigate(['/dashboard/productUnit']);
            this.loadUnits();
          }
        },
        error: (err) => {
          this.toastr.error('حدث خطا اثناء حذف الوحدة');
          console.error(err);
          alert('An error occurred while deleting the Unit.');
        }
      });
    }
  }
  searchCategories(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredCategories = [...this.categories];
    } else {
      this.filteredCategories = this.categories.filter(unit =>
        unit.unit.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }
}

