import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CurrencyService } from '../../shared/services/currency.service';
import { AccountService } from '../../shared/services/account.service';
import { HttpErrorResponse } from '@angular/common/http';
import { EntryDocumentService } from '../../shared/services/entry-documnet.service';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-document-entry',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,TranslateModule
  ],
  templateUrl: './add-document-entry.component.html',
  styleUrls: ['./add-document-entry.component.css']
})
export class AddDocumentEntryComponent implements OnInit {

  entryForm: FormGroup;
  isLoading = false;
  currencies: any = []; 
  delegates: any = [];
  documents: any = []; // Sample data for documents
  accounts: any = [];  // Sample data for accounts
  totalDebit = 0;
  totalCredit = 0;
  totalDifference = 0;
  totalType = '';


  constructor(private fb: FormBuilder,
    private _CurrencyService:CurrencyService,
    private _AccountService:AccountService,
        private _Router: Router,
    
    private _EntryDocument :EntryDocumentService
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
    this.loadCurrencies();
    this.loadDelegates();
    this.loadAccounts();
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
    const selectedAccountId = entryItem.at(index).get('account')?.value;



    const isDuplicate = this.entryItems.controls.some((item, i) => {
      if (i !== index) {  
        const accountId = item.get('account')?.value;
        const type = item.get('type')?.value;
        return accountId === selectedAccountId && type !== selectedType;
      }
      return false;
    });
  
    if (isDuplicate) {
      entryItem.at(index).get('account')?.setValue(null); 

      alert('You cannot choose the same account with a different type (debit/credit)!');
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
      account: ['', Validators.required]
    });
    this.entryItems.push(entryItem);
  }

  // Method to remove an entry item
  removeEntryItem(index: number) {
    this.entryItems.removeAt(index);
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
      
        formData.append(`entryItems[${index}][account]`, entryData.account);
        formData.append(`entryItems[${index}][type]`, entryData.type);
        formData.append(`entryItems[${index}][amount]`, entryData.amount);
      });
      

      this._EntryDocument.addEntryDocument(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response) {
            this._Router.navigate(['/dashboard/documentEntry']); 
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          console.log(err);
        }
      });
    }else if (this.entryForm.valid && this.entryItems.length<2){
    alert('you have to add at least 2 accounts');
    }else if(this.totalDifference != 0){
      alert('credit must match debit');

    }
  }
  



onAccountChange(event: Event, index: number) {
  const selectedAccountId = (event.target as HTMLSelectElement).value;
  const entryItem = this.entryForm.get('entryItems') as FormArray;
  const selectedType = entryItem.at(index).get('type')?.value;
console.log(selectedType);
console.log(selectedAccountId);

  const isDuplicate = this.entryItems.controls.some((item, i) => {
    if (i !== index) {  
      const accountId = item.get('account')?.value;
      const type = item.get('type')?.value;
      return accountId === selectedAccountId && type !== selectedType;
    }
    return false;
  });

  if (isDuplicate) {
    entryItem.at(index).get('account')?.setValue(null); 
    alert('You cannot choose the same account with a different type (debit/credit)!');
  }
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
}



