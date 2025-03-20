import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProductBranchesService } from '../../shared/services/product_branches.service';

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
  constructor(private _ProductBranchesService: ProductBranchesService, private router: Router) {}

  ngOnInit(): void {
    this.loadBranches(); 
  }

  loadBranches(): void {
    this._ProductBranchesService.viewAllProductBranches().subscribe({
      next: (response) => {
        if (response) {
          console.log(response)
          this.branches = response.data; 
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  

  deleteBranch(branchId: number): void {
    console.log(branchId)
    if (confirm('Are you sure you want to delete this Branch?')) {
      this._ProductBranchesService.deleteProductBranch(branchId).subscribe({
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


