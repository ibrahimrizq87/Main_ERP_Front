import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';  
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PurchasesService } from '../../shared/services/purchases.service';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PermissionService } from '../../shared/services/permission.service';


@Component({
  selector: 'app-return-purchase-bills',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,RouterModule,TranslateModule,FormsModule],
  templateUrl: './return-purchase-bills.component.html',
  styleUrl: './return-purchase-bills.component.css'
})
export class ReturnPurchaseBillsComponent {


  purchases: any[] = []; 
  filteredPurchases: any[] = []; 
  searchTerm: string = '';
  status ='waiting';



  searchDateType ='day';

  filters = {
    vendorName:'',
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
    this.filters.vendorName ='';
  }


  constructor(private _PurchasesService: PurchasesService, private router: Router,
        private route: ActivatedRoute,
        private toastr:ToastrService,
        public _PermissionService: PermissionService
  ) {}

  ManageChangeStatus(status:string ,id:string){
    this._PurchasesService.UpdateReturnPurchaseBillStatus(id ,status ).subscribe({
      next: (response) => {
        if (response) {
          this.loadPurchases(this.status);

        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  changeStatus(status:string){
    this.status = status;
    this.router.navigate([`/dashboard/return-purchase/${status}`]);
    this.loadPurchases(status);
      }



      // UpdatePurchaseBillStatus
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const newStatus = params.get('status');
      if (newStatus && this.status !== newStatus) {
          this.status = newStatus;
 
      }
    });


    this.loadPurchases(this.status); 
  }

  loadPurchases(status:string): void {
 const vendorName = this.filters.vendorName || '';
    const paymentType = this.filters.paymentType || 'all';
    const startDate = this.filters.startDate || '';
    const endDate = this.filters.endDate || '';
    const priceFrom = this.filters.priceFrom || '';
    const priceTo = this.filters.priceTo || '';
    const day = this.filters.day || '';


    this._PurchasesService.getReturnPurchaseBillsByStatus(status,
        vendorName,
      paymentType,
      startDate,
      endDate,
      priceFrom,
      priceTo,
      day,
    ).subscribe({
      next: (response) => {
        if (response) {
          console.log(response.data);
          this.purchases = response.data.bills; 
          this.filteredPurchases = this.purchases;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  filterPurchases(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredPurchases = this.purchases;
    } else {
      this.filteredPurchases = this.purchases.filter(purchase => 
        purchase.type.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
        purchase.invoice_date.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        purchase.tax_type.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }
  deletePurchase(purchaseId: number): void {
    if (confirm('Are you sure you want to delete this Purchase?')) {
      this._PurchasesService.deletePurchase(purchaseId).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف الفاتورة بنجاح');
            // this.router.navigate(['/dashboard/purchases']);
            this.loadPurchases(this.status);
          }
        },
        error: (err) => {
          this.toastr.error('حدث خطا اثناء حذف الفاتورة');
          console.error(err);
          // alert('An error occurred while deleting the Purchase.');
        }
      });
    }
  }

}