import { Component } from '@angular/core';
import { PriceService } from '../../shared/services/price.service';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-price-category',
  standalone: true,
  imports: [CommonModule , RouterLinkActive ,RouterModule ,TranslateModule,FormsModule],
  templateUrl: './price-category.component.html',
  styleUrl: './price-category.component.css'
})
export class PriceCategoryComponent {
  priceCategories: any[] = []; 
  filteredCategories: any[] = []; 
  searchQuery: string = ''; 

  constructor(private _PriceService: PriceService, private router: Router,private toastr:ToastrService) {}

  ngOnInit(): void {
    this.loadPriceCategories(); 
  }

  loadPriceCategories(): void {
    this._PriceService.viewAllCategory().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.priceCategories = response.data; 
          this.filteredCategories = this.priceCategories; 
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  deleteCategory(cityId: number): void {
    if (confirm('Are you sure you want to delete this Category?')) {
      this._PriceService.deleteCategory(cityId).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف الفئة بنجاح');
            this.router.navigate(['/dashboard/priceCategory']);
            this.loadPriceCategories();
          }
        },
        error: (err) => {
          this.toastr.error('حدث خطا اثناء حذف الفئة');
          console.error(err);
          alert('An error occurred while deleting the Category.');
        }
      });
    }
  }
  onSearch(): void {
    this.filteredCategories = this.priceCategories.filter((category) =>
      category.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
}

