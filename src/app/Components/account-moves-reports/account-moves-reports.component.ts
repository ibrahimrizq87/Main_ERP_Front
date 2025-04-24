import { Component } from '@angular/core';
import { ProductsService } from '../../shared/services/products.service';
import { FormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';

import { RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AccountService } from '../../shared/services/account.service';
import { ClientService } from '../../shared/services/client.service';
import { ReportsService } from '../../shared/services/reports.service';
import { StoreService } from '../../shared/services/store.service';
import { ProductBranchesService } from '../../shared/services/product_branches.service';

@Component({
  selector: 'app-account-moves-reports',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterLinkActive,RouterModule,TranslateModule],
  templateUrl: './account-moves-reports.component.html',
  styleUrl: './account-moves-reports.component.css'
})
export class AccountMovesReportsComponent {



  MoveType = 'all';
  EventType ='all';
  filters = {
    startDate: '',
    endDate: '',
    day: '',
    month: '',
    year: '',
    amountTo:'',
    amountFrom:'',
  };


  searchDateType = 'from_to_date'; 
  accountMoves:any;
  totalCount = 0;
  totalMoves = 0;
  totalAmount = 0;
  productSearchQuery = '';
  branches:any;
  filteredProducts :any;
  stores: any[] = [];
  selectedAccount:any;
  accounts:any;
  constructor(
    private _ReportsService:ReportsService,
    private _AccountService: AccountService
  ) {

  }
  StoreId = 'all';
  ngOnInit(): void {
  this.loadAccounts();
  this.getAccountMovesReport();
  }


  selectAccount(account:any){
    this.selectedAccount = account;
    this.closeModal();
  }
  loadAccounts(): void {
    this._AccountService.getAllChildren().subscribe({
      next: (response) => {
        if (response) {
          console.log(response)
          this.accounts = response.data; 
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }





  getAccountMovesReport(): void {
    const moveType = this.MoveType;
    const eventType = this.EventType;
    const accountId = this.selectedAccount?.id ;
    const amountFrom =this.filters.amountFrom || '';
    const amountTo =this.filters.amountTo || '';
    const startDate = this.filters.startDate || '';
    const endDate = this.filters.endDate || '';
    const day = this.filters.day || '';
    const month = this.filters.month || '';
    const year = this.filters.year || '';

    this._ReportsService.getAccountMovesReports(
      moveType,
      eventType,
      accountId,
      amountFrom,
      amountTo,
      startDate,
      endDate,
      day,
      month,
      year
    ).subscribe({
      next: (response) => {
        console.log(response);
        this.accountMoves = response.moves || [];
        this.totalCount = response.total_count || 0;
        this.totalAmount = response.total || 0;
      },
      error: (error) => {
        console.error('Error fetching sales report:', error);
      }
    });
  }
  
  clearSearchFields(): void {
    this.selectedAccount = null;
    this.EventType = 'all';
    this.MoveType = 'all';

    this.filters.amountTo = '';
    this.filters.amountFrom = '';

  }

  onSearchTypeChange(): void {
    this.filters.startDate = '';
    this.filters.endDate = '';
    this.filters.day = '';
    this.filters.month = '';
    this.filters.year = '';

  }

  openModal() {
    const modalElement = document.getElementById('shiftModal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }



  closeModal(){
    const modalElement = document.getElementById('shiftModal');
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }
  searchQuery:string ='';
  onSearchChange(){}

}