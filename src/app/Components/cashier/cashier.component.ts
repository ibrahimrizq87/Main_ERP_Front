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
  invoiceItems: any[] = []; // Array to hold selected products
  totalAmount: number = 0; // Total amount for all items

  // Checkout form data
  checkoutData = {
    customer_name: '',
    customer_phone: '',
    note: '',
    type: 'purchase' // default value
  };

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

  // Add product to invoice items
  addToInvoice(product: any) {
    let productToAdd: any;
    let price: number;

    // Check if product is from recentProductsList
    if (product.product_branch) {
      productToAdd = product.product_branch;
      price = parseFloat(productToAdd.price);
    } 
    // Check if product is from recentProducts (search results)
    else if (product.product) {
      productToAdd = product.product;
      // Use branch.default_price if available, otherwise use product.price
      price = product.branch?.default_price ? parseFloat(product.branch.default_price) : parseFloat(productToAdd.price);
    } 
    // If it's neither (shouldn't happen), use the product directly
    else {
      productToAdd = product;
      price = parseFloat(product.price || '0');
    }

    // Check if product already exists in invoice
    const existingItem = this.invoiceItems.find(item => item.id === productToAdd.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.total = existingItem.quantity * existingItem.price;
    } else {
      this.invoiceItems.push({
        ...productToAdd,
        product_branch_id: productToAdd.id,
        price: price,
        quantity: 1,
        total: price,
        serial_numbers: [] // Initialize empty array for serial numbers
      });
    }
    
    this.calculateTotal();
  }

  // Remove product from invoice items
  removeFromInvoice(index: number) {
    this.invoiceItems.splice(index, 1);
    this.calculateTotal();
  }

  // Update quantity of an item
  updateQuantity(item: any, change: number) {
    item.quantity += change;
    if (item.quantity < 1) item.quantity = 1;
    item.total = item.quantity * item.price;
    this.calculateTotal();
  }

  // Calculate total amount
  calculateTotal() {
    this.totalAmount = this.invoiceItems.reduce((sum, item) => sum + (item.total || 0), 0);
  }

  // Open checkout modal
  openCheckoutModal() {
    if (this.invoiceItems.length === 0) {
      alert('Please add items to the invoice');
      return;
    }

    const modalElement = document.getElementById('checkoutModal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }

  // Close checkout modal
  closeCheckoutModal() {
    const modalElement = document.getElementById('checkoutModal');
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }

  // Save checkout data and submit to API
  saveCheckout() {
    // Prepare the data according to the API requirements
    const invoiceData = {
      customer_name: this.checkoutData.customer_name || null,
      customer_phone: this.checkoutData.customer_phone || null,
      note: this.checkoutData.note || null,
      total: this.totalAmount,
      type: this.checkoutData.type,
      items: this.invoiceItems.map(item => ({
        product_branch_id: item.product_branch_id,
        price: item.price,
        quantity: item.quantity,
        serial_numbers: item.serial_numbers || []
      }))
    };

    console.log('Submitting invoice data:', invoiceData);

    this._CashierService.addBillCasier(invoiceData).subscribe({
      next: (response) => {
        console.log('Invoice saved successfully:', response);
        alert('Invoice saved successfully!');
        
        // Reset form data
        this.resetCheckoutForm();
        this.closeCheckoutModal();
      },
      error: (error) => {
        console.error('Error saving invoice:', error);
        alert('Error saving invoice. Please try again.');
      }
    });
  }

  // Reset checkout form and invoice items
  resetCheckoutForm() {
    this.checkoutData = {
      customer_name: '',
      customer_phone: '',
      note: '',
      type: 'purchase'
    };
    this.invoiceItems = [];
    this.totalAmount = 0;
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