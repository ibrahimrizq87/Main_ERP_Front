import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BankService } from '../../shared/services/bank.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BankAccountService } from '../../shared/services/bank_account.service';
import { CurrencyService } from '../../shared/services/currency.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Modal } from 'bootstrap';
import { AccountService } from '../../shared/services/account.service';

@Component({
  selector: 'app-update-bank-accounts',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,CommonModule,TranslateModule],
  templateUrl: './update-bank-accounts.component.html',
  styleUrl: './update-bank-accounts.component.css'
})
export class UpdateBankAccountsComponent implements OnInit {
  msgError: string = '';
  isLoading: boolean = false;
  
  selectedType: string = '';
  bankBranches: any[] = []; 
  banks: any[] = []; 
  currencies:any[]=[];
  bankAccountForm: FormGroup ;
  additionalAccounts: { [key: string]: string  } = {
    current: '',
    collectionFee: '',
    paymentFee: '',
    saving: ''
  };
  addtionalBankAccount:any[]=[]
  parentId: any;
  constructor(private _BankService:BankService ,
    private _AccountService:AccountService,
    private _Router: Router,private translate: TranslateService,private _BankAccountService:BankAccountService,private _CurrencyService:CurrencyService, private route: ActivatedRoute) {
   this.bankAccountForm = new FormGroup({
    account_no: new FormControl(null, [Validators.required,Validators.minLength(8),Validators.pattern(/^[0-9]+$/)]),
    bank_id: new FormControl(null, [Validators.required]),
    bank_branch_id: new FormControl(null, [Validators.required]),
    currency_id: new FormControl (null, Validators.required),
    name_ar:new FormControl (null, Validators.required),
    name_en:new FormControl (null),
    current_en:new FormControl(null),   
     current_ar:new FormControl(null),

     collectionFee_ar:new FormControl(null),
     collectionFee_en:new FormControl(null),

    paymentFee_ar:new FormControl(null),
    paymentFee_en:new FormControl(null),

    saving_en:new FormControl(null),
    saving_ar:new FormControl(null)

    });
  
  }
  // @ViewChild('currentAccountInput') currentAccountInput: ElementRef |any;

  // ngAfterViewInit() {
  //   // Access the 'parent_id' attribute
  //   const parentId = this.currentAccountInput.nativeElement.getAttribute('parent_id');
  //   this.parentId = parentId;
  // }

 
    ngOnInit(): void {
    const bankAccountId = this.route.snapshot.paramMap.get('id'); 
    if (bankAccountId) {
      this.fetchBankAccount(bankAccountId);
      this.fetchAccountAddData(bankAccountId)
    }
    // this.loadBankBranches();
    this.getBanks();
    this.loadCurrencies();
    
  }
 
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
  onBankChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedType = selectedValue;
    this._BankService.getBankBranchesByBank(selectedValue).subscribe({
      next: (response) => {
        if (response) {
          this.bankBranches = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  fetchBankAccount(bankAccountId: string): void {
    this._BankAccountService.getBankAccountById(bankAccountId).subscribe({
      next: (response) => {
        if (response) {
          const bankAccountData = response.data ; 
          console.log(bankAccountData)
          this.bankAccountForm.patchValue({
            account_no: bankAccountData.account_number,
            bank_id:bankAccountData.bank_branch.bank.id,
            bank_branch_id:bankAccountData.bank_branch.id,
            currency_id:bankAccountData.currency.id,
            name_ar:bankAccountData.name_langs.ar,
            name_en:bankAccountData.name_langs.en,


            current_ar: `جارى/${bankAccountData.account_number}/${bankAccountData.name_langs.ar}`,
            current_en: `${bankAccountData.account_number}/${bankAccountData.name_langs.en}/Current`,
            
            collectionFee_ar: `برسم التحصيل/${bankAccountData.account_number}/${bankAccountData.name_langs.ar}`,
            collectionFee_en: `${bankAccountData.account_number}/${bankAccountData.name_langs.en}/Collection Fee`,
            
            paymentFee_ar: `برسم الدفع/${bankAccountData.account_number}/${bankAccountData.name_langs.ar}`,
            paymentFee_en: `${bankAccountData.account_number}/${bankAccountData.name_langs.en}/Payment Fee`,
            
            saving_ar: `توفير/${bankAccountData.account_number}/${bankAccountData.name_langs.ar}`,
            saving_en: `${bankAccountData.account_number}/${bankAccountData.name_langs.en}/Saving`,
            

          });


          this.selectedCurrency =  bankAccountData.currency;
          this.selectedBankBranch = bankAccountData.bank_branch;
          this.selectedBank = bankAccountData.bank_branch.bank;
          this.loadBankBranches(bankAccountData.bank_branch.bank);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.msgError = err.error.error;
      }
    });
  }
 
  loadBankBranches(bank:any){
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

   handleForm(): void {
    if (this.bankAccountForm.valid) {
      this.isLoading = true;
  
      
      const formData = new FormData();
    
      formData.append('account_number', this.bankAccountForm.get('account_no')?.value);
      formData.append('bank_branch_id', this.bankAccountForm.get('bank_branch_id')?.value);
      // formData.append('bank_id', this.bankAccountForm.get('bank_id')?.value);
      formData.append('currency_id', this.bankAccountForm.get('currency_id')?.value);
      formData.append('name[ar]', this.bankAccountForm.get('name_ar')?.value);
      formData.append('name[en]', this.bankAccountForm.get('name_en')?.value);
   
      const bankAccountId = this.route.snapshot.paramMap.get('id');
      if(bankAccountId){
      this._BankAccountService.updateBankAccount(bankAccountId,formData).subscribe({
      
        next: (response) => {
          // console.log(response);
          if (response) {
            console.log(response);
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
    }}}
    addAccount(accountType: string): void {
      console.log(`Adding account type: ${accountType} with value: ${this.additionalAccounts[accountType]}`);
      
     
      if (this.bankAccountForm.valid) {
        
    
        const bankAccountId = this.route.snapshot.paramMap.get('id');
        const formData = new FormData();
      

        if (accountType == "113") {
          formData.append('name[ar]', this.bankAccountForm.get('current_ar')?.value);
          formData.append('name[en]', this.bankAccountForm.get('current_en')?.value);
      }
      
      if (accountType == "118") {
          formData.append('name[ar]', this.bankAccountForm.get('collectionFee_ar')?.value);
          formData.append('name[en]', this.bankAccountForm.get('collectionFee_en')?.value);
      }
      
      if (accountType == "211") {
          formData.append('name[ar]', this.bankAccountForm.get('paymentFee_ar')?.value);
          formData.append('name[en]', this.bankAccountForm.get('paymentFee_en')?.value);
      }
      
      if (accountType == "119") {
          formData.append('name[ar]', this.bankAccountForm.get('saving_ar')?.value);
          formData.append('name[en]', this.bankAccountForm.get('saving_en')?.value);
      }
      formData.append('type', accountType);

        if(bankAccountId){
        formData.append('bank_account_id', bankAccountId);
        }
        
        this._AccountService.addBankAccountAccount(formData).subscribe({
        
          next: (response) => {
            console.log(response);
            if (response) {
              console.log("add",response)
              const bankAccountId = this.route.snapshot.paramMap.get('id'); 
              if (bankAccountId) {
                // this.fetchBankAccount(bankAccountId);
                this.fetchAccountAddData(bankAccountId)
              }
            }
          },
          error: (err: HttpErrorResponse) => {
           
             this.msgError = err.error.error;
            console.log(err);
          }
        });
      }}

      fetchAccountAddData(bankAccountId: string): void {
        console.log(bankAccountId)
        this._AccountService.getBankAccountAccounts(bankAccountId).subscribe({
          next: (response) => {
            if (response && response.data) {
              console.log(response.data)
              this.addtionalBankAccount=response.data
            }
          },
          error: (err: HttpErrorResponse) => {
             console.log(err);
          }
        });
      }
      isAccountAdded(type: string): boolean {
        return this.addtionalBankAccount.some(account => account.type == type);
      }
  onCancel(): void {
        this.bankAccountForm.reset();
       
        this._Router.navigate(['/dashboard/bankAccounts']); 
      }  

      selectedCurrency: any;
      selectedBank: any ;
      selectedBankBranch: any ;
      openModal(modalId: string) {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
          const modal = new Modal(modalElement);
          modal.show();
        }
      }
      selectCurrency(currency: any, modalId: string) {
        this.selectedCurrency = currency;
        this.bankAccountForm.get('currency_id')?.setValue(currency.id);
        // this.prices.at(this.prices.length - 1).patchValue({ currency_id: currency.id });
        this.closeModal(modalId);
      }
      selectBank(bank: any, modalId: string): void {
        this.selectedBank = bank; // Set the selected bank
        this.bankAccountForm.get('bank_id')?.setValue(bank.id); // Update the form control
        this.closeModal(modalId); // Close the modal    
      }


        
       closeModal(modalId: string) {
          const modalElement = document.getElementById(modalId);
          if (modalElement) {
            const modal = Modal.getInstance(modalElement);
            modal?.hide();
          }
        }

        selectBankBranch(bankBranch: any, modalId: string): void {
          this.selectedBankBranch = bankBranch; // Set the selected bank branch
          this.bankAccountForm.get('bank_branch_id')?.setValue(bankBranch.id); // Update the form control
          this.closeModal(modalId); // Close the modal
        }
       
}

