import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PurchasesService } from '../../shared/services/purchases.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-show-purchase',
  standalone: true,
  imports: [RouterModule,CommonModule],
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
    console.log('Purchase ID:', purchaseId);
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
