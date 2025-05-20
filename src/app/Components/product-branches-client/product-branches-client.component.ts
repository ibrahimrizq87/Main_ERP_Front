import { Component } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-branches-client',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './product-branches-client.component.html',
  styleUrl: './product-branches-client.component.css'
})
export class ProductBranchesClientComponent {

addToWishlist(_t11: any) {
throw new Error('Method not implemented.');
}


  productBranches: any[] = []; 
  filteredProductBranches: any[] = [];
  searchTerm: string = '';

  constructor(private _AuthService: AuthService, private router: Router,
     private toastr:ToastrService

  ) {}

  ngOnInit(): void {
    this.loadUnits(); 
  }

  loadUnits(): void {
    this._AuthService.getProductBranch().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.productBranches = response.data; 
          this.filteredProductBranches = [...this.productBranches];
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  filterProducts() {
    if (this.searchTerm) {
      this.filteredProductBranches = this.productBranches.filter(product =>
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredProductBranches = [...this.productBranches];
    }

  }
  viewProduct(productId: any) {
    this.router.navigate(['/showProductClient', productId]);
    }
    addToCart(productId: any,default_price: any) {
      const formData = new FormData();
      formData.append('product_branch_id', productId);
      formData.append('quantity', '1'); 
      formData.append('price', default_price);
      this._AuthService.addProductBranchById(formData).subscribe({
        next: (response) => {
          if (response) {
            console.log(response);
            this.toastr.success(response.message);
          }
        },
        error: (err) => {
          console.error(err);
        }
      });

    }
}
