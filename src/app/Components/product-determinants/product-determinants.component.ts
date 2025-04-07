import { Component } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { DeterminantService } from '../../shared/services/determinants.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-determinants',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive, TranslateModule, FormsModule],
  templateUrl: './product-determinants.component.html',
  styleUrl: './product-determinants.component.css'
})
export class ProductDeterminantsComponent {
  determinants: any[] = [];
  filteredDeterminants: any[] = [];
  searchTerm: string = '';
  selectedDeterminant: any = null;

  constructor(private _DeterminantService: DeterminantService, private router: Router,private toastr:ToastrService) {}

  ngOnInit(): void {
    this.loadDeterminants();
  }

  loadDeterminants(): void {
    this._DeterminantService.getAllDeterminants().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
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
      this._DeterminantService.deleteDeterminant(determinantId).subscribe({
        next: (response) => {
          if (response) {
            this.router.navigate(['/dashboard/productDeterminants']);
            this.loadDeterminants();
            this.toastr.success('تم حذف المحدد بنجاح');
          }
        },
        error: (err) => {
          console.error(err);
          alert('An error occurred while deleting the determinant.');
          this.toastr.error('حدث خطا اثناء حذف المحدد');
        }
      });
    }
  }

  searchDeterminants(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredDeterminants = [...this.determinants];
    } else {
      this.filteredDeterminants = this.determinants.filter(determinant =>
        determinant.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  openModal(determinant: any): void {
    this.selectedDeterminant = determinant;
    const modal = document.getElementById('determinantModal')!;
    const modalInstance = new (window as any).bootstrap.Modal(modal);
    modalInstance.show();
  }
}
