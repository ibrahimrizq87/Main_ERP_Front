import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../shared/services/products.service';
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PurchasesService } from '../../shared/services/purchases.service';

@Component({
  selector: 'app-show-purchase',
  standalone: true,
  imports: [RouterLinkActive,RouterModule],
  templateUrl: './show-purchase.component.html',
  styleUrl: './show-purchase.component.css'
})
export class ShowPurchaseComponent implements OnInit {

  storeData: any;

  constructor(
    private _PurchasesService: PurchasesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const purchaseId = this.route.snapshot.paramMap.get('id');
    if (purchaseId) {
      this.fetchPurchaseData(purchaseId);
    }
  }

 
  fetchPurchaseData(purchaseId: string): void {
    this._PurchasesService.getPurchaseById(purchaseId).subscribe({
      next: (response) => {
        console.log(response.data);
        this.storeData = response?.data || {};
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching purchase data:', err.message);
      }
    });
  }
  
}
