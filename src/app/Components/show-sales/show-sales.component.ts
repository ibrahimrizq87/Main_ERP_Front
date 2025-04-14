import { Component, OnInit } from '@angular/core';
import { SalesService } from '../../shared/services/sales.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-show-sales',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './show-sales.component.html',
  styleUrl: './show-sales.component.css'
})
export class ShowSalesComponent implements OnInit {

  saleData: any;

  constructor(
    private _SalesService: SalesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const salesId = this.route.snapshot.paramMap.get('id');
    console.log('Purchase ID:', salesId);
    if (salesId) {

      this.fetchPurchaseData(salesId);
    }
  }

 
  fetchPurchaseData(salesId: string): void {
    this._SalesService.getSaleById(salesId).subscribe({
      next: (response) => {
        console.log(response.data);
        this.saleData = response?.data || {};
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching purchase data:', err.message);
      }
    });
  }
  
}
