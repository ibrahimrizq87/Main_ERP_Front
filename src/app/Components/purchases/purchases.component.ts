import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';  
import { Router, RouterModule } from '@angular/router';
import { PurchasesService } from '../../shared/services/purchases.service';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-purchases',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,RouterModule,TranslateModule,FormsModule],
  templateUrl: './purchases.component.html',
  styleUrl: './purchases.component.css'
})
export class PurchasesComponent implements OnInit {
  purchases: any[] = []; 
  filteredPurchases: any[] = []; 
  searchTerm: string = '';
  constructor(private _PurchasesService: PurchasesService, private router: Router) {}

  ngOnInit(): void {
    this.loadPurchases(); 
  }

  loadPurchases(): void {
    this._PurchasesService.getPurchaseBillsByStatus('pending').subscribe({
      next: (response) => {
        if (response) {
          console.log(response.data);
          this.purchases = response.data; 
          this.filteredPurchases = this.purchases;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  filterPurchases(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredPurchases = this.purchases; // If no search term, show all
    } else {
      this.filteredPurchases = this.purchases.filter(purchase => 
        purchase.type.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
        purchase.invoice_date.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        purchase.tax_type.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }
  deletePurchase(purchaseId: number): void {
    if (confirm('Are you sure you want to delete this Purchase?')) {
      this._PurchasesService.deletePurchase(purchaseId).subscribe({
        next: (response) => {
          if (response) {
            this.router.navigate(['/dashboard/purchases']);
            this.loadPurchases();
          }
        },
        error: (err) => {
          console.error(err);
          alert('An error occurred while deleting the Purchase.');
        }
      });
    }
  }
  changeStatus(purchaseId: number): void {
    if (confirm('Are you sure you want to Approve this Purchase?')) {
      this._PurchasesService.storeStatusOfPurchaseBill(purchaseId).subscribe({
        next: (response) => {
          if (response) {
            this.router.navigate(['/dashboard/purchases']);
            this.loadPurchases();
          }
        },
        error: (err) => {
          console.error(err);
          alert('An error occurred while Approve the Purchase.');
        }
      });
    }
  }
}