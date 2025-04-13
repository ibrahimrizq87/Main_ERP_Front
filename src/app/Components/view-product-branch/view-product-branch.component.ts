import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ProductBranchesService } from '../../shared/services/product_branches.service';

@Component({
  selector: 'app-view-product-branch',
  standalone: true,
  imports: [CommonModule,RouterLinkActive,RouterModule,TranslateModule],
  templateUrl: './view-product-branch.component.html',
  styleUrl: './view-product-branch.component.css'
})
export class ViewProductBranchComponent implements OnInit {
  productBranchData: any;

  constructor(
    private _ProductBranchesService: ProductBranchesService,
   
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const productBranchId = this.route.snapshot.paramMap.get('id');
    if (productBranchId) {
      this.fetchProductBranchData(productBranchId);
    }
  }

  fetchProductBranchData(productBranchId: string): void {
    this._ProductBranchesService.viewProductBranchById(productBranchId).subscribe({
      next: (response) => {
        console.log(response);
        this.productBranchData = response.data|| {};
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching product data:', err.message);
      }
    });
  }
}

