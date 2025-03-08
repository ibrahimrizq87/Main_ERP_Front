import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { ProductsService } from '../../shared/services/products.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProductBranchesService } from '../../shared/services/product_branches.service';

@Component({
  selector: 'app-show-product',
  standalone: true,
  imports: [CommonModule,RouterLinkActive,RouterModule,TranslateModule],
  templateUrl: './show-product.component.html',
  styleUrls: ['./show-product.component.css']
})
export class ShowProductComponent implements OnInit {
  product: any;
  showBranches=false;
  branches:any;
  constructor(
    private _ProductsService: ProductsService,
    private _ProductBranchesService:ProductBranchesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.fetchProductData(productId);
    }
    this.loadProductBranches(productId||'');
  }


  

  loadProductBranches(productId:string){

    
    this._ProductBranchesService.getProductBranchesByProductId(productId).subscribe({
      next: (response) => {
        this.branches = response.data ;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching product data:', err.message);
      }
    });
  }

  fetchProductData(productId: string): void {
    this._ProductsService.viewProductById(productId).subscribe({
      next: (response) => {
        console.log(response);
        this.product = response.data ;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching product data:', err.message);
      }
    });
  }
}
