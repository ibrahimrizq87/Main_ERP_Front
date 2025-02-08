import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { ProductsService } from '../../shared/services/products.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterLinkActive, RouterModule,CommonModule,TranslateModule,FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {

  Products: any[] = []; 
  filteredProducts: any[] = [];  
  searchTerm: string = ''; 

  constructor(private _ProductsService: ProductsService, private router: Router) {}

  ngOnInit(): void {
    this.loadProducts(); 
  }

  loadProducts(): void {
    this._ProductsService.viewAllProducts().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.Products = response.data; 
          this.filteredProducts = this.Products;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  deleteProduct(productId: number): void {
    if (confirm('Are you sure you want to delete this Product?')) {
      this._ProductsService.deleteProduct(productId).subscribe({
        next: (response) => {
          if (response) {
            this.router.navigate(['/dashboard/products']);
            this.loadProducts();
          }
        },
        error: (err) => {
          console.error(err);
          alert('An error occurred while deleting the Product.');
        }
      });
    }
  }
  searchProducts(): void {
    this.filteredProducts = this.Products.filter(product => 
      product.name_ar.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
      product.unit?.unit.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      product.product_dimension.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}


