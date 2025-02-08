import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../shared/services/products.service';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-product-branch',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RouterLinkActive ,TranslateModule],
  templateUrl: './product-branch.component.html',
  styleUrl: './product-branch.component.css'
})
export class ProductBranchComponent implements OnInit {

  branches: any[] = []; 
  searchQuery: string = '';
  constructor(private _ProductsService: ProductsService, private router: Router) {}

  ngOnInit(): void {
    this.loadBranches(); 
  }

  loadBranches(): void {
    this._ProductsService.viewProductBranches().subscribe({
      next: (response) => {
        // console.log(response)
        if (response) {
          console.log(response)
          this.branches = response.productBranches; 
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  filterBranches(): any[] {
    if (!this.searchQuery) {
      return this.branches; 
    }
    return this.branches.filter(branch => {
      const productName = branch.product.name_ar.toLowerCase();
      const store = branch.store_id.toString().toLowerCase();
      const query = this.searchQuery.toLowerCase();
      return productName.includes(query) || store.includes(query); 
    });
  }
  deleteBranch(branchId: number): void {
    console.log(branchId)
    if (confirm('Are you sure you want to delete this Branch?')) {
      this._ProductsService.deleteBranch(branchId).subscribe({
        next: (response) => {
          if (response) {
            console.log(response)
            this.router.navigate(['/dashboard/productBranch']);
            this.loadBranches();
          }
        },
        error: (err) => {
          console.error(err);
          alert('An error occurred while deleting the Branch.');
        }
      });
    }
  }
}


