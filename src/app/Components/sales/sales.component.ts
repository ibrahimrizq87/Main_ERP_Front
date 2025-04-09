import { Component, OnInit } from '@angular/core';
import { SalesService } from '../../shared/services/sales.service';
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule,RouterLinkActive,RouterModule,TranslateModule],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css'
})
export class SalesComponent implements OnInit {
  sales: any[] = []; 

  constructor(private _SalesService: SalesService, private router: Router,
            private route: ActivatedRoute,
            private toastr:ToastrService
    
  ) {}
  status ='waiting';

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const newStatus = params.get('status');
      if (newStatus && this.status !== newStatus) {
          this.status = newStatus;
 
      }
    });
    this.loadSales(this.status); 
  }
  ManageChangeStatus(status:string ,id:string){
    this._SalesService.UpdateSaleBillStatus(id ,status ).subscribe({
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
  loadSales(status:string): void {
    this._SalesService.getAllSaleBillsByStatus(status).subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.sales = response.data; 
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  changeStatus(status:string){
    this.status = status;
    this.router.navigate([`/dashboard/sales/${status}`]);
    this.loadSales(status);
      }

  deleteSale(saleId: number): void {
    if (confirm('Are you sure you want to delete this sale?')) {
      this._SalesService.deleteSale(saleId).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف المبيعات بنجاح');
            this.router.navigate(['/dashboard/sales']);
            this.loadSales(this.status);
          }
        },
        error: (err) => {
          this.toastr.error('حدث خطا اثناء حذف المبيعات');
          console.error(err);
          // alert('An error occurred while deleting the sale.');
        }
      });
    }
  }
}