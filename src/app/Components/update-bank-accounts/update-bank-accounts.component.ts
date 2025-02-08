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
  additionalAccounts: { [key: string]: string } = {
    current: '',
    collectionFee: '',
    paymentFee: '',
    saving: ''
  };
  addtionalBankAccount:any[]=[]
  parentId: any;
  constructor(private _BankService:BankService ,private _Router: Router,private translate: TranslateService,private _BankAccountService:BankAccountService,private _CurrencyService:CurrencyService, private route: ActivatedRoute) {
   this.bankAccountForm = new FormGroup({
    account_no: new FormControl(null, [Validators.required,Validators.minLength(8),Validators.pattern(/^[0-9]+$/)]),
    bank_id: new FormControl(null, [Validators.required]),
    bank_branch_id: new FormControl(null, [Validators.required]),
    currency_id: new FormControl (null, Validators.required),
    name_ar:new FormControl (null, Validators.required),
    name_en:new FormControl (null),
    current:new FormControl(null),
    collectionFee:new FormControl(null),
    paymentFee:new FormControl(null),
    saving:new FormControl(null)
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
    this.loadBankBranches();
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
  loadBankBranches(): void {
    this._BankService.viewAllBankBranches().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.bankBranches = response.data; 
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
            account_no: bankAccountData.account_no,
            bank_id:bankAccountData.bank_branch.bank_id,
            bank_branch_id:bankAccountData.bank_branch.id,
            currency_id:bankAccountData.currency_id,
            name_ar:bankAccountData.name_ar,
            name_en:bankAccountData.name_en,

            current:`جارى/${bankAccountData.account_no}/${bankAccountData.name_ar}`,
            collectionFee:`برسم التحصيل/${bankAccountData.account_no}/${bankAccountData.name_ar}`,
            paymentFee:`برسم الدفع/${bankAccountData.account_no}/${bankAccountData.name_ar}`,
            saving:`توفير /${bankAccountData.account_no}/${bankAccountData.name_ar}`,
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.msgError = err.error.error;
      }
    });
  }
 
   handleForm(): void {
    if (this.bankAccountForm.valid) {
      this.isLoading = true;
  
      
      const formData = new FormData();
    
      formData.append('account_no', this.bankAccountForm.get('account_no')?.value);
      formData.append('bank_branch_id', this.bankAccountForm.get('bank_branch_id')?.value);
      formData.append('bank_id', this.bankAccountForm.get('bank_id')?.value);
      formData.append('currency_id', this.bankAccountForm.get('currency_id')?.value);
      formData.append('name_ar', this.bankAccountForm.get('name_ar')?.value);
      formData.append('name_en', this.bankAccountForm.get('name_en')?.value);
   
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
      
        formData.append('parent_id', accountType);
        formData.append('type', "child");
        if(accountType=="113"){
        formData.append('name_ar', this.bankAccountForm.get('current')?.value);
        }
        if(accountType=="118"){
          formData.append('name_ar', this.bankAccountForm.get('collectionFee')?.value);
        }
        if(accountType=="211"){
          formData.append('name_ar', this.bankAccountForm.get('paymentFee')?.value);
        }
        if(accountType=="119"){
          formData.append('name_ar', this.bankAccountForm.get('saving')?.value);
        }
        if(bankAccountId){
        formData.append('bank_acount_id', bankAccountId);
        }
        
        this._BankAccountService.addAddtionalBankAccount(formData).subscribe({
        
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
        this._BankAccountService.getBankAddAccountById(bankAccountId).subscribe({
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
      isAccountAdded(parentId: string): boolean {
        return this.addtionalBankAccount.some(account => account.parent_id === parseInt(parentId, 10));
      }
  onCancel(): void {
        this.bankAccountForm.reset();
       
        this._Router.navigate(['/dashboard/bankAccounts']); 
      }  
}

