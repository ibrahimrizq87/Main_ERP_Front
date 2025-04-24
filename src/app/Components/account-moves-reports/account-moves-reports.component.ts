import { Component } from '@angular/core';
import { ProductsService } from '../../shared/services/products.service';
import { FormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';

import { RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AccountService } from '../../shared/services/account.service';
import { ClientService } from '../../shared/services/client.service';
import { ReportsService } from '../../shared/services/reports.service';
import { StoreService } from '../../shared/services/store.service';
import { ProductBranchesService } from '../../shared/services/product_branches.service';

@Component({
  selector: 'app-account-moves-reports',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterLinkActive,RouterModule,TranslateModule],
  templateUrl: './account-moves-reports.component.html',
  styleUrl: './account-moves-reports.component.css'
})
export class AccountMovesReportsComponent {



  MoveType = 'all';
  EventType ='all';
  filters = {
    startDate: '',
    endDate: '',
    day: '',
    month: '',
    year: '',
  };


  searchDateType = 'from_to_date'; 
  productMoves:any;
  totalCount = 0;
  totalMoves = 0;
  productSearchQuery = '';
  selectedProduct:any;
  branches:any;
  filteredProducts :any;
  stores: any[] = [];

  constructor(
    private productService: ProductsService,
    private _StoreService:StoreService,
    private _ProductBranchesService:ProductBranchesService,
    private _ReportsService:ReportsService
  ) {

  }
  StoreId = 'all';
  ngOnInit(): void {
  this.loadStores();
  this.loadBranches();
  this.getProductMovesReport();
  }



  loadBranches(): void {
    this._ProductBranchesService.viewAllProductBranches().subscribe({
      next: (response) => {
        if (response) {
          console.log(response)
          this.branches = response.data; 
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }


  loadStores() {
    this._StoreService.getAllStores().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.stores = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

 

  getProductMovesReport(): void {
    const moveType = this.MoveType;
    const eventType = this.EventType;

    const storeId = this.StoreId ;
    const branchId = this.selectedProduct?.id || 'all';


    const startDate = this.filters.startDate || '';
    const endDate = this.filters.endDate || '';
    const day = this.filters.day || '';
    const month = this.filters.month || '';
    const year = this.filters.year || '';

    this._ReportsService.getProductMovesReports(
      moveType,
      eventType,
      storeId,
      branchId,
      startDate,
      endDate,

      day,
      month,
      year
    ).subscribe({
      next: (response) => {
        console.log(response);
        this.productMoves = response.moves || [];
        this.totalCount = response.total_count || 0;
      },
      error: (error) => {
        console.error('Error fetching sales report:', error);
      }
    });
  }
  
  clearSearchFields(): void {
    this.selectedProduct = null;
    this.StoreId = 'all';
    this.MoveType = 'all';

  }

  onSearchTypeChange(): void {
    this.filters = { startDate: '', endDate: '', day: '', month: '', year: '' };
  }

  openProductModal() {
    const modalElement = document.getElementById('productModel');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }



  closeProductModal(){
    const modalElement = document.getElementById('productModel');
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }


  onProductSearchChange(){}
  filterProducts(query: string){
    // Your filtering logic here (e.g., filtering by name)
    // return this.filteredProducts.filter(product => product.name.includes(query));
  }

  selectProduct(product: any): void {
    this.selectedProduct = product;
    this.closeProductModal();
  }
}