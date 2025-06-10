import { Component, OnInit } from '@angular/core';
import { BankService } from '../../shared/services/bank.service';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { BankAccountService } from '../../shared/services/bank_account.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PermissionService } from '../../shared/services/permission.service';

@Component({
  selector: 'app-bank-accounts',
  standalone: true,
  imports: [CommonModule,RouterLinkActive,RouterModule ,TranslateModule,FormsModule],
  templateUrl: './bank-accounts.component.html',
  styleUrl: './bank-accounts.component.css'
})
export class BankAccountsComponent implements OnInit {

  bankAccounts: any[] = []; 
  searchText: string = '';
  constructor(
    private _BankAccountService: BankAccountService, 
    private router: Router,
    private toastr:ToastrService,    
    public _PermissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.loadBankBranchs(); 
  }

  loadBankBranchs(): void {
    this._BankAccountService.getAllBankAccounts().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.bankAccounts = response.data; 
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  deleteBankAccount(bankAccountId: number): void {
    if (confirm('Are you sure you want to delete this Bank Account?')) {
      this._BankAccountService.deleteBankAccount(bankAccountId).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف الحساب البنكي بنجاح');
            this.router.navigate(['/dashboard/bankAccounts']);
            this.loadBankBranchs();
          }
        },
        error: (err) => {
          this.toastr.error('حدث خطا اثناء حذف الحساب البنكي');
          console.error(err);
          this.toastr.error('An error occurred while deleting the Bank Account.');
          // alert('An error occurred while deleting the Bank Account.');
        }
      });
    }
  }
  filterBankAccounts(): any[] {
    if (!this.searchText) {
      return this.bankAccounts;
    }

    return this.bankAccounts.filter(account => {
      return (
        account.account_no.toLowerCase().includes(this.searchText.toLowerCase()) ||
        account.name_ar.toLowerCase().includes(this.searchText.toLowerCase()) ||
        account.currency.toLowerCase().includes(this.searchText.toLowerCase()) ||
        account.bank_branch.main_bank.toLowerCase().includes(this.searchText.toLowerCase()) ||
        account.bank_branch.name.toLowerCase().includes(this.searchText.toLowerCase())
      );
    });
  }
}
