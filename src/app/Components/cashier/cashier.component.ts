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
  private searchSubject = new Subject<string>();
  searchQuery: string = '';

  constructor(private _CashierService: CashierService) {
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(query => {
      this.searchProducts(query);
    });
  }

  ngOnInit(): void {
   this.addCashierToMyself();
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

  openRecentModal() {
    const modalElement = document.getElementById('recentProductsModal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
      // Load all products when modal opens
      this.searchProducts('');
    }
  }

  closeRecentModal() {
    const modalElement = document.getElementById('recentProductsModal');
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
      this.searchQuery = ''; // Clear search when modal closes
      this.recentProducts = []; // Clear results
    }
  }
}