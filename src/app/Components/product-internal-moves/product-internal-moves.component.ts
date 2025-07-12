import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProductInternalMovesService } from '../../shared/services/product-internal-moves.service';
import { TranslateModule } from '@ngx-translate/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PermissionService } from '../../shared/services/permission.service';

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

  searchDateType ='day';

  filters = {
    toStore:'',
    fromStore:'',

    startDate: '',
    endDate: '',

    day: this.getTodayDate(),
  };

    getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  onSearchTypeChange(){
    this.filters.startDate = '';
    this.filters.endDate = '';
    this.filters.day = '';
  }

  clearSerachFields(){
    this.filters.toStore = '';
    this.filters.fromStore = '';

  }

  status = 'waiting';
  constructor(private _ProductInternalMovesService: ProductInternalMovesService, private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    public _PermissionService: PermissionService

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


    const fromStore = this.filters.fromStore || '';
    const toStore = this.filters.toStore || '';
    const startDate = this.filters.startDate || '';
    const endDate = this.filters.endDate || '';
    const day = this.filters.day || '';


    this._ProductInternalMovesService.getProductMovesByStatus(status,
         fromStore,
      toStore,
      startDate,
      endDate,
      day,
    ).subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.productMoves = response.data.moves;
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
    if (confirm('هل أنت متأكد أنك تريد حذف حركة المنتج؟')) {
      this._ProductInternalMovesService.deleteProductMoves(productMoveId).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف حركة المنتج بنجاح');
            this.router.navigate([`/dashboard/productInternalMoves/${this.status}`]);
            this.loadProductMoves(this.status);
          }
        },
        error: (err) => {
          this.toastr.error('حدث خطأ أثناء حذف حركة المنتج');
          console.error(err);
        }
      });
    }
  }
  

}