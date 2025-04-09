
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
  pay_to_accounts: Account [] =[];
  source_accounts: Account [] =[];
  selectedFrontImage: File | null = null;
  selectedBackImage: File | null = null;

  constructor(private fb: FormBuilder,
    private _AccountService: AccountService,
    private _BankService: BankService,
    private _CheckServic: CheckService,
    private _BankAccountService:BankAccountService, 
    private _Router: Router
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
      currency_id: [null, Validators.required],
      front_image: [null, Validators.required],
      back_image: [null, Validators.required],

      bank_branch_id: [null],
      bank_account_id: [null],
    });

  }
  destination_accounts: any;

  source_accounts_parents: any;
  handleIncoming() {


    this.source_accounts_parents = [112, 41 , 6 , 118 , 113 , 211];
    this.destination_accounts = [112, 41 , 6 , 118 , 113 , 211];
    this.getAccounts(this.source_accounts_parents, this.destination_accounts);

  }
  handleOutgoing() {


    this.source_accounts_parents = [112, 41 , 6 , 118 , 113 , 211];
    this.destination_accounts = [112, 41 , 6 , 118 , 113 , 211];
    this.getAccounts(this.source_accounts_parents, this.destination_accounts);

  }
  handleEndorsed() {


    this.source_accounts_parents = [112, 41 , 6 , 118 , 113 , 211];
    this.destination_accounts = [112, 41 , 6 , 118 , 113 , 211];
    this.getAccounts(this.source_accounts_parents, this.destination_accounts);
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

  getAccounts(parent: number[], parent_company: number[]) {
    this._AccountService.getParentForDocument(parent, parent_company).subscribe({
      next: (response) => {
        if (response) {
          console.log("my response:", response)
          this.currencies = response.currencies;
          this.source_accounts = response.children;
          this.pay_to_accounts = response.children_company;
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
    if (this.checkForm.valid) {
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
      formData.append('currency_id', this.checkForm.get('currency_id')?.value);
      formData.append('bank_branch_id', this.checkForm.get('bank_branch_id')?.value || '');
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
    }else if(this.selectedPopUP  == 'source_accounts'){
      this.selectedSourceAccount = account;
      this.checkForm.patchValue({'source_account_id':account.id})

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
  

    
  onSearchChange(){

  
    if(this.selectedPopUP == 'pay_to_accounts'){
      this.filteredAccounts = this.pay_to_accounts.filter(account =>
        account.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
  
    }else if (this.selectedPopUP == 'source_accounts'){
      this.filteredAccounts = this.source_accounts.filter(account =>
        account.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
   
  }


}

interface Account {
  id: string;
  name: string;
  parent_id?: string;
  child?: Account[];
  showChildren?: boolean;
}