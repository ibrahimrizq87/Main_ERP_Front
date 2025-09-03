import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PurchasesService } from '../../shared/services/purchases.service';
import { TranslateModule } from '@ngx-translate/core';
import {  ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-category-price',
  standalone: true,
  imports: [CommonModule, FormsModule,TranslateModule],
  templateUrl: './category-price.component.html',
  styleUrl: './category-price.component.css'
})
export class CategoryPriceComponent implements OnInit {
  categories: any[] = [];
  items: any[] = [];
  billId: string | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  // Store price inputs for each item and category
  priceInputs: { [key: string]: { [key: string]: number } } = {};

  constructor(
    private route: ActivatedRoute,
    private _PurchasesService: PurchasesService,
    private toastr:ToastrService,
    private _Router: Router
    
  ) {}

  setPriceItem(price:number , item :any , category:any){
    this.priceInputs[item.id][category.id] = price;
  }

  ngOnInit(): void {
    this.getBillIdFromRoute();
  }

  private getBillIdFromRoute(): void {
    this.route.paramMap.subscribe(params => {
      this.billId = params.get('id');
      if (this.billId) {
        this.getBillItems(this.billId);
      }
    });
  }

  getBillItems(id: string): void {
    this.isLoading = true;
    this.error = null;

    this._PurchasesService.getBillItemsById(id).subscribe({
      next: (response: any) => {
        console.log('Bill items response:', response);
        if (response.status && response.data) {
          this.categories = response.data.categories || [];
          this.items = response.data.items || [];
          this.initializePriceInputs();
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load bill items';
        this.isLoading = false;
        console.error('Error fetching bill items:', err);
      }
    });
  }

  initializePriceInputs(): void {
    this.priceInputs = {};
    this.items.forEach(item => {
      this.priceInputs[item.id] = {};
      item.prices_with_categories.forEach((category : any) => {
        this.priceInputs[item.id][category.id] = category.price;
      });
    });
  }

  updatePrices(): void {
    this.isLoading = true;
    this.error = null;
    this.successMessage = null;
  
    const formData = new FormData();
    formData.append('purchase_bill_id', this.billId || '');
  
    // Add each item individually to FormData
    let itemIndex = 0;
    this.items.forEach(item => {
      item.prices_with_categories.forEach((category:any) => {
        const price = this.priceInputs[item.id][category.id];
        if (price > 0) {
          formData.append(`items[${itemIndex}][product_branch_id]`, item.id);
          formData.append(`items[${itemIndex}][price_category_id]`, category.id);
          formData.append(`items[${itemIndex}][price]`, price.toString());
          itemIndex++;
        }
      });
    });
  
    this._PurchasesService.UpdatePurchasePrices(formData).subscribe({
      next: (response: any) => {
        if (response.status) {
          console.log('Prices updated successfully:', response);
          this.successMessage = 'تم تحديث الأسعار بنجاح!';
          this.toastr.success(this.successMessage);
          this._Router.navigate(['/dashboard/purchases/waiting']);
          
        } else {
          this.error = response.message || 'Failed to update prices';
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to update prices';
        this.isLoading = false;
        console.error('Error updating prices:', err);
        
        if (err.error && err.error.errors) {
          this.error = err.error.errors.join(', ');
        }
      }
    });
  }
  trackByCategory(index: number, category: any): number {
    return category.id;
  }

  trackByItem(index: number, item: any): number {
    return item.id;
  }
}