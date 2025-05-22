import { Component } from '@angular/core';
import { VectionService } from '../../shared/services/vection.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vecations',
  standalone: true,
  imports: [TranslateModule,CommonModule,FormsModule ,RouterModule],
  templateUrl: './vecations.component.html',
  styleUrl: './vecations.component.css'
})
export class VecationsComponent {
  vecations: any[] = []; 
  filteredVecation: any[] = []; 
  searchTerm: string = '';

  constructor(private _VectionService: VectionService , private router: Router,private toastr:ToastrService) {}

  ngOnInit(): void {
    this.loadVecations(); 
  }

  loadVecations(): void {
    this._VectionService.getAllVecations().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.vecations = response.data;
          this.filteredVecation = [...this.vecations]; 
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  filterVecations(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredVecation = this.vecations.filter(vecation => 
      vecation.start_date?.toLowerCase().includes(term) ||
      vecation.end_date?.toLowerCase().includes(term) ||
      vecation.reason?.toLowerCase().includes(term) 
    
    );
  }
  deleteVecation(vecation_id: number): void {
    if (confirm('هل انت متاكد من حذف الاجازة')) {
      this._VectionService.deleteVecation(vecation_id).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success( "تم حذف الاجازة بنجاح");
            this.router.navigate(['/dashboard/vecations']);
            this.loadVecations();
          }
        },
        error: (err) => {
          this.toastr.error(' فشل في حذف الاجازة');
          console.error(err);
        }
      });
    }
  }
}
