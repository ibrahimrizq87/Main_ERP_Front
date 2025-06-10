import { Component, OnInit } from '@angular/core';
import { SalesService } from '../../shared/services/sales.service';
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PermissionService } from '../../shared/services/permission.service';
import { Modal } from 'bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule,RouterLinkActive,RouterModule,TranslateModule ,FormsModule],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css'
})
export class SalesComponent implements OnInit {



  searchDateType ='day';

  filters = {
    clientName:'',
    delegateName:'',
    paymentType: 'all',
    startDate: '',
    endDate: '',
    priceFrom: '',
    priceTo: '',
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
    this.filters.priceFrom = '';
    this.filters.priceTo = '';
    this.filters.paymentType = 'all';
    this.filters.clientName ='';
    this.filters.delegateName ='';
  }
  sales: any[] = []; 

  constructor(private _SalesService: SalesService, private router: Router,
            private route: ActivatedRoute,
            private toastr:ToastrService,
            public _PermissionService: PermissionService
    
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




  dateChange(){
    
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
        }
      });
    }
  }




    loadSales(status:string): void {
    const clientName = this.filters.clientName || '';
    const delegateName = this.filters.delegateName || '';
    const paymentType = this.filters.paymentType || 'all';
    const startDate = this.filters.startDate || '';
    const endDate = this.filters.endDate || '';
    const priceFrom = this.filters.priceFrom || '';
    const priceTo = this.filters.priceTo || '';
    const day = this.filters.day || '';

  
    this._SalesService.getAllSaleBillsByStatus(
      status,
      clientName,
      delegateName,
      paymentType,
      startDate,
      endDate,
      priceFrom,
      priceTo,
      day,

    ).subscribe({
      next: (response) => {
        this.sales = response.data.bills || [];
      },
      error: (error) => {
        console.error('Error fetching sales report:', error);
      }
    });
  }
}

interface Account {
  id: string;
  name: string;
}



interface Currency {
  id: string;
  name: string;
}

interface SerialNumber {
  serialNumber: string;

}