import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../shared/services/account.service';
import { CommonModule } from '@angular/common';
import { AccountnodeComponent } from '../accountnode/accountnode.component';
import { TranslateModule } from '@ngx-translate/core';

interface Account {
  id: string;
  name_ar: string;
  name_en?: string;
  parent_id?: string;
  child?: Account[];
  showChildren?: boolean;
}

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, AccountnodeComponent,TranslateModule],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {
  currencies: any[] = [];
  groups: any[] = [];
  parentAccounts: Account[] = [];
  hierarchicalAccounts: Account[] = [];
  type: string | null = '';
  constructor(private _AccountService: AccountService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    // this.getParams();
    this.loadGroups();
  }
  // getParams() {
  //   this.route.paramMap.subscribe(params => {
  //     this.type = params.get('type');
  //   });
  // }

  loadGroups(): void {

    this._AccountService.getData().subscribe({
      next: (response) => {
        if (response) {
          this.groups = response.group;
          this.parentAccounts = response.accounts;
          this.currencies = response.currencies;
          this.hierarchicalAccounts = this.buildAccountHierarchy(this.parentAccounts);
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  // Recursively build the hierarchy with toggle property initialized
  buildAccountHierarchy(accounts: Account[]): Account[] {
    return accounts.map(account => ({
      ...account,
      showChildren: false, // Initialize as collapsed
      child: account.child ? this.buildAccountHierarchy(account.child) : []
    }));
  }
}