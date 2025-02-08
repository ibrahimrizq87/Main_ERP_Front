import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../shared/services/account.service';
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

interface Creator {
  id: string;
  user_name: string;
}
interface Group {
  id: string;
  name: string;
}
interface AccountData {
  id: string;
  name_ar: string;
  name_en: string;
  creator: Creator;
  currency: string;
  group: Group;
  net_balance: string;
  net_cridet: string;
  net_debit: string;
  type: string;
  parent_id: string;
  last_transaction: string | null;
  last_update_creator: string | null;
}
@Component({
  selector: 'app-show-account',
  standalone: true,
  imports: [RouterLinkActive,RouterModule ,TranslateModule,CommonModule],
  templateUrl: './show-account.component.html',
  styleUrl: './show-account.component.css'
})
export class ShowAccountComponent implements OnInit{
  accountData: AccountData = {
    id: '',
    name_ar: '',
    name_en: '',
    creator:{
      id:'',
      user_name:''

    } ,
    currency: '',
    group: {
      id:'',
      name:''

    } ,
    net_balance: '',
    net_cridet: '',
    net_debit: '',
    type: '',
    parent_id: '',
    last_transaction: null,
    last_update_creator: null,
  };

  constructor(
    private _AccountService: AccountService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const accountId = this.route.snapshot.paramMap.get('id'); 
    if (accountId) {
      this.fetchAccountData(accountId);
    }
  }

  fetchAccountData(accountId: string): void {
    this._AccountService.showAccountById(accountId).subscribe({
      next: (response) => {
        if (response && response.data) {
          console.log(response)
          this.accountData = response.data;
        }
      },
      error: (err: HttpErrorResponse) => {
         console.log(err);
      }
    });
  }

}
