import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../shared/services/account.service';
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

interface AccountData {
  id: string;
  name: string;
  current_balance: number;
  start_balance: number;
  net_credit: number;
  net_debit: number;
  type: 'main' | 'has_children' | 'child';
  financial_condition: 'debitor' | 'creditor' | 'Neutral';
  can_delete: boolean;
  created_at: string | null;
  updated_at: string | null;
  creator: {
    id: string;
    name: string;
    created_at: string;
    email: string | null;
    image: string | null;
    phone: string | null;
    role: string | null;
    updated_at: string;
  };
  currency: {
    id: number;
    abbreviation: string;
    name: string;
    name_langs: {
      en: string;
      ar: string;
    };
    derivative_name: string;
    derivative_name_langs: {
      en: string;
      ar: string;
    };
    is_default: boolean;
    value: string;
    created_at: string;
    updated_at: string;
  };
  parent: {
    id: number;
    name: string;
    current_balance: number;
    start_balance: number;
    net_credit: number;
    net_debit: number;
    type: 'main' | 'has_children' | 'child';
    financial_condition: 'debitor' | 'creditor' | 'Neutral';
    can_delete: boolean;
    created_at: string | null;
    updated_at: string | null;
  };
}


// interface AccountData {
//   id: string;
//   name_ar: string;
//   name_en: string;
//   creator: Creator;
//   currency: string;
//   group: Group;
//   net_balance: string;
//   net_cridet: string;
//   net_debit: string;
//   type: string;
//   parent_id: string;
//   last_transaction: string | null;
//   last_update_creator: string | null;
// }
@Component({
  selector: 'app-show-account',
  standalone: true,
  imports: [RouterLinkActive,RouterModule ,TranslateModule,CommonModule],
  templateUrl: './show-account.component.html',
  styleUrl: './show-account.component.css'
})
export class ShowAccountComponent implements OnInit{
  // accountData: AccountData = {
  //   id: '',
  //   name_ar: '',
  //   name_en: '',
  //   creator:{
  //     id:'',
  //     user_name:''

  //   } ,
  //   currency: '',
  //   group: {
  //     id:'',
  //     name:''

  //   } ,
  //   net_balance: '',
  //   net_cridet: '',
  //   net_debit: '',
  //   type: '',
  //   parent_id: '',
  //   last_transaction: null,
  //   last_update_creator: null,
  // };
   accountData: AccountData = {
    id: '',
    name: '',
    current_balance: 0,
    start_balance: 0,
    net_credit: 0,
    net_debit: 0,
    type: 'child',
    financial_condition: 'Neutral',
    can_delete: true,
    created_at: null,
    updated_at: null,
    creator: {
      id: '',
      name: '',
      created_at: '',
      email: null,
      image: null,
      phone: null,
      role: null,
      updated_at: ''
    },
    currency: {
      id: 0,
      abbreviation: '',
      name: '',
      name_langs: { en: '', ar: '' },
      derivative_name: '',
      derivative_name_langs: { en: '', ar: '' },
      is_default: false,
      value: '',
      created_at: '',
      updated_at: ''
    },
    parent: {
      id: 0,
      name: '',
      current_balance: 0,
      start_balance: 0,
      net_credit: 0,
      net_debit: 0,
      type: 'has_children',
      financial_condition: 'Neutral',
      can_delete: false,
      created_at: null,
      updated_at: null
    }
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
    this._AccountService.showAccountByIdAllInfo(accountId).subscribe({
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
