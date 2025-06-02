import { Component, OnInit } from '@angular/core';
import { StocktakingService } from '../../shared/services/stocktaking.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-stocktakings',
  standalone: true,
  imports: [TranslateModule,RouterModule,CommonModule,FormsModule],
  templateUrl: './stocktakings.component.html',
  styleUrl: './stocktakings.component.css'
})
export class StocktakingsComponent implements OnInit {

  stocktakings: any[] = []; 
  filteredStocktakings: any[] = [];
  searchQuery: string = '';

  constructor(private _StocktakingService: StocktakingService, private router: Router,private toastr:ToastrService) {}

  ngOnInit(): void {
    this.loadStocktakings(); 
  }

  loadStocktakings(): void {
    this._StocktakingService.viewAllStocktakings().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.stocktakings = response.data;
          this.filteredStocktakings = this.stocktakings;  
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  filterStocktakings(): void {
    if (this.searchQuery.trim() === '') {
      this.filteredStocktakings = this.stocktakings;  
    } else {
      this.filteredStocktakings = this.stocktakings.filter(stocktaking =>
        stocktaking.aribic_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        stocktaking.english_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        stocktaking.type_bank.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }
  deleteStocktaking(stocktakingId: number): void {
    if (confirm('Are you sure you want to delete this stocktaking?')) {
      this._StocktakingService.deleteStocktakings(stocktakingId).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف  المخزون بنجاح');
            this.router.navigate(['/dashboard/stocktakings']);
            this.loadStocktakings();
          }
        },
        error: (err) => {
          this.toastr.error(' حدث خطأ أثناء حذف المخزون');
          console.error(err);
         
        }
      });
    }
  }
}
