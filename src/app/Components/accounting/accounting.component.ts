import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterLinkActive, Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../../shared/services/account.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-accounting',
  standalone: true,
  imports: [ RouterModule, RouterLinkActive, CommonModule, TranslateModule, FormsModule, NgxPaginationModule],
  templateUrl: './accounting.component.html',
  styleUrl: './accounting.component.css'
})
export class AccountingComponent implements OnInit {

  isAMainAccount = false;
  accounts: any[] = []; 
  type: string | null = '';
  searchTerm: string = '';
  
  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

  constructor(private _AccountService: AccountService, private router: Router, private route: ActivatedRoute, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const newType = params.get('type');
      if (this.type !== newType) {
        this.type = newType;
        this.currentPage = 1; // Reset to first page when type changes
        this.onParamChange();
      }
    });


    if(
       this.type == '611' ||
       this.type == '621' ||
       this.type == '622' ||
       this.type == '113' ||
       this.type == '118' ||
       this.type == '211' ||
       this.type == '119' ||
       this.type == '623' 
    ){
      this.isAMainAccount = false;
    } else {
      this.isAMainAccount = true;
    } 
  }

  onParamChange(): void {
    this.loadAccounts();

    if(
      this.type == '611' ||
      this.type == '621' ||
      this.type == '622' ||
      this.type == '113' ||
      this.type == '118' ||
      this.type == '211' ||
      this.type == '119' ||
      this.type == '623' 
   ){
     this.isAMainAccount = false;
   } else {
     this.isAMainAccount = true;
   } 
  }
 
  loadAccounts(): void {
    this._AccountService.getAccountsByParent(this.type || '').subscribe({
      next: (response) => {
        if (response) {
          const accounts = response.data;
          accounts.forEach((account: { hasChildren: any; id: any }) => {
            account.hasChildren = accounts.some((childAccount: { parent_id: any }) => childAccount.parent_id === account.id);
          });
          this.accounts = accounts;
          this.updatePagination();
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  addAccount(){
    this.router.navigate(['dashboard/addAccount/' + this.type])
  }

  deleteAccount(accountID: number): void {
    if (confirm('Are you sure you want to delete this Account?')) {
      this._AccountService.deleteAccount(accountID).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف الحساب بنجاح');
            this.router.navigate(['/dashboard/accounting/' + this.type]);
            this.loadAccounts();
          }
        },
        error: (err) => {
          this.toastr.error('حدث خطا اثناء حذف الحساب');
          console.error(err);
        }
      });
    }
  }

  filteredAccounts(): any[] {
    if (!this.searchTerm) {
      this.totalItems = this.accounts.length;
      return this.accounts;
    }
  
    const lowerTerm = this.searchTerm.toLowerCase();
    return this.accounts.filter((account) => {
      return (
        (account.name?.toLowerCase() || '').includes(lowerTerm) ||
        (account.start_balance?.toString() || '').includes(lowerTerm) ||
        (account.current_balance?.toString() || '').includes(lowerTerm) ||
        (account.net_debit?.toString() || '').includes(lowerTerm) ||
        (account.net_credit?.toString() || '').includes(lowerTerm) ||
        (account.financial_condition?.toLowerCase() || '').includes(lowerTerm)
      );
    });
  }

  updatePagination(): void {
    this.totalItems = this.filteredAccounts().length;
  }

  onSearchChange(): void {
    this.currentPage = 1; 
    this.updatePagination();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1; // Reset to first page when changing items per page
    this.updatePagination();
  }
}