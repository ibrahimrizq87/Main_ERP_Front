import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [
    ReactiveFormsModule,
    CommonModule,TranslateModule,FormsModule
  ],
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

   entryDocument: EntryDocument = {
    id: 0,
    date: "",
    manual_reference: null,
    note: null,
    organization: null,
    updated_at: "",
    status:"",
    currency: {
        id: 0,
        name: "",
    },
    delegate: {
        id: '0',
        name: "",
    },
    creator: {
        id: 0,
        name: "",
        email: null,
        phone: null,
        role: null,
        image: null,
        created_at: "",
        updated_at: "",
    },
    entryDocumentItems: [],
};


  selectedAccounts: { index: number; account: Account }[] = [];
  constructor(private fb: FormBuilder,
    private _CurrencyService:CurrencyService,
    private _AccountService:AccountService,
        private _Router: Router,
        private cdr: ChangeDetectorRef,
            private route: ActivatedRoute,
    private _EntryDocument :EntryDocumentService,
    private toastr: ToastrService
  ) {
    this.entryForm = this.fb.group({
      manual_reference: ['', [Validators.maxLength(255)]],
      date: [this.getTodayDate()],
      // amount: ['', Validators.required],
      organization: ['', Validators.maxLength(255)],
      currency_id: ['', Validators.required],
      delegate_id: [''],
      note: ['', Validators.maxLength(255)],
      entryItems: this.fb.array([])
        });
  }




  ngOnInit() {

    const groupId = this.route.snapshot.paramMap.get('id'); 
    if (groupId) {
      this.loadEntryDocument(groupId);
    }
    this.loadCurrencies();
    this.loadDelegates();
    this.loadAccounts();
    // this.loadEntryDocument();
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



   loadEntryDocument(id:string) {
    this._EntryDocument.getEntryDocumentById(id).subscribe({
      next: (response) => {
        if (response) {
        this.entryDocument = response.data ;

        this.entryForm.patchValue({

          manual_reference: this.entryDocument.manual_reference,
          date: this.entryDocument.date,
          // amount: ['', Validators.required],
          organization: this.entryDocument.organization,
          currency_id: this.entryDocument.currency.id,
          delegate_id: this.entryDocument.delegate?.id,
          note: this.entryDocument.note,
          entryItems: []    
        
        });


        
        // console.log(this.entryDocument.entryDocumentItems);
        // console.log(this.entryDocument);

        this.entryDocument.entryDocumentItems.forEach((item) => {
        this.addEntryItem(item);
        });

        this.selecteddelegateAccount = this.entryDocument.delegate;
        this.calculateTotals();
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
  addEntryItem(item:EntryDocumentItem|null =null) {
    let entryItem;
    if(item){
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

  // Method to remove an entry item
  removeEntryItem(index: number) {
    this.entryItems.removeAt(index);
    this.calculateTotals();
  }

  // Handle form submission
  handleSubmit() {
    
    if (this.entryForm.valid && this.entryItems.length>1 && this.totalDifference == 0) {
      this.isLoading = true;



      const formData = new FormData();
      formData.append('manual_reference', this.entryForm.get('manual_reference')?.value || '');
      formData.append('date', this.entryForm.get('date')?.value );
      formData.append('organization', this.entryForm.get('organization')?.value || '');
      formData.append('currency_id', this.entryForm.get('currency_id')?.value );
      formData.append('delegate_id', this.entryForm.get('delegate_id')?.value || '');
      formData.append('note', this.entryForm.get('note')?.value || '');
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
      

      this._EntryDocument.updateEntryDocument(formData , this.entryDocument.id.toString()).subscribe({
        next: (response) => {
          this.toastr.success('تم تعديل القيد بنجاح');
          this.isLoading = false;
          if (response) {
            this._Router.navigate(['/dashboard/documentEntry/'+this.entryDocument.status]); 
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error('حدث خطا اثناء تعديل القيد');
          this.isLoading = false;
          console.log(err);
        }
      });
    }else if (this.entryForm.valid && this.entryItems.length<2){
      this.toastr.error('you have to add at least 2 accounts');
      
    // alert('you have to add at least 2 accounts');
    }else if(this.totalDifference != 0){
      this.toastr.error('credit must match debit');
      // alert('credit must match debit');

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
    // alert('You cannot choose the same account with a different type (debit/credit)!');
  }


  return isDuplicate;
}

calculateTotals() {
    this.totalDebit = 0;
    this.totalCredit = 0;
    this.entryItems.controls.forEach((item) => {
      const amount = item.get('amount')?.value || 0;
      const type = item.get('type')?.value;

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
  }


interface Creator {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    role: string | null;
    image: string | null;
    created_at: string;
    updated_at: string;
}

interface Currency {
    id: number;
    name: string;
}


interface EntryDocumentItem {
    id: number;
    amount: string;
    type: 'debit' | 'credit';
    account: Account;
    created_at: string;
}

interface EntryDocument {
    id: number;
    date: string;
    manual_reference: string | null;
    note: string | null;
    organization: string | null;
    updated_at: string;
    currency: Currency;
    delegate: Account |null;
    creator: Creator;
    status:string;
    entryDocumentItems: EntryDocumentItem[];
}
