import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators ,FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CurrencyService } from '../../shared/services/currency.service';
import { AccountService } from '../../shared/services/account.service';
import { HttpErrorResponse } from '@angular/common/http';
import { EntryDocumentService } from '../../shared/services/entry-documnet.service';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Modal } from 'bootstrap';
import { ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-document-entry',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,TranslateModule,FormsModule
  ],
  templateUrl: './add-document-entry.component.html',
  styleUrls: ['./add-document-entry.component.css']
})
export class AddDocumentEntryComponent implements OnInit {

  entryForm: FormGroup;
  isLoading = false;
  currencies: any = []; 
  delegates: Account [] = [];
  documents: any = []; // Sample data for documents
  accounts: Account [] = [];  // Sample data for accounts
  totalDebit = 0;
  totalCredit = 0;
  totalDifference = 0;
  totalType = '';
  needCurrecyPrice = false;
  isSubmited = false;


  selectedAccounts: { index: number; account: Account }[] = [];
  constructor(private fb: FormBuilder,
    private _CurrencyService:CurrencyService,
    private _AccountService:AccountService,
        private _Router: Router,
        private cdr: ChangeDetectorRef,
    private _EntryDocument :EntryDocumentService,
    private toastr: ToastrService
  ) {
    this.entryForm = this.fb.group({
      manual_reference: ['', [Validators.maxLength(255)]],
      date: [this.getTodayDate()],
      // amount: ['', Validators.required],
      organization: ['', Validators.maxLength(255)],
      // currency_id: ['', Validators.required],
      delegate_id: [''],
      currency_value: [''],

      note: ['', Validators.maxLength(255)],
      entryItems: this.fb.array([])
        });
  }




  ngOnInit() {
    // this.loadCurrencies();
    this.loadDelegates();
    this.loadAccounts();
    this.loadDefaultCurrency();

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

  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadCurrencies() { 
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
  loadDelegates() {
    
    this._AccountService.getAccountsByParent('623').subscribe({
      next: (response) => {
        if (response) {
          this.delegates = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  loadAccounts() { 
    this._AccountService.getAllChildren().subscribe({
      next: (response) => {
        if (response) {
          this.accounts = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
   }

  // Accessor for entryItems FormArray
  get entryItems(): FormArray {
    return this.entryForm.get('entryItems') as FormArray;
  }

  onTypeChange(event :Event , index: number) {
    const selectedType = (event.target as HTMLSelectElement).value;
    const entryItem = this.entryForm.get('entryItems') as FormArray;
    const amount = entryItem.at(index).get('amount')?.value;
    const type = entryItem.at(index).get('type')?.value;
    const selectedAccountId = (entryItem.at(index).get('account')?.value).id;



    const isDuplicate = this.entryItems.controls.some((item, i) => {
      if (i !== index) {  
        const accountId = (item.get('account')?.value).id;
        const type = item.get('type')?.value;
        return accountId === selectedAccountId && type !== selectedType;
      }
      return false;
    });
    // value="debit">{{ 'DEBIT' | translate }}</option>
    // <option value="credit">
    if (isDuplicate) {
      if(selectedType == 'debit'){
        entryItem.at(index).get('type')?.setValue('credit'); 

      }else{
        entryItem.at(index).get('type')?.setValue('debit'); 

      }
       this.toastr.error('You cannot choose the same account with a different type (debit/credit)!');
      // alert('You cannot choose the same account with a different type (debit/credit)!');
      return;
    }
    

    if (type === 'debit') {
      this.totalDebit += parseFloat(amount);
      this.totalCredit -= parseFloat(amount);

    } else if (type === 'credit') {
      this.totalCredit += parseFloat(amount);
      this.totalDebit -= parseFloat(amount);
    }
    this.totalDifference = this.totalCredit -this.totalDebit;
    if (this.totalDifference < 0){
      this.totalDifference *= -1;

      this.totalType = 'debit';
    }else{
      this.totalType = 'credit';
    }


    
  }
  addEntryItem() {
    const entryItem = this.fb.group({
      amount: ['', Validators.required],
      type: ['debit', Validators.required],
      account: ['', Validators.required],

      
    });
    this.entryItems.push(entryItem);
  }

  // Method to remove an entry item
  removeEntryItem(index: number) {
    this.entryItems.removeAt(index);
    this.calculateTotals();

  }

  // Handle form submission
  handleSubmit() {


    this.isSubmited = true;
    
    if (this.entryForm.valid && this.entryItems.length>1 && this.totalDifference == 0 &&(this.needCurrecyPrice == false || this.entryForm.get('currency_value')?.value != null)) {
      this.isLoading = true;

console.log(this.entryForm.get('amount')?.value);

      const formData = new FormData();
      formData.append('manual_reference', this.entryForm.get('manual_reference')?.value || '');
      formData.append('date', this.entryForm.get('date')?.value );
      formData.append('organization', this.entryForm.get('organization')?.value || '');
      formData.append('currency_id', this.entryForm.get('currency_id')?.value );
      formData.append('delegate_id', this.entryForm.get('delegate_id')?.value || '');
      formData.append('note', this.entryForm.get('note')?.value || '');
      formData.append('amount', this.totalCredit.toString() );

      if(this.entryForm.get('currency_value')?.value){
        
        formData.append('currency_price_value', this.entryForm.get('currency_value')?.value);

      }

      const entryItems = this.entryForm.get('entryItems') as FormArray;
      entryItems.controls.forEach((item, index) => {
        const entryData = {
          account: item.get('account')?.value || '',
          type: item.get('type')?.value || '',
          amount: item.get('amount')?.value || ''
        };
      
        formData.append(`entryItems[${index}][account_id]`, entryData.account.id);
        formData.append(`entryItems[${index}][type]`, entryData.type);
        formData.append(`entryItems[${index}][amount]`, entryData.amount);
      });
      

      this._EntryDocument.addEntryDocument(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response) {
            this.toastr.success('تم اضافه المستند بنجاح');
            this._Router.navigate(['/dashboard/documentEntry/waiting']); 
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error('حدث خطا اثناء اضافه المستند');
          this.isLoading = false;
          console.log(err);
        }
      });
    }else if (this.entryForm.valid && this.entryItems.length<2){
      // this.toastr.error('you have to add at least 2 accounts');
    
    alert('you have to add at least 2 accounts');
    }else if(this.totalDifference != 0){
      // this.toastr.error('credit must match debit');
      alert('credit must match debit');

    }else{}
  }
  


  getAccountById(index:number){
    const entryItem = this.entryForm.get('entryItems') as FormArray;
    const selectedAccount = entryItem.at(index).get('account')?.value;
    return selectedAccount;
  }

onAccountChange(selectedaccountID: string, index: number) {
  const entryItem = this.entryForm.get('entryItems') as FormArray;
  const selectedType = entryItem.at(index).get('type')?.value;

  const isDuplicate = this.entryItems.controls.some((item, i) => {
    if (i !== index) {  
      const accountId = (item.get('account')?.value).id;
      const type = item.get('type')?.value;
      return accountId === selectedaccountID && type !== selectedType;
    }
    return false;
  });

  if (isDuplicate) {
    entryItem.at(index).get('account')?.setValue(null); 
    this.toastr.error('You cannot choose the same account with a different type (debit/credit)!');
    // alert('You cannot choose the same account with a different type (debit/credit)!');
  }


  return isDuplicate;
}

calculateTotals() {
    this.totalDebit = 0;
    this.totalCredit = 0;
    this.entryItems.controls.forEach((item) => {
      let amount = item.get('amount')?.value || 0;
      const type = item.get('type')?.value;
      const account = item.get('account')?.value;
      if(account){
      if(account.currency.id != this.currency.id){
        amount = amount * parseFloat(this.entryForm.get('currency_value')?.value);
      }
      }
      if (type === 'debit') {

        
        this.totalDebit += parseFloat(amount);
      } else if (type === 'credit') {
        this.totalCredit += parseFloat(amount);
      }

    this.totalDifference = this.totalCredit -this.totalDebit;
    if (this.totalDifference < 0){
      this.totalDifference *= -1;
      this.totalType = 'debit';
    }else{
      this.totalType = 'credit';
    }
    });
  }

  


  filteredAccounts: Account[] = [];
    selectedPopUP:string ='';
    searchQuery: string = '';
    selectedAccount:Account | null= null;
    selecteddelegateAccount:Account | null= null;
    popUpIndex = -1;
    selectedcompanyAccount:Account | null= null;
  
    selectAccount(account:Account){
      const entryItem = this.entryForm.get('entryItems') as FormArray;
    

      if(this.selectedPopUP  == 'account'){
        const isDoublicated = this.onAccountChange(account.id , this.popUpIndex);
        if(isDoublicated){
          this.closeModal('shiftModal');
          return;
        }

        entryItem.at(this.popUpIndex).get('account')?.setValue(account); 
        entryItem.at(this.popUpIndex).get('account_name')?.setValue(account.name); 


        entryItem.controls.forEach((item) => {
        if(item.get('account')?.value.currency.id != this.currency.id){
          this.needCurrecyPrice = true;
        }
        })

        this.calculateTotals();
      }else if (this.selectedPopUP  == 'delegate'){
        this.selecteddelegateAccount = account;
        this.entryForm.patchValue({'delegate_id':account.id})
  
      }
      // const accomdkdcd =entryItem.at(this.popUpIndex).get('account')?.value;
      // console.log('here 1',account);
      //       console.log('here 2',      accomdkdcd         );

            this.cdr.detectChanges();

      this.closeModal('shiftModal');

    }
  
  
  
    removeCurrentDelegate(){
      this.selecteddelegateAccount =null;
     this.entryForm.patchValue({'delegate_id':null});
    }
  


      closeModal(modalId: string) {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
          const modal = Modal.getInstance(modalElement);
          modal?.hide();
        }
      }
    

      openModal(modalId: string , type:string ,index:number) {
        this.selectedPopUP = type;
        this.popUpIndex = index;
        const entryItem = this.entryForm.get('entryItems') as FormArray;
        if(type == 'account'){
          this.filteredAccounts =this.accounts;
        }else if (type == 'delegate'){
          this.filteredAccounts =this.delegates;
        }
        // console.log('hrerererer');
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
          const modal = new Modal(modalElement);
          modal.show();
        }
      }
    
  
      
    onSearchChange(){
  
    
      if(this.selectedPopUP == 'account'){
        this.filteredAccounts = this.accounts.filter(account =>
          account.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
    
      }else if (this.selectedPopUP == 'delegate'){
        this.filteredAccounts = this.delegates.filter(account =>
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