// src/app/Components/stores/stores.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { StoreService } from '../../shared/services/store.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-stores',
  standalone: true,
  imports: [RouterLinkActive, RouterModule, CommonModule, TranslateModule, FormsModule, NgxPaginationModule],
  templateUrl: './stores.component.html',
  styleUrls: ['./stores.component.css']
})
export class StoresComponent implements OnInit {
  allStores: any[] = []; // Store all loaded stores
  filteredStores: any[] = []; // Store filtered stores for display
  searchQuery: string = '';
  selectedType: string = '';
  
  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  lastPage: number = 1;

  constructor(
    private _StoreService: StoreService, 
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadStores();
  }

  loadStores(): void {
    this._StoreService.getAllStoresByType(this.selectedType, this.currentPage, this.itemsPerPage).subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.allStores = response.data;
          this.filterStores();
          this.totalItems = response.meta.total;
          this.lastPage = response.meta.last_page;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  filterStores(): void {
    if (!this.searchQuery) {
      this.filteredStores = [...this.allStores];
      return;
    }

    const searchTerm = this.searchQuery.toLowerCase();
    this.filteredStores = this.allStores.filter(store => 
      (store.name?.toLowerCase().includes(searchTerm) ||
      (store.address_description?.toLowerCase().includes(searchTerm)) ||
      (store.manager_name?.toLowerCase().includes(searchTerm)) ||
      (store.phone?.toLowerCase().includes(searchTerm))
    ));
  }

  onTypeChange(): void {
    this.currentPage = 1;
    this.loadStores();
  }

  onSearchChange(): void {
    this.filterStores();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadStores();
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.loadStores();
  }

  deleteStore(store_id: number): void {
    if (confirm('Are you sure you want to delete this Store ?')) {
      this._StoreService.deleteStore(store_id).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف المتجر بنجاح');
            this.loadStores();
          }
        },
        error: (err) => {
          this.toastr.error('حدث خطا اثناء حذف المتجر');
          console.error(err);
        }
      });
    }
  }
}