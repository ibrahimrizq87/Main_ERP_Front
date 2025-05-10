import { Component, OnInit } from '@angular/core';
import { SalesService } from '../../shared/services/sales.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-view-return-sales',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './view-return-sales.component.html',
  styleUrl: './view-return-sales.component.css'
})
export class ViewReturnSalesComponent implements OnInit {

  storeData: any;

  constructor(
    private _SalesService: SalesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const saleId = this.route.snapshot.paramMap.get('id');
    console.log('sale ID:', saleId);
    if (saleId) {

      this.fetchReturnSaleData(saleId);
    }
  }

 
  fetchReturnSaleData(saleId: string): void {
    this._SalesService.getReturnSaleById(saleId).subscribe({
      next: (response) => {
        console.log(response.data);
        this.storeData = response?.data || {};
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching Return sales data:', err.message);
      }
    });
  }
  
}
