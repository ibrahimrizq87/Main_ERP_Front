import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { AccountService } from '../../shared/services/account.service';
import { HttpErrorResponse } from '@angular/common/http';
import { GroupService } from '../../shared/services/group.service';
import { TranslateModule } from '@ngx-translate/core';

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
  
  constructor(private _AccountService: AccountService, private router: Router, private fb: FormBuilder, private route: ActivatedRoute,private _GroupService:GroupService) {
    this.accountForm = this.fb.group({
      name_ar: this.fb.control(null, [Validators.required]),
      name_en: this.fb.control(null),
      net_balance: this.fb.control(null, [Validators.required, Validators.min(0)]),
      // type: this.fb.control(null, [Validators.required]),
      // groups: this.fb.control(this.selectedGroup),
      currency_id: this.fb.control(this.selectedCurrency),
      // parent_id: [null]
    });
  }
    ngOnInit(): void {
      this.loadGroups();
      this.loadGroupsType();
    const accountId = this.route.snapshot.paramMap.get('id'); 
    if (accountId) {
      this.fetchAccountData(accountId);
    }
  }
  loadGroups(): void {
    this._AccountService.getData().subscribe({
      next: (response) => {
        if (response) {
          console.log(response)
          // this.groups = response.group;
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
  loadGroupsType(): void {
    this._GroupService.groupsType('account').subscribe({
      next: (response: any) => {  // Explicit type for response
        console.log(response);
        this.groups = response.data;
      },
      error: (err: any) => {  // Explicit type for error
        console.error(err);
      }
    });
  }
  buildAccountHierarchy(accounts: Account[]): any[] {
    return accounts.map(account => ({
      ...account,
      children: account.child ? this.buildAccountHierarchy(account.child) : []
    }));
  }
  onTypeChange(event: any) {
    const selectedType = event.target.value;
    this.isBranchSelected = selectedType === 'branch';

    if (this.isBranchSelected) {
      this.accountForm.get('parent_id')?.setValidators([Validators.required]);
    } else {
      this.accountForm.get('parent_id')?.clearValidators();
      this.accountForm.get('parent_id')?.setValue(null);
    }
    this.accountForm.get('parent_id')?.updateValueAndValidity();
  }

    fetchAccountData(accountId: string): void {
    this._AccountService.showAccountById(accountId).subscribe({
      next: (response) => {
        if (response) {
          const accountData = response.data ; 
          console.log(accountData)
          this.parent_id = accountData.parent_id;
          this.accountForm.patchValue({
            name_ar:accountData.name_ar,
            name_en:accountData.name_en,
            net_balance:accountData.net_balance,
            type:accountData.type,
            groups:accountData.group,
            currency_id:accountData.currency,

          });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.msgError = err.error.error;
      }
    });
  }
  handleForm() {
    if (this.accountForm.valid) {
      this.isLoading = true;
      const formData = new FormData();
      formData.append('name_ar', this.accountForm.get('name_ar')?.value);
      formData.append('name_en', this.accountForm.get('name_en')?.value || '');
      formData.append('net_balance', this.accountForm.get('net_balance')?.value);
      formData.append('currency_id', this.accountForm.get('currency_id')?.value || '');
      // formData.append('group_id', this.accountForm.get('groups')?.value || '');
      // formData.append('type', this.accountForm.get('type')?.value);
      if (this.isBranchSelected) {
        formData.append('parent_id', this.accountForm.get('parent_id')?.value);
      }
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
