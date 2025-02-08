import { Component, OnInit } from '@angular/core';
import { PurchasesService } from '../../shared/services/purchases.service';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-approved-purchases',
  standalone: true,
  imports: [CommonModule,RouterModule,RouterLinkActive,TranslateModule,FormsModule],
  templateUrl: './approved-purchases.component.html',
  styleUrl: './approved-purchases.component.css'
})
export class ApprovedPurchasesComponent implements OnInit {
  purchases: any[] = []; 
  filteredPurchases: any[] = []; 
  searchTerm: string = '';
  constructor(private _PurchasesService: PurchasesService, private router: Router) {}

  ngOnInit(): void {
    this.loadPurchases(); 
  }

  loadPurchases(): void {
    this._PurchasesService.getPurchaseBillsByStatus('approved').subscribe({
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

}
