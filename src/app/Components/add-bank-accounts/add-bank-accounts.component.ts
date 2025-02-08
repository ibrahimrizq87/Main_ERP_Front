import { Component, OnInit } from '@angular/core';
import { BankService } from '../../shared/services/bank.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BankAccountService } from '../../shared/services/bank_account.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CurrencyService } from '../../shared/services/currency.service';
import { Modal } from 'bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-bank-accounts',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormsModule ,TranslateModule],
  templateUrl: './add-bank-accounts.component.html',
  styleUrl: './add-bank-accounts.component.css'
})
export class AddBankAccountsComponent implements OnInit {
  msgError: string = '';
  isLoading: boolean = false;
  selectedType: string = '';
  bankBranches: any[] = []; 
  banks: any[] = []; 
  currencies:any[]=[];
  selectedCurrency: any;
  selectedBank: any ;
  selectedBankBranch: any ;
  constructor(private _BankService:BankService ,private _Router: Router,private translate: TranslateService,private _BankAccountService:BankAccountService,private _CurrencyService:CurrencyService) {
  
  }
  ngOnInit(): void {
   
    // this.loadBankBranches();
    this.getBanks();
    this.loadCurrencies()

  }

  bankAccountForm: FormGroup = new FormGroup({
    account_no: new FormControl(null, [Validators.required,Validators.minLength(8),Validators.pattern(/^[0-9]+$/)]),
    bank_id: new FormControl(null, [Validators.required]),
    bank_branch_id: new FormControl(null, [Validators.required]),
    currency_id: new FormControl (null, Validators.required),
    name_ar:new FormControl (null, Validators.required),
    name_en:new FormControl (null)
  });

  getBanks() {
    this._BankService.viewAllBanks().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.banks = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  openModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }
  
  closeModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }
 
  selectCurrency(currency: any, modalId: string) {
    this.selectedCurrency = currency;
    this.bankAccountForm.get('currency_id')?.setValue(currency.id);
    // this.prices.at(this.prices.length - 1).patchValue({ currency_id: currency.id });
    this.closeModal(modalId);
  }

  // loadBankBranches(): void {
  //   this._BankService.viewAllBankBranches().subscribe({
  //     next: (response) => {
  //       if (response) {
  //         console.log(response);
  //         this.bankBranches = response.data; 
  //       }
  //     },
  //     error: (err) => {
  //       console.error(err);
  //     }
  //   });
  // }
  loadCurrencies(): void {
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
  // onBankChange(event: Event) {
  //   const selectedValue = (event.target as HTMLSelectElement).value;
  //   this.selectedType = selectedValue;
  //   this._BankService.getBankBranchesByBank(selectedValue).subscribe({
  //     next: (response) => {
  //       if (response) {
  //         this.bankBranches = response.data;
  //       }
  //     },
  //     error: (err) => {
  //       console.error(err);
  //     }
  //   });
  // }
  selectBank(bank: any, modalId: string): void {
    this.selectedBank = bank; // Set the selected bank
    this.bankAccountForm.get('bank_id')?.setValue(bank.id); // Update the form control
    this.closeModal(modalId); // Close the modal

    // Fetch bank branches for the selected bank
    this._BankService.getBankBranchesByBank(bank.id).subscribe({
      next: (response) => {
        if (response) {
          this.bankBranches = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  selectBankBranch(bankBranch: any, modalId: string): void {
    this.selectedBankBranch = bankBranch; // Set the selected bank branch
    this.bankAccountForm.get('bank_branch_id')?.setValue(bankBranch.id); // Update the form control
    this.closeModal(modalId); // Close the modal
  }

  handleForm() {
   
    if (this.bankAccountForm.valid) {
      this.isLoading = true;

      const formData = new FormData();
    
      formData.append('account_no', this.bankAccountForm.get('account_no')?.value);
      formData.append('bank_branch_id', this.bankAccountForm.get('bank_branch_id')?.value);
      formData.append('bank_id', this.bankAccountForm.get('bank_id')?.value);
      formData.append('currency_id', this.bankAccountForm.get('currency_id')?.value);
      formData.append('name_ar', this.bankAccountForm.get('name_ar')?.value);
      formData.append('name_en', this.bankAccountForm.get('name_en')?.value);
      this._BankAccountService.addBankAccounts(formData).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.isLoading = false;
            this._Router.navigate(['/dashboard/bankAccounts']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
           this.msgError = err.error.error;
          console.log(err);
        }
      });
    }
  }
}

