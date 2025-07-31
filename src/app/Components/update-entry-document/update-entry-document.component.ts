import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators ,FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CurrencyService } from '../../shared/services/currency.service';
import { AccountService } from '../../shared/services/account.service';
import { HttpErrorResponse } from '@angular/common/http';
import { EntryDocumentService } from '../../shared/services/entry-documnet.service';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Modal } from 'bootstrap';
import { ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-update-entry-document',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,TranslateModule,FormsModule],
  templateUrl: './update-entry-document.component.html',
  styleUrl: './update-entry-document.component.css'
})
export class UpdateEntryDocumentComponent {

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
            private route: ActivatedRoute,

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
    const groupId = this.route.snapshot.paramMap.get('id'); 
    if (groupId) {
      this.loadEntryDocument(groupId);
    }

  }


     loadEntryDocument(id:string) {
    this._EntryDocument.getEntryDocumentById(id).subscribe({
      next: (response) => {
        if (response) {
        const entryDocument = response.data ;

        this.entryForm.patchValue({
          manual_reference: entryDocument.manual_reference,
          date: entryDocument.date,
          organization: entryDocument.organization,
          note: entryDocument.note,
          currency_value: entryDocument.currency_price_value,

          entryItems: []    
        });


        
        // console.log(this.entryDocument.entryDocumentItems);
        // console.log(this.entryDocument);

        // entryDocument.entryDocumentItems.forEach((item:any) => {
        // this.addEntryItem(item);
        // });

        // this.selecteddelegateAccount = this.entryDocument.delegate;

        this.loadDefaultCurrency(entryDocument.entryDocumentItems);

        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }


  currency: any ;

  loadDefaultCurrency(items:any[]) {
    this._CurrencyService.getDefultCurrency().subscribe({
      next: (response) => {
        if (response) {
          this.currency = response.data;

        items.forEach((item:any) => {
        this.addEntryItem(item);
        });
        this.calculateTotals();

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
    this._AccountService.getAllChildren(
      this.searchQuery
    ).subscribe({
      next: (response) => {
        if (response) {
          this.accounts = response.data.accounts;
          console.log('accounts' ,this.accounts);
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

    addEntryItem(item:any|null =null) {
    let entryItem;
    if(item){
      console.log(item.account);



      if(item.account.currency.id != this.currency.id){
        this.needCurrecyPrice = true;
        

      }
      entryItem = this.fb.group({
        amount: [item.amount, Validators.required],
        type: [item.type, Validators.required],
        account: [item.account, Validators.required],       
      });
    }else{
       entryItem = this.fb.group({
        amount: ['', Validators.required],
        type: ['debit', Validators.required],
        account: ['', Validators.required],       
      });
    }
    
    this.entryItems.push(entryItem);
  }

  removeEntryItem(index: number) {
    this.entryItems.removeAt(index);
    this.calculateTotals();

  }

  handleSubmit() {
    this.isSubmited = true;
    if (this.entryForm.valid && this.entryItems.length>1 && this.totalDifference == 0 &&(this.needCurrecyPrice == false || this.entryForm.get('currency_value')?.value != null)) {
      this.isLoading = true;
// console.log(this.entryForm.get('amount')?.value);
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


      const documentId = this.route.snapshot.paramMap.get('id');
      
      if (documentId) {
        this._EntryDocument.updateEntryDocument(formData, documentId).subscribe({
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
      }
      

      
    }else if (this.entryForm.valid && this.entryItems.length<2){   
    alert('you have to add at least 2 accounts');
    }else if(this.totalDifference != 0){
      alert('credit must match debit');
    }else{

    }
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
      console.log('account' ,account)
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
      });

      this.totalDifference = this.totalCredit -this.totalDebit;
      if (this.totalDifference < 0){
        this.totalDifference *= -1;
        this.totalType = 'debit';
      }else if (this.totalDifference > 0){
        this.totalType = 'credit';
      }else{
        this.totalType = 'neutral';
      }
      console.log(this.totalCredit , this.totalDebit , this.totalDifference);

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
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
          const modal = new Modal(modalElement);
          modal.show();
        }
      }


      onCancel(): void {
        this.entryForm.reset(); 
        this._Router.navigate(['/dashboard/documentEntry/waiting']); 
      }  

    }
  
  
  
  
  interface Account {
    id: string;
    name: string;
    parent_id?: string;
    child?: Account[];
    showChildren?: boolean;
  }