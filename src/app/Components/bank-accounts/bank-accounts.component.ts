import { Component, OnInit } from '@angular/core';
import { BankService } from '../../shared/services/bank.service';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { BankAccountService } from '../../shared/services/bank_account.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

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
  constructor(private _BankAccountService: BankAccountService, private router: Router) {}

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
            this.router.navigate(['/dashboard/bankAccounts']);
            this.loadBankBranchs();
          }
        },
        error: (err) => {
          console.error(err);
          alert('An error occurred while deleting the Bank Account.');
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
