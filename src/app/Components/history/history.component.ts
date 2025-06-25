import { Component, OnInit } from '@angular/core';
import { CashierService } from '../../shared/services/cashier.service';
import { CommonModule, formatDate } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxPaginationModule,FormsModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  invoices: any[] = [];
  selectedDate: string;
  isLoading: boolean = false;
  
  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  lastPage: number = 1;

  constructor(private cashierService: CashierService, private router: Router) {
    this.selectedDate = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  }

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.isLoading = true;
    this.cashierService.getMyInvoices(this.selectedDate, this.currentPage, this.itemsPerPage).subscribe({
      next: (response) => {
        console.log('Loading invoices for date:', this.selectedDate);
        console.log('Invoices loaded:', response);
        this.invoices = response.data.invoices || [];
        this.totalItems = response.data.meta.total;
        this.lastPage = response.data.meta.last_page;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.isLoading = false;
      }
    });
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && input.value) {
      this.selectedDate = input.value;
      this.currentPage = 1; // Reset to first page when date changes
      this.loadInvoices();
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadInvoices();
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1; // Reset to first page when items per page changes
    this.loadInvoices();
  }

  goBack() {
    this.router.navigate(['/cashier']);
  }

  navigateToInvoice(invoiceId: number) {
    this.router.navigate(['/printInvoice', invoiceId]);
  }
}