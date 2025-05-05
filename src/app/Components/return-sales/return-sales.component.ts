import { Component } from '@angular/core';
import { SalesService } from '../../shared/services/sales.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-return-sales',
  standalone: true,
  imports: [TranslateModule,RouterModule,CommonModule,FormsModule],
  templateUrl: './return-sales.component.html',
  styleUrl: './return-sales.component.css'
})
export class ReturnSalesComponent {

  sales: any[] = [];
  filteredSales: any[] = [];
  searchTerm: string = '';
  status = 'waiting';

  constructor(private _SalesService: SalesService, private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) { }

  ManageChangeStatus(status: string, id: string) {
    this._SalesService.UpdateReturnSaleBillStatus(id, status).subscribe({
      next: (response) => {
        if (response) {
          this.loadSales(this.status);

        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  changeStatus(status: string) {
    this.status = status;
    this.router.navigate([`/dashboard/return-sales/${status}`]);
    this.loadSales(status);
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const newStatus = params.get('status');
      if (newStatus && this.status !== newStatus) {
        this.status = newStatus;

      }
    });
    this.loadSales(this.status);
  }

  loadSales(status: string): void {
    this._SalesService.getReturnSaleBillsByStatus(status).subscribe({
      next: (response) => {
        if (response) {
          console.log(response.data);
          this.sales = response.data;
          this.filteredSales = this.sales;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  filterSales(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredSales = this.sales; // If no search term, show all
    } else {
      this.filteredSales = this.sales.filter(sale =>
        sale.type.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        sale.invoice_date.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        sale.tax_type.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }
  deleteReturnSale(saleId: number): void {
    if (confirm('Are you sure you want to delete this sale?')) {
      this._SalesService.deleteReturnSale(saleId).subscribe({
        next: (response) => {
          if (response) {

            this.toastr.success('تم حذف الفاتورة بنجاح');
            this.router.navigate(['/dashboard/return-sales/waiting']);
            this.loadSales(this.status);
          }
        },
        error: (err) => {
          this.toastr.error('حدث خطا اثناء حذف الفاتورة');
          console.error(err);

        }
      });
    }
  }

}
