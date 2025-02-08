import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { ProductsService } from '../../shared/services/products.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-view-product-branch',
  standalone: true,
  imports: [CommonModule,RouterLinkActive,RouterModule,TranslateModule],
  templateUrl: './view-product-branch.component.html',
  styleUrl: './view-product-branch.component.css'
})
export class ViewProductBranchComponent implements OnInit {
  storeData: any;

  constructor(
    private _ProductsService: ProductsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.fetchProductData(productId);
    }
  }

  fetchProductData(productId: string): void {
    this._ProductsService.getBranchById(productId).subscribe({
      next: (response) => {
        console.log(response);
        this.storeData = response?.productBranch || {};
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching product data:', err.message);
      }
    });
  }
}

