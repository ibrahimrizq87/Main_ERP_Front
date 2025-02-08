// import { CommonModule } from '@angular/common';
// import { Component, OnInit } from '@angular/core';
// import { AccountService } from '../../shared/services/account.service'
// import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
// import { FormBuilder, FormGroup, FormsModule, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
// import { BankService } from '../../shared/services/bank.service';
// import { CheckService } from '../../shared/services/check.service';
// import { HttpErrorResponse } from '@angular/common/http';


// @Component({
//   selector: 'app-check-management',
//   standalone: true,
//   imports: [CommonModule, RouterLinkActive, RouterModule, FormsModule, ReactiveFormsModule],
//   templateUrl: './check-management.component.html',
//   styleUrl: './check-management.component.css'
// })
// export class CheckManagementComponent {
//   checkForm: FormGroup;
//   isLoading: boolean = false;
//   banks: any;
//   selectedType: string = '';
//   currencies: any;
//   bankBranches: any;
//   bankAccounts: any;
//   pay_to_accounts: any;
//   source_accounts: any;
//   constructor(private fb: FormBuilder,
//     private _AccountService: AccountService,
//     private _BankService: BankService,
//     private _CheckServic: CheckService
//   ) {
//     this.checkForm = this.fb.group({
//       due_date: [null, Validators.required],
//       check_number: [null, [Validators.required, Validators.pattern(/^\d+$/)]],
//       amount: [null, [Validators.required, Validators.min(0.01)]],
//       notes: [null],
//       type: ['incoming', Validators.required],
//       payed_to_id: [null, Validators.required],
//       bank_id: [null, Validators.required],
//       source_account_id: [null, Validators.required],
//       currency_id: [null, Validators.required],
//       bank_branch_id: [null],
//       bank_account_id: [null],
//     });

//   }
//   destination_accounts: any;

//   source_accounts_parents: any;
//   handleIncoming() {


//     this.source_accounts_parents = [6];
//     this.destination_accounts = [112, 41];
//     this.getAccounts(this.source_accounts_parents, this.destination_accounts);

//   }
//   handleOutgoing() {


//     this.source_accounts_parents = [6];
//     this.destination_accounts = [112, 41];
//     this.getAccounts(this.source_accounts_parents, this.destination_accounts);

//   }
//   handleEndorsed() {


//     this.source_accounts_parents = [6];
//     this.destination_accounts = [112, 41];
//     this.getAccounts(this.source_accounts_parents, this.destination_accounts);
//   }

//   getAccounts(parent: number[], parent_company: number[]) {
//     this._AccountService.getParentForDocument(parent, parent_company).subscribe({
//       next: (response) => {
//         if (response) {
//           console.log("my response:", response)
//           this.currencies = response.currencies;
//           this.source_accounts = response.children;
//           this.pay_to_accounts = response.children_company;
//         }
//       },
//       error: (err) => {
//         console.error(err);
//       }
//     });
//   }
//   onBankChange(event: Event) {
//     const selectedValue = (event.target as HTMLSelectElement).value;
//     this.selectedType = selectedValue;
//     this._BankService.getBankBranchesByBank(selectedValue).subscribe({
//       next: (response) => {
//         if (response) {
//           this.bankBranches = response.data;
//         }
//       },
//       error: (err) => {
//         console.error(err);
//       }
//     });
//   }

//   onTypeChange(event: Event) {
//     const selectedValue = (event.target as HTMLSelectElement).value;
//     this.selectedType = selectedValue;


//     switch (this.selectedType) {
//       case 'incoming':
//         this.handleIncoming();
//         break;

//       case 'outgoing':
//         this.handleOutgoing();
//         break;

//       case 'endorsed':
//         this.handleEndorsed();
//         break;


//     }
//   }


//   ngOnInit(): void {
//     this.getBanks();
//     this.getBankAccounts();
//     this.handleIncoming();
//   }

//   getBankAccounts() {
//     this._BankService.viewAllBanks().subscribe({
//       next: (response) => {
//         if (response) {
//           console.log(response);
//           this.banks = response.data;
//         }
//       },
//       error: (err) => {
//         console.error(err);
//       }
//     });
//   }
//   getBanks() {
//     this._BankService.viewAllBanks().subscribe({
//       next: (response) => {
//         if (response) {
//           console.log(response);
//           this.banks = response.data;
//         }
//       },
//       error: (err) => {
//         console.error(err);
//       }
//     });
//   }

//   handleForm(): void {
//     if (this.checkForm.valid) {
//       this.isLoading = true;





//       const formData = new FormData();
//       formData.append('due_date', this.checkForm.get('due_date')?.value);
//       formData.append('notes', this.checkForm.get('notes')?.value || '');
//       formData.append('amount', this.checkForm.get('amount')?.value);
//       formData.append('check_number', this.checkForm.get('check_number')?.value);
//       formData.append('type', this.checkForm.get('type')?.value);
//       formData.append('payed_to_id', this.checkForm.get('payed_to_id')?.value);
//       formData.append('source_account_id', this.checkForm.get('source_account_id')?.value);
//       formData.append('bank_id', this.checkForm.get('bank_id')?.value);
//       formData.append('currency_id', this.checkForm.get('currency_id')?.value);
//       formData.append('bank_branch_id', this.checkForm.get('bank_branch_id')?.value || '');
//       formData.append('bank_account_id', this.checkForm.get('bank_account_id')?.value || '');
//       this._CheckServic.addCheck(formData).subscribe({
//         next: (response) => {
//           this.isLoading = false;
//           if (response) {

//           }
//         },
//         error: (err: HttpErrorResponse) => {
//           this.isLoading = false;
//           console.log('error happend', err);

//         }
//       });

//     } else {
//       console.log('Form is invalid');
//     }
//   }
// }


import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../shared/services/account.service'
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { BankService } from '../../shared/services/bank.service';
import { CheckService } from '../../shared/services/check.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';



@Component({
  selector: 'app-check-management',
  standalone: true,
  imports: [CommonModule, RouterLinkActive, RouterModule, FormsModule, ReactiveFormsModule,TranslateModule],
  templateUrl: './check-management.component.html',
  styleUrl: './check-management.component.css'
})
export class CheckManagementComponent {

  checks: any;
  constructor(
    private _CheckServic: CheckService
  ) { }


  ngOnInit(): void {
    this.getChecks();
  }

  getChecks() {
    this._CheckServic.getAllChecks().subscribe({
      next: (response) => {
        if (response) {
          this.checks = response.data;
          console.log(response);
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}

