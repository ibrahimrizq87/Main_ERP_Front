// src/app/Components/cashier/cashier.component.ts
import { Component, OnInit } from '@angular/core';
import { CashierService } from '../../shared/services/cashier.service';
import { Modal } from 'bootstrap';
import { Subject, debounceTime } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import {  Router, RouterModule } from '@angular/router';
import { StoreService } from '../../shared/services/store.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cashier',
  standalone: true,
  imports: [CommonModule, FormsModule ,RouterModule,NgxPaginationModule,TranslateModule],
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
  stores: any[] = [];
  filteredStores: any[] = [];
  currentStore: any = null;
  storeSearchQuery: string = '';
  storeCurrentPage: number = 1;
  storeItemsPerPage: number = 5;
  storeTotalItems: number = 0;
  storeLastPage: number = 1;
  private storeSearchSubject = new Subject<string>();

  // Checkout form data
  checkoutData = {
    customer_name: '',
    customer_phone: '',
    note: '',
    type: 'purchase' // default value
  };

  constructor(private _CashierService: CashierService,private toastr: ToastrService,private router: Router,private _StoreService: StoreService) {
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(query => {
      this.searchProducts(query);
    });
      // Add this for store search
      this.storeSearchSubject.pipe(debounceTime(300)).subscribe(() => {
        this.loadStores();
      });
  }

  ngOnInit(): void {
    this.addCashierToMyself();
    this.loadRecentProducts();
    this.searchProducts(''); // Load initial products
    this.loadStores();
    this._CashierService.getMyInfo().subscribe({
      next: (response) => {
        if (response && response.data) {
          console.log('My info:', response.data);
          this.currentStore = response.data.cashierData.store;

          // If currentStore is not set, load the first store from the list
          if (!this.currentStore && this.stores.length > 0) {
            this.currentStore = this.stores[0];
          }
        }
      },
      error: (err) => {
        console.error('Error loading my info:', err);
      }
    });
  }

// Updated loadStores method with pagination
loadStores(): void {
  this._StoreService.getAllStores(
    'all',
    this.storeSearchQuery,
    this.storeCurrentPage,
    this.storeItemsPerPage
  ).subscribe({
    next: (response) => {
      if (response) {
        this.stores = response.data;
        this.filteredStores = [...this.stores];
        this.storeTotalItems = response.meta.total;
        this.storeLastPage = response.meta.last_page;
        console.log('Stores loaded:', this.currentStore);
        // Set current store if not already set
        // if (!this.currentStore && this.stores.length > 0) {
        //   this.currentStore = this.stores[0];
        // }
      }
    },
    error: (err) => {
      console.error('Error loading stores:', err);
    }
  });
}

onStoreSearchChange(): void {
  this.storeSearchSubject.next(this.storeSearchQuery);
}

onStorePageChange(page: number): void {
  this.storeCurrentPage = page;
  this.loadStores();
}

onStoreItemsPerPageChange(): void {
  this.storeCurrentPage = 1;
  this.loadStores();
}
onPageChange(page: number): void {
  this.storeCurrentPage = page;
  this.loadStores();
}


  // Add this new method to open settings modal
  openSettingsModal() {
    const modalElement = document.getElementById('settingsModal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }

  // Add this new method to close settings modal
  closeSettingsModal() {
    const modalElement = document.getElementById('settingsModal');
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }

  changeStore(store: any) {
   
    this._CashierService.updateMyDefaultStore(store.id).subscribe({
      next: (response) => {
        this.currentStore = store;
        console.log('Current store updated successfully:', this.currentStore);
        console.log('Default store updated successfully:', response);
        this.toastr.success(`Store successfully changed to ${store.name}`, 'Success');
        this.closeSettingsModal();
      },
      error: (err) => {
        console.error('Error updating default store:', err);
        this.toastr.error('Failed to change store. Please try again.', 'Error');
      }
    });
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
  // Add product to invoice items
addToInvoice(product: any) {
  // First check if product has stock available
  if (product.stock <= 0) {
    this.toastr.warning('This product is out of stock and cannot be added to the invoice.', 'Warning');
    return;
  }

  let productToAdd: any;
  let price: number;

  // Check if product is from recentProductsList
  if (product.product_branch) {
    productToAdd = product.product_branch;
    price = parseFloat(productToAdd.price);
    // Check stock from the product_branch
    if (productToAdd.stock <= 0) {
      this.toastr.warning('This product is out of stock and cannot be added to the invoice.', 'Warning');
      return;
    }
  } 
  // Check if product is from recentProducts (search results)
  else if (product.product) {
    productToAdd = product.branch;
    // Use branch.default_price if available, otherwise use product.price
    price = product.branch?.default_price ? parseFloat(product.branch.default_price) : parseFloat(productToAdd.price);
    
    // Also check stock from the main product if available
    if (product.stock <= 0) {
      this.toastr.warning('This product is out of stock and cannot be added to the invoice.', 'Warning');
      return;
    }
  } 
  // If it's neither (shouldn't happen), use the product directly
  else {
    productToAdd = product;
    price = parseFloat(product.price || '0');
    
    if (product.stock <= 0) {
      this.toastr.warning('This product is out of stock and cannot be added to the invoice.', 'Warning');
      return;
    }
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
 // Update quantity of an item
updateQuantity(item: any, change: number) {
  // Check if we're increasing quantity and if stock is available
  if (change > 0 && item.stock !== undefined && item.stock !== null) {
    if (item.quantity >= item.stock) {
      this.toastr.warning('Cannot add more items than available in stock', 'Warning');
      return;
    }
  }
  
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
      this.toastr.warning('Please add at least one item to the invoice before proceeding.', 'Warning');
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
       this.toastr.success('Invoice saved successfully!', 'Success');
       this.router.navigate(['/printInvoice', response.data.id]); // Navigate to print invoice page
        // Reset form data
        this.resetCheckoutForm();
        this.closeCheckoutModal();
      },
      error: (error) => {
        console.error('Error saving invoice:', error);
        this.toastr.error('Failed to save invoice. Please try again.', 'Error');
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

          console.log('Cashier added to myself:', response);
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
      this.toastr.warning('Please enter a position for the product.', 'Error');
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
  // Add this method to calculate text color based on background color
  getContrastColor(hexColor: string): string {
    if (!hexColor) return '#000000';
    
    // Remove # if present
    hexColor = hexColor.replace('#', '');
    
    // Convert hex to RGB
    const r = parseInt(hexColor.length === 3 ? 
                hexColor.substr(0, 1) + hexColor.substr(0, 1) : 
                hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.length === 3 ? 
                hexColor.substr(1, 1) + hexColor.substr(1, 1) : 
                hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.length === 3 ? 
                hexColor.substr(2, 1) + hexColor.substr(2, 1) : 
                hexColor.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light colors, white for dark colors
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }
}