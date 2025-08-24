import { Component, OnInit } from '@angular/core';
import { StocktakingService } from '../../shared/services/stocktaking.service';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-view-stocktakings',
  standalone: true,
  imports: [CommonModule,TranslateModule],
  templateUrl: './view-stocktakings.component.html',
  styleUrl: './view-stocktakings.component.css'
})
export class ViewStocktakingsComponent implements OnInit {
  stocktakingData: any;

  constructor(
    private _StocktakingService: StocktakingService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const stocktaking_id = this.route.snapshot.paramMap.get('id');
    if (stocktaking_id) {
      this.fetchStocktakingData(stocktaking_id);
    }
  }

  fetchStocktakingData(stocktaking_id: string): void {
    this._StocktakingService.viewStocktakingsById(stocktaking_id).subscribe({
      next: (response) => {
        console.log(response);
        this.stocktakingData = response.data;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching product data:', err.message);
      }
    });
  }
}
