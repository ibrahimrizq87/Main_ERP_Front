import { Component, OnInit } from '@angular/core';
import { SalesService } from '../../shared/services/sales.service';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule,RouterLinkActive,RouterModule,TranslateModule],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css'
})
export class SalesComponent implements OnInit {
  sales: any[] = []; 

  constructor(private _SalesService: SalesService, private router: Router) {}

  ngOnInit(): void {
    this.loadPurchases(); 
  }

  loadPurchases(): void {
    this._SalesService.viewAllSales('pending').subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.sales = response.data; 
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  changeStatus(id:string){
    this._SalesService.updateStatus(id).subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.loadPurchases(); 
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  
  }
  deleteSale(saleId: number): void {
    if (confirm('Are you sure you want to delete this sale?')) {
      this._SalesService.deleteSale(saleId).subscribe({
        next: (response) => {
          if (response) {
            this.router.navigate(['/dashboard/sales']);
            this.loadPurchases();
          }
        },
        error: (err) => {
          console.error(err);
          alert('An error occurred while deleting the sale.');
        }
      });
    }
  }
}