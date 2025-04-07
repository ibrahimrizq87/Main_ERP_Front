import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProductUnitsService } from '../../shared/services/product_units.service';
import { ToastrService } from 'ngx-toastr';

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

  constructor(private _ProductUnitsService: ProductUnitsService, private router: Router,
     private toastr:ToastrService

  ) {}

  ngOnInit(): void {
    this.loadUnits(); 
  }

  loadUnits(): void {
    this._ProductUnitsService.getAllProductUnits().subscribe({
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
      this._ProductUnitsService.deleteProductUnit(unitId).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف الوحدة بنجاح');
            this.router.navigate(['/dashboard/productUnit']);
            this.loadUnits();
          }
        },
        error: (err) => {
          this.toastr.error('حدث خطا اثناء حذف الوحدة');
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

