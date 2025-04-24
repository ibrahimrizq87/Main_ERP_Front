
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
  selector: 'app-sales-reports',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterLinkActive,RouterModule,TranslateModule],
  templateUrl: './sales-reports.component.html',
  styleUrl: './sales-reports.component.css'
})
export class SalesReportsComponent  {

  delegates:any;
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
    this.loadDelegates();
    this.loadSuppliers();
  }



  loadSuppliers(): void {
    this._ClientService.getAllClients().subscribe({
      next: (response) => {
        if (response) {
          console.log("suppliers", response)
          this.vendors = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  loadDelegates(): void {
    this._AccountService.getAccountsByParent('623').subscribe({
      next: (response) => {
        if (response) {
          console.log("delegates", response)
          const delegates = response.data;
          delegates.forEach((account: { hasChildren: any; id: any; }) => {
            account.hasChildren = delegates.some((childAccount: { parent_id: any; }) => childAccount.parent_id === account.id);
          });
          this.delegates = delegates;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  onSearchTypeChange(){
    this.filters.startDate = '';
    this.filters.endDate = '';
    this.filters.month = '';
    this.filters.year = '';
    this.filters.day = '';
  }

  
  getSalesReport(): void {
    const clientId = this.selectedClient?.account?.id || 'all';
    const delegateId = this.selecteddelegateAccount?.id || 'all';
    const paymentType = this.filters.paymentType || 'all';
    const startDate = this.filters.startDate || '';
    const endDate = this.filters.endDate || '';
    const priceFrom = this.filters.priceFrom || '';
    const priceTo = this.filters.priceTo || '';
    const day = this.filters.day || '';
    const month = this.filters.month || '';
    const year = this.filters.year || '';
  
    this._ReportsService.getSaleReports(
      clientId,
      delegateId,
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
    // this.filters.clientId = 'all';
    // this.filters.delegateId = 'all';
    this.filters.paymentType = 'all';
    this.selectedClient =null;
    this.selecteddelegateAccount =null;

  }



  filteredAccounts: any[] = [];
  selectedPopUP: string = '';
  searchQuery: string = '';
  selectedCashAccount: Account | null = null;
  selecteddelegateAccount: Account | null = null;
  selectedClient: any | null = null;


  selectAccount(account: Account) {
    if (this.selectedPopUP == 'cash') {
      this.selectedCashAccount = account;
  
    } else if (this.selectedPopUP == 'delegate') {
      this.selecteddelegateAccount = account;

    } else if (this.selectedPopUP == 'vendor') {
      this.selectedClient = account;
    }
    

    this.closeModal('shiftModal');
  }


  openModal(modalId: string, type: string) {
    if (modalId == 'checkModel') { } else if (modalId == 'shiftModal') {

      this.selectedPopUP = type;
      if (type == 'cash') {
        // this.filteredAccounts = this.cashAccounts;
      } else if (type == 'delegate') {
        this.filteredAccounts = this.delegates;
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

    } else if (this.selectedPopUP == 'delegate') {
      this.filteredAccounts = this.delegates.filter((account:any) =>
        account.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
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