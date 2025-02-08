import { Component } from '@angular/core';
import { ProductsService } from '../../shared/services/products.service';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-determinants',
  standalone: true,
  imports: [CommonModule,RouterModule,RouterLinkActive ,TranslateModule,FormsModule],
  templateUrl: './product-determinants.component.html',
  styleUrl: './product-determinants.component.css'
})
export class ProductDeterminantsComponent {
  determinants: any[] = [];
  filteredDeterminants: any[] = [];
  searchTerm: string = ''

  constructor(private _ProductsService: ProductsService, private router: Router) {}

  ngOnInit(): void {
    this.loadDeterminants();
  }

  loadDeterminants(): void {
    this._ProductsService.viewAllDeterminants().subscribe({
      next: (response) => {
        if (response) {
          console.log(response)
          this.determinants = response.data;
          this.filteredDeterminants = [...this.determinants];
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  deleteDeterminant(determinantId: number): void {
    if (confirm('Are you sure you want to delete this determinant?')) {
      this._ProductsService.deleteDeterminant(determinantId).subscribe({
        next: (response) => {
          if (response) {
            this.router.navigate(['/dashboard/productDeterminants']);
            this.loadDeterminants();
          }
        },
        error: (err) => {
          console.error(err);
          alert('An error occurred while deleting the determinant.');
        }
      });
    }
  }

  searchDeterminants(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredDeterminants = [...this.determinants];
    } else {
      this.filteredDeterminants = this.determinants.filter(determinant =>
        determinant.determinant.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }
}


