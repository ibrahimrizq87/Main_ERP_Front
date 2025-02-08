import { Component, OnInit } from '@angular/core';
import { PurchasesService } from '../../shared/services/purchases.service';
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-show-order',
  standalone: true,
  imports: [RouterModule,RouterLinkActive],
  templateUrl: './show-order.component.html',
  styleUrl: './show-order.component.css'
})
export class ShowOrderComponent implements OnInit {

  storeData: any;

  constructor(
    private _PurchasesService: PurchasesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.fetchPurchaseData(orderId);
    }
  }

 
  fetchPurchaseData(orderId: string): void {
    this._PurchasesService.getOrderById(orderId).subscribe({
      next: (response) => {
        console.log(response.data);
        this.storeData = response?.data || {};
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching Orders data:', err.message);
      }
    });
  }
  
}

