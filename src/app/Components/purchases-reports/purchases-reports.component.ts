
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';

import { RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AccountService } from '../../shared/services/account.service';
import { ClientService } from '../../shared/services/client.service';
import { ReportsService } from '../../shared/services/reports.service';

@Component({
  selector: 'app-purchases-reports',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterLinkActive,RouterModule,TranslateModule],
  templateUrl: './purchases-reports.component.html',
  styleUrl: './purchases-reports.component.css'
})
export class PurchasesReportsComponent {



  clients:any;
  bills: any[] = [];
  totalMoney = 0;
  totalCount = 0;
  vendors:any;
  searchDateType ='from_to_date';

  filters = {
    clientId:'all',
    delegateId:'all',
    paymentType: 'all',
    startDate: '',
    endDate: '',
    priceFrom: '',
    priceTo: '',
    day: '',
    month: '',
    year: '',
  };

  constructor(
    private _AccountService:AccountService ,
    private _ClientService:ClientService,
    private _ReportsService:ReportsService

  ) {

    
  }

  ngOnInit(): void {
    this.getSalesReport();
    this.loadSuppliers();
  }





  onSearchTypeChange(){
    this.filters.startDate = '';
    this.filters.endDate = '';
    this.filters.month = '';
    this.filters.year = '';
    this.filters.day = '';
  }



  loadSuppliers(): void {
    this._AccountService.getAccountsByParent('621').subscribe({
      next: (response) => {
        if (response) {
          const Suppliers = response.data;
          this.vendors = Suppliers;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }



  
  getSalesReport(): void {
    const clientId = this.selectedVendor?.id || 'all';
    const paymentType = this.filters.paymentType || 'all';
    const startDate = this.filters.startDate || '';
    const endDate = this.filters.endDate || '';
    const priceFrom = this.filters.priceFrom || '';
    const priceTo = this.filters.priceTo || '';
    const day = this.filters.day || '';
    const month = this.filters.month || '';
    const year = this.filters.year || '';
  
    this._ReportsService.getPurchaseReports(
      clientId,
      paymentType,
      startDate,
      endDate,
      priceFrom,
      priceTo,
      day,
      month,
      year
    ).subscribe({
      next: (response) => {
        this.bills = response.bills || [];
        this.totalMoney = response.total_money || 0;
        this.totalCount = response.total_count || 0;
      },
      error: (error) => {
        console.error('Error fetching sales report:', error);
      }
    });
  }
  

  clearSerachFields(){
    this.filters.priceFrom = '';
    this.filters.priceTo = '';
    this.filters.paymentType = 'all';
    this.selectedVendor =null;

  }



  filteredAccounts: any[] = [];
  selectedPopUP: string = '';
  searchQuery: string = '';
  selectedCashAccount: Account | null = null;
  selectedVendor: any | null = null;


  selectAccount(account: Account) {
    if (this.selectedPopUP == 'cash') {
      this.selectedCashAccount = account;
  
    } else if (this.selectedPopUP == 'vendor') {
      this.selectedVendor = account;
    }
    

    this.closeModal('shiftModal');
  }


  openModal(modalId: string, type: string) {
    if (modalId == 'checkModel') { } else if (modalId == 'shiftModal') {

      this.selectedPopUP = type;
      if (type == 'cash') {
        // this.filteredAccounts = this.cashAccounts;
      } else if (type == 'vendor') {
        this.filteredAccounts = this.vendors;

      }
    }
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }


  onSearchChange() {


    if (this.selectedPopUP == 'cash') {

    } else if (this.selectedPopUP == 'vendor') {
      this.filteredAccounts = this.vendors.filter((account:any) =>
        account.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

  }

  closeModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }

}


interface Account {
  id: string;
  name: string;
  account:Account;
  currency: Currency
}



interface Currency {
  id: string;
  name: string;
}

interface SerialNumber {
  serialNumber: string;

}