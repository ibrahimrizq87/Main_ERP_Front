import { Component } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { DeterminantService } from '../../shared/services/determinants.service';
import { ToastrService } from 'ngx-toastr';
import { Modal } from 'bootstrap';
import { PermissionService } from '../../shared/services/permission.service';

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

  constructor(private _DeterminantService: DeterminantService, private router: Router, private toastr: ToastrService,
            public _PermissionService: PermissionService
    
  ) {}

  ngOnInit(): void {
    this.loadDeterminants();
  }

  openDeterminantModal(determinant: any): void {
    this.selectedDeterminant = determinant;
    const modalElement = document.getElementById('determinantModal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }

  closeProductModal(): void {
    const modalElement = document.getElementById('determinantModal');
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }

  loadDeterminants(): void {
    this._DeterminantService.getAllDeterminants().subscribe({
      next: (response) => {
        if (response) {
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
          this.toastr.error('حدث خطأ أثناء حذف المحدد');
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
}
