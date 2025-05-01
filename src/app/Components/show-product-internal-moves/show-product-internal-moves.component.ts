import { Component, OnInit } from '@angular/core';
import { ProductInternalMovesService } from '../../shared/services/product-internal-moves.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-show-product-internal-moves',
  standalone: true,
  imports: [RouterModule,CommonModule,TranslateModule],
  templateUrl: './show-product-internal-moves.component.html',
  styleUrl: './show-product-internal-moves.component.css'
})
export class ShowProductInternalMovesComponent implements OnInit {

  productMoveData: any;
  constructor(
    private _ProductInternalMovesService: ProductInternalMovesService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const productMoveId = this.route.snapshot.paramMap.get('id');
    if (productMoveId) {
      this.fetchMoveData(productMoveId);
    }
  }

 
  fetchMoveData(productMoveId: string): void {
    this._ProductInternalMovesService.getProductMovesById(productMoveId).subscribe({
      next: (response) => {
        console.log(response.data);
        this.productMoveData = response?.data || {};
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching purchase data:', err.message);
      }
    });
  }
  
}
