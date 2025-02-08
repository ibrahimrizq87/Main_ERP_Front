import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { ProductsService } from '../../shared/services/products.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-show-product',
  standalone: true,
  imports: [CommonModule,RouterLinkActive,RouterModule,TranslateModule],
  templateUrl: './show-product.component.html',
  styleUrls: ['./show-product.component.css']
})
export class ShowProductComponent implements OnInit {
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
    this._ProductsService.viewProductById(productId).subscribe({
      next: (response) => {
        console.log(response);
        this.storeData = response?.product || {};
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching product data:', err.message);
      }
    });
  }
}
