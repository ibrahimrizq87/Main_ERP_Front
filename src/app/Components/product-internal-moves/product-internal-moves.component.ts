import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProductInternalMovesService } from '../../shared/services/product-internal-moves.service';
import { TranslateModule } from '@ngx-translate/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-internal-moves',
  standalone: true,
  imports: [RouterLinkActive,RouterModule,TranslateModule,CommonModule,FormsModule],
  templateUrl: './product-internal-moves.component.html',
  styleUrl: './product-internal-moves.component.css'
})
export class ProductInternalMovesComponent implements OnInit {
  productMoves: any[] = [];
  filteredMoves: any[] = [];
  searchTerm: string = '';

  status = 'waiting';
  constructor(private _ProductInternalMovesService: ProductInternalMovesService, private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService

  ) { }

  ManageChangeStatus(status: string, id: string) {
    this._ProductInternalMovesService.updateProductMovesByStatus(id, status).subscribe({
      next: (response) => {
        if (response) {
          this.loadProductMoves(this.status);

        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  changeStatus(status: string) {
    this.status = status;
    this.router.navigate([`/dashboard/productInternalMoves/${status}`]);
    this.loadProductMoves(status);
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const newStatus = params.get('status');
      console.log('newStatus', newStatus);
      if (newStatus && this.status !== newStatus) {
        this.status = newStatus;

      }
    });


    this.loadProductMoves(this.status);
  }

  loadProductMoves(status: string): void {
    this._ProductInternalMovesService.getProductMovesByStatus(status).subscribe({
      next: (response) => {
        if (response) {
          console.log(response.data);
          this.productMoves = response.data;
          this.filteredMoves = this.productMoves;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  filteredProductMoves(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredMoves = this.productMoves;
    } else {
      this.filteredMoves = this.productMoves.filter(productMove =>
        productMove.type.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        productMove.invoice_date.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        productMove.tax_type.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }
  deleteProductMove(productMoveId: number): void {
    if (confirm('Are you sure you want to delete this productMove?')) {
      this._ProductInternalMovesService.deleteProductMoves(productMoveId).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف Product Move بنجاح');
            this.router.navigate([`/dashboard/productInternalMoves/${this.status}`]);
            this.loadProductMoves(this.status);

          }
        },
        error: (err) => {
          this.toastr.error('حدث خطا اثناء حذف Product Move');
          console.error(err);

        }
      });
    }
  }

}