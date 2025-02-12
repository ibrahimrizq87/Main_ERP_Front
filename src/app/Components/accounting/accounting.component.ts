import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, RouterLinkActive, Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../../shared/services/account.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-accounting',
  standalone: true,
  imports: [ RouterModule, RouterLinkActive,CommonModule,TranslateModule,FormsModule],
  templateUrl: './accounting.component.html',
  styleUrl: './accounting.component.css'
})
export class AccountingComponent implements OnInit {


  accounts: any[] = []; 
  type: string | null = '';
  searchTerm: string = '';
  constructor(private _AccountService: AccountService, private router: Router , private route: ActivatedRoute) {}

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      const newType = params.get('type');
      if (this.type !== newType) {
        this.type = newType;
        this.onParamChange();
      }
    });

  }



  onParamChange(): void {
    this.loadAccounts();
  }
 
  loadAccounts(): void {
   
      this._AccountService.getAccountsByParent(this.type || '').subscribe({
        next: (response) => {
          if (response) {
            // console.log('hererererer' , response);

            const accounts = response.data;
            accounts.forEach((account: { hasChildren: any; id: any }) => {
              account.hasChildren = accounts.some((childAccount: { parent_id: any }) => childAccount.parent_id === account.id);
            });
            this.accounts = accounts;
          }
        },
        error: (err) => {
          console.error(err);
        }
      });
    
  }
  addAccount(){
    this.router.navigate(['dashboard/addAccount/'+this.type])
  }
  deleteAccount(accountID: number): void {
    if (confirm('Are you sure you want to delete this Account?')) {
      this._AccountService.deleteAccount(accountID).subscribe({
        next: (response) => {
          if (response) {
            this.router.navigate(['/dashboard/accounting/'+this.type]);
            this.loadAccounts();
          }
        },
        error: (err) => {
          console.error(err);
          alert('An error occurred while deleting the Account.');
        }
      });
    }
  }
  filteredAccounts(): any[] {
    const lowerTerm = this.searchTerm.toLowerCase();
    return this.accounts.filter((account) =>
      account.name_ar.toLowerCase().includes(lowerTerm) ||
      account.net_balance.toString().includes(lowerTerm) ||
      (account.group?.name || '').toLowerCase().includes(lowerTerm) ||
      account.type.toLowerCase().includes(lowerTerm)
    );
  }
}

