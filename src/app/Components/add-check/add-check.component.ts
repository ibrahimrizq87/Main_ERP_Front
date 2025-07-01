
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AccountService } from '../../shared/services/account.service'
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BankService } from '../../shared/services/bank.service';
import { CheckService } from '../../shared/services/check.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { BankAccountService } from '../../shared/services/bank_account.service';
import { Modal } from 'bootstrap';
import { CurrencyService } from '../../shared/services/currency.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-check-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule,TranslateModule ],
  templateUrl: './add-check.component.html',
  styleUrl: './add-check.component.css'
})
export class AddCheckComponent {


  checkForm: FormGroup;
  isLoading: boolean = false;
  banks: any;
  selectedType: string = '';
  currencies: any;
  bankBranches: any;
  bankAccounts: any;
  forignCurrencyName ='';
  amountInLocalCurrency = 0;
  pay_to_accounts: Account [] =[];
  source_accounts: Account [] =[];
  selectedFrontImage: File | null = null;
  selectedBackImage: File | null = null;
  isSubmited: boolean = false;
  needCurrecyPrice: boolean = false;
  constructor(private fb: FormBuilder,
    private _AccountService: AccountService,
    private _BankService: BankService,
    private _CurrencyService: CurrencyService,
    private _CheckServic: CheckService,
    private _BankAccountService:BankAccountService, 
    private _Router: Router,
    private toastr: ToastrService,
  ) {
    this.checkForm = this.fb.group({
      due_date: [null, Validators.required],
      check_number: [null, [Validators.required, Validators.pattern(/^\d+$/)]],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      notes: [null],
      type: ['incoming', Validators.required],
      payed_to_id: [null, Validators.required],
      bank_id: [null, Validators.required],
      source_account_id: [null, Validators.required],
      front_image: [null, Validators.required],
      back_image: [null, Validators.required],
      currency_value:[null],
      bank_branch_id: [null],
      bank_account_id: [null],
    });

  }



  currency: any ;
  loadDefaultCurrency() {
    this._CurrencyService.getDefultCurrency().subscribe({
      next: (response) => {
        if (response) {
          this.currency = response.data;
        }
      },
      error: (err) => {
        if (err.status == 404) {
          this.toastr.error('يجب اختيار عملة اساسية قبل القيام بأى عملية شراء او بيع');
          this._Router.navigate(['/dashboard/currency']);

        }
        console.log(err);
      }
    });
  }



  caculateAmountInLocalCurrency() {
    const amount =this.checkForm.get('amount')?.value|| 0;
    const currency_value = this.checkForm.get('currency_value')?.value || 0;
    this.amountInLocalCurrency = amount * currency_value;
  }



  destination_accounts: any;
  source_accounts_parents: any;
  handleIncoming() {


    this.source_accounts_parents = [112, 41 , 611 , 621 , 622 , 623 ,624 , 118 , 113 , 211];
    this.destination_accounts = [112, 41 , 611 , 621 , 622 , 623 ,624 , 118 , 113 , 211];
    this.getAccounts(this.source_accounts_parents, 'source');
    this.getAccounts(this.destination_accounts , 'payTo');
    

  }
  handleOutgoing() {


    this.source_accounts_parents = [112, 41 , 611 , 621 , 622 , 623 ,624 , 118 , 113 , 211];
    this.destination_accounts = [112, 41 , 611 , 621 , 622 , 623 ,624 , 118 , 113 , 211];
    this.getAccounts(this.source_accounts_parents, 'source');
    this.getAccounts(this.destination_accounts , 'payTo');

  }
  handleEndorsed() {


    this.source_accounts_parents = [112, 41 , 611 , 621 , 622 , 623 ,624 , 118 , 113 , 211];
    this.destination_accounts = [112, 41 , 611 , 621 , 622 , 623 ,624 , 118 , 113 , 211];
    this.getAccounts(this.source_accounts_parents, 'source');
    this.getAccounts(this.destination_accounts , 'payTo');

  }

  onFileSelected(event: any ,type:string): void {
    const file = event.target.files[0];
    if (file) {
      if(type == 'front'){

        this.selectedFrontImage = file;
        this.checkForm.patchValue({ front_image: file });
      }else{
        this.selectedBackImage = file;
        this.checkForm.patchValue({ back_image: file });
      }
    }
  }

  getAccounts(parent: number[], type: string) {
    this._AccountService.getAccountsByParents(parent, this.searchQuery).subscribe({
      next: (response) => {
        if (response) {
          // console.log("my response:", response)
          // this.currencies = response.currencies;

          if(type == 'payTo'){
          this.pay_to_accounts = response.accounts;
          }else{
          this.source_accounts = response.accounts;
          }
          this.updateAccount();



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

  onTypeChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedType = selectedValue;


    switch (this.selectedType) {
      case 'incoming':
        this.handleIncoming();
        break;

      case 'outgoing':
        this.handleOutgoing();
        break;

      case 'endorsed':
        this.handleEndorsed();
        break;


    }
  }


  ngOnInit(): void {
    this.getBanks();
    this.getBankAccounts();
    this.handleIncoming();
    this.loadDefaultCurrency();
  }

  getBankAccounts() {
    this._BankAccountService.getAllBankAccounts().subscribe({
      next: (response) => {
        if (response) {
          this.bankAccounts = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
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

  handleForm(): void {


    this.isSubmited = true;
    let isCorrectCurrency = true;
      if((this.selectedSourceAccount?.currency.id != this.currency.id) && 
      (this.selectedPayedToAccount?.currency.id != this.currency.id) && 
      (this.selectedPayedToAccount?.currency.id != this.selectedSourceAccount?.currency.id)){
        alert('فى حالة وجود حساب بعملة اجنبية يجب ان يكو ن الحساب الاخر بنفس العملة او بعملة الشركة');
        isCorrectCurrency = false;
      }
      if(this.needCurrecyPrice && this.checkForm.get('currency_value')?.value == null){
        isCorrectCurrency = false;
      }
  

      


    if (this.checkForm.valid && isCorrectCurrency) {
      this.isLoading = true;





      const formData = new FormData();
      formData.append('due_date', this.checkForm.get('due_date')?.value);
      formData.append('note', this.checkForm.get('notes')?.value || '');
      formData.append('amount', this.checkForm.get('amount')?.value);
      formData.append('check_number', this.checkForm.get('check_number')?.value);
      formData.append('type', this.checkForm.get('type')?.value);
      formData.append('payed_to_id', this.checkForm.get('payed_to_id')?.value);
      formData.append('source_account_id', this.checkForm.get('source_account_id')?.value);
      formData.append('bank_id', this.checkForm.get('bank_id')?.value);
      // formData.append('currency_id', this.checkForm.get('currency_id')?.value);
      formData.append('bank_branch_id', this.checkForm.get('bank_branch_id')?.value || '');


      if(this.checkForm.get('currency_value')?.value){
        formData.append('currency_price_value', this.checkForm.get('currency_value')?.value);

      }
      if (this.selectedFrontImage) {
        formData.append('front_image', this.selectedFrontImage);
      }
      if (this.selectedBackImage) {
        formData.append('back_image', this.selectedBackImage);
      }
      this._CheckServic.addCheck(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response) {
            this._Router.navigate(['/dashboard/check_list/waiting']);

          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          console.log('error happend', err);

        }
      });

    } else {
      console.log('Form is invalid');
    }
  }


filteredAccounts: Account[] = [];
  selectedPopUP:string ='';
  searchQuery: string = '';
  selectedSourceAccount:Account | null= null;
  selectedPayedToAccount:Account | null= null;



  selectAccount(account:Account){
    
    if(this.selectedPopUP  == 'pay_to_accounts'){
      this.selectedPayedToAccount = account;
      this.checkForm.patchValue({'payed_to_id':account.id})

      this.needCurrecyPrice = false;

      if(this.selectedPayedToAccount) {
        if(this.selectedPayedToAccount.currency.id != this.currency.id){
          this.needCurrecyPrice = true;
          this.forignCurrencyName = this.selectedPayedToAccount.currency.name;

        }      
      }

      if(this.selectedSourceAccount) {
        if(this.selectedSourceAccount.currency.id != this.currency.id){
          this.needCurrecyPrice = true;
          this.forignCurrencyName = this.selectedSourceAccount.currency.name;

        }      
      }


    }else if(this.selectedPopUP  == 'source_accounts'){
      this.selectedSourceAccount = account;
      this.checkForm.patchValue({'source_account_id':account.id})

      this.needCurrecyPrice = false;

      if(this.selectedPayedToAccount) {
        if(this.selectedPayedToAccount.currency.id != this.currency.id){
          this.needCurrecyPrice = true;
          this.forignCurrencyName = this.selectedPayedToAccount.currency.name;

        }      
      }

      if(this.selectedSourceAccount) {
        if(this.selectedSourceAccount.currency.id != this.currency.id){
          this.needCurrecyPrice = true;
          this.forignCurrencyName =this.selectedSourceAccount.currency.name;

        }      
      }


    }
    this.closeModal('shiftModal');
  }



    closeModal(modalId: string) {
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        const modal = Modal.getInstance(modalElement);
        modal?.hide();
      }
    }
  
    openModal(modalId: string , type:string) {

      this.selectedPopUP = type;
      if(type == 'pay_to_accounts'){
        this.filteredAccounts = this.pay_to_accounts;
      }else if(type =='source_accounts'){
        this.filteredAccounts =this.source_accounts;
      }
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        const modal = new Modal(modalElement);
        modal.show();
      }
    }
  

    
  onSearchChange()
  {
    if(this.selectedPopUP == 'pay_to_accounts'){
      this.getAccounts(this.destination_accounts , 'payTo');
    }else if (this.selectedPopUP == 'source_accounts'){
      this.getAccounts(this.source_accounts_parents , 'source');

    }
  }
updateAccount(){
     if(this.selectedPopUP == 'pay_to_accounts'){
        this.filteredAccounts = this.pay_to_accounts;
      }else if(this.selectedPopUP =='source_accounts'){
        this.filteredAccounts =this.source_accounts;
      }

}

}

interface Account {
  id: string;
  name: string;
  currency: {
    id: string;
    name: string;
  };
  parent_id?: string;
  child?: Account[];
  showChildren?: boolean;
}