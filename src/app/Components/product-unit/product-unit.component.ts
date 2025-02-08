import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../shared/services/products.service';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-product-unit',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormsModule,RouterLinkActive,RouterModule ,TranslateModule],
  templateUrl: './product-unit.component.html',
  styleUrl: './product-unit.component.css'
})
export class ProductUnitComponent implements OnInit {

  units: any[] = []; 
  filteredUnits: any[] = [];
  searchTerm: string = '';

  constructor(private _ProductsService: ProductsService, private router: Router) {}

  ngOnInit(): void {
    this.loadUnits(); 
  }

  loadUnits(): void {
    this._ProductsService.viewProductUnits().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.units = response.data; 
          this.filteredUnits = [...this.units];
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  deleteUnit(unitId: number): void {
    if (confirm('Are you sure you want to delete this Unit?')) {
      this._ProductsService.deleteUnit(unitId).subscribe({
        next: (response) => {
          if (response) {
            this.router.navigate(['/dashboard/productUnit']);
            this.loadUnits();
          }
        },
        error: (err) => {
          console.error(err);
          alert('An error occurred while deleting the Unit.');
        }
      });
    }
  }
  searchUnits(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredUnits = [...this.units];
    } else {
      this.filteredUnits = this.units.filter(unit =>
        unit.unit.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }
}

