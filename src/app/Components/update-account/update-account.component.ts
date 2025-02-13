import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { AccountService } from '../../shared/services/account.service';
import { HttpErrorResponse } from '@angular/common/http';
import { GroupService } from '../../shared/services/group.service';
import { TranslateModule } from '@ngx-translate/core';
import { CurrencyService } from '../../shared/services/currency.service';

interface Account {
  id: string;
  name_ar: string;
  name_en?: string;
  parent_id?: string;
  child?: Account[];
}
@Component({
  selector: 'app-update-account',
  standalone: true,
  imports: [CommonModule,RouterLinkActive ,RouterModule,TranslateModule ,FormsModule ,ReactiveFormsModule],
  templateUrl: './update-account.component.html',
  styleUrl: './update-account.component.css'
})
export class UpdateAccountComponent implements OnInit{
  submitted: boolean = false;

  msgError: string = '';
  msgSuccess:string ='';
  isLoading: boolean = false;
  isBranchSelected = false;
  currencies: any[] = [];
  groups: any[] = [];
  selectedGroup: string = '';
  selectedCurrency: string = '';
  parentAccounts: Account[] = []; 
  hierarchicalAccounts: any[] = [];
  accountForm: FormGroup;
  parent_id :string ='';
  
  constructor(    private _CurrencyService: CurrencyService,
    private _AccountService: AccountService, private router: Router, private fb: FormBuilder, private route: ActivatedRoute,private _GroupService:GroupService) {
    this.accountForm = this.fb.group({
      name_ar: this.fb.control(null, [Validators.required]),
      name_en: this.fb.control(null),
      net_balance: this.fb.control(null, [Validators.required, Validators.min(0)]),
      net_credit: this.fb.control(null, [Validators.required, Validators.min(0)]),
      net_debit: this.fb.control(null, [Validators.required, Validators.min(0)]),

      can_delete: [false] ,

      
      currency_id: this.fb.control(this.selectedCurrency),
      
    });
  }
    ngOnInit(): void {
      this.loadCurrency()
    const accountId = this.route.snapshot.paramMap.get('id'); 
    if (accountId) {
      this.fetchAccountData(accountId);
    }
  }

  // onTypeChange(event: any) {
  //   const selectedType = event.target.value;
  //   this.isBranchSelected = selectedType === 'branch';

  //   if (this.isBranchSelected) {
  //     this.accountForm.get('parent_id')?.setValidators([Validators.required]);
  //   } else {
  //     this.accountForm.get('parent_id')?.clearValidators();
  //     this.accountForm.get('parent_id')?.setValue(null);
  //   }
  //   this.accountForm.get('parent_id')?.updateValueAndValidity();
  // }
  loadCurrency(): void {
    this._CurrencyService.viewAllCurrency().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.currencies = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
    fetchAccountData(accountId: string): void {
    this._AccountService.showAccountByIdAllInfo(accountId).subscribe({
      next: (response) => {
        if (response) {
          const accountData = response.data ; 
          console.log(accountData)
          this.parent_id = accountData.parent.id;
          this.accountForm.patchValue({
            name_ar:accountData.name_lang.ar,
            name_en:accountData.name_lang.en,
            net_balance:accountData.start_balance,
            currency_id:accountData.currency.id,
            net_credit:accountData.net_credit,
            net_debit:accountData.net_debit,
            can_delete:accountData.can_delete,

            

          });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.msgError = err.error.error;
        alert('can not fetch account data');
      }
    });
  }
  handleForm() {
    this.submitted =true;
    if (this.accountForm.valid) {
      this.isLoading = true;
      const formData = new FormData();
      formData.append('name[ar]', this.accountForm.get('name_ar')?.value);
      formData.append('name[en]', this.accountForm.get('name_en')?.value || '');
      formData.append('start_balance', this.accountForm.get('net_balance')?.value);
      formData.append('currency_id', this.accountForm.get('currency_id')?.value || '');
      // console.log(formData);
      // return;
      if(this.accountForm.get('can_delete')?.value){
        formData.append('can_delete', '1');

      }else{
        formData.append('can_delete', '0');

      }

      // formData.append('group_id', this.accountForm.get('groups')?.value || '');
      // formData.append('type', this.accountForm.get('type')?.value);
     
      const accountID = this.route.snapshot.paramMap.get('id');
      
      if (accountID) {
       
      this._AccountService.updateAccount(accountID,formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response) {
            this.router.navigate(['/dashboard/accounting/'+this.parent_id]);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.msgError = err.error.error;
        }
      });
    }
    }
  }
  onCancel(): void {
        this.accountForm.reset();
       
        this.router.navigate(['/dashboard/accounting/'+this.parent_id]); 
      }  
}
