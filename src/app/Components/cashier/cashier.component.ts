// src/app/Components/cashier/cashier.component.ts
import { Component, OnInit } from '@angular/core';
import { CashierService } from '../../shared/services/cashier.service';
import { Modal } from 'bootstrap';
import { Subject, debounceTime } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cashier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cashier.component.html',
  styleUrl: './cashier.component.css'
})
export class CashierComponent implements OnInit {
  recentProducts: any[] = [];
  recentProductsList: any[] = []; 
  private searchSubject = new Subject<string>();
  searchQuery: string = '';
  selectedProduct: any = null;
  positionInput: string = '';
  showPositionInput: boolean = false;

  constructor(private _CashierService: CashierService) {
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(query => {
      this.searchProducts(query);
    });
  }

  ngOnInit(): void {
    this.addCashierToMyself();
    this.loadRecentProducts();
    this.searchProducts(''); // Load initial products
  }
  loadRecentProducts() {
    this._CashierService.getAllRecent().subscribe({
      next: (response) => {
        console.log('Recent Products:', response);
        this.recentProductsList = response.data || [];
      },
      error: (err) => {
        console.error('Error loading recent products:', err);
      }
    });
  }
  // Add this method to the CashierComponent class
deleteRecentProduct(productId: string) {
  if (confirm('Are you sure you want to delete this product from recent?')) {
    this._CashierService.deleteRecentProducts(productId).subscribe({
      next: (response) => {
        console.log('Product deleted from recent:', response);
        this.loadRecentProducts(); // Refresh the list
      },
      error: (err) => {
        console.error('Error deleting from recent:', err);
      }
    });
  }
}
  addCashierToMyself() {
    this._CashierService.addCashierToMyself().subscribe({
      next: (response) => {
        if (response && response.data) {
          console.log(response.data);
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  onSearchChange() {
    this.searchSubject.next(this.searchQuery);
  }

  searchProducts(searchTerm: string) {
    this._CashierService.getMyStoreProducts(searchTerm).subscribe({
      next: (response) => {
        console.log(response);
        this.recentProducts = response.data.products || [];
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  selectProduct(product: any) {
    this.selectedProduct = product;
    this.showPositionInput = true;
  }

  addToRecentProducts() {
    if (!this.positionInput) {
      alert('Please enter a position');
      return;
    }

    const formData = new FormData();
    formData.append('product_branch_id', this.selectedProduct.product.id);
    formData.append('position', this.positionInput);

    this._CashierService.addRecentProducts(formData).subscribe({
      next: (response) => {
        console.log('Product added to recent:', response);
        this.showPositionInput = false;
        this.positionInput = '';
        this.selectedProduct = null;
        this.loadRecentProducts();
        // Optionally refresh the recent products list
      },
      error: (err) => {
        console.error('Error adding to recent:', err);
      }
    });
  }

  openRecentModal() {
    const modalElement = document.getElementById('recentProductsModal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
      this.searchProducts('');
    }
  }

  closeRecentModal() {
    const modalElement = document.getElementById('recentProductsModal');
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
      this.searchQuery = '';
      this.recentProducts = [];
      this.showPositionInput = false;
      this.positionInput = '';
      this.selectedProduct = null;
    }
  }
}