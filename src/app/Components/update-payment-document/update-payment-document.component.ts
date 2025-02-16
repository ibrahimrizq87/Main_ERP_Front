import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators ,FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AccountService } from '../../shared/services/account.service';
import { PaymentDocumentService } from '../../shared/services/pyment_document.service';
import { Modal } from 'bootstrap';



// import { Component } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { FormBuilder, FormGroup, Validators ,} from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule } from '@angular/forms';
// import { AccountService } from '../../shared/services/account.service';
// import { PaymentDocumentService } from '../../shared/services/pyment_document.service';
// import { HttpErrorResponse } from '@angular/common/http';
// import { Modal } from 'bootstrap';
// import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-update-payment-document',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule ,TranslateModule ,FormsModule],
  templateUrl: './update-payment-document.component.html',
  styleUrl: './update-payment-document.component.css'
})
export class UpdatePaymentDocumentComponent {
    transactionForm: FormGroup;
    isLoading = false;
    accounts:Account [] = [];
    compony_accounts: Account [] = [];
    notes: any;
    currencies: any;
    paymentDocument :Transaction|null = null;
    delegates: Account [] = [];
    creators: any;
    parent_accounts: any;
    type :string|null='';
    parent_accounts_company: any;
    msgError: string = '';
    msgSuccess:string ='';
    documentId :string =''; 

    constructor(private route: ActivatedRoute
      , private fb: FormBuilder,
      private _AccountService: AccountService,
      private _PaymentDocumentService: PaymentDocumentService
      , private router: Router
    ) {
  
      this.transactionForm = this.fb.group({
        manual_reference: [''],
        from_to_account: [null, Validators.required],
        from_to_account_company: [null, Validators.required],
        currency_id: [null, Validators.required],
        delegate_id: [null],
        date: [''],
        amount: [null, [Validators.required, Validators.min(0)]],
        organization: [''],
        note: [''],
        receiver: [''],
        // payer: ['']
      });
  
    }

  

      ngOnInit(): void {
        const documentId = this.route.snapshot.paramMap.get('id'); 
        if (documentId) {
          this.fetchPaymentDocumentData(documentId);
          this.documentId =documentId;
        }
        // this.getParams();
        this.loadDelegates();
    
      }


      removeCurrentDelegate(){
        this.selecteddelegateAccount =null;
       this.transactionForm.patchValue({'delegate_id':null});
      }

      fetchPaymentDocumentData(id:string){
        this._PaymentDocumentService.getDocumentById(id).subscribe({
          next: (response) => {
            if (response) {
              const documentData = response.data ; 
              console.log(documentData)
              this.paymentDocument =documentData;

              if(this.paymentDocument?.delegate){
                this.selecteddelegateAccount = this.paymentDocument?.delegate;
              }
              if(this.paymentDocument?.from_to_account_company){
                this.selectedcompanyAccount = this.paymentDocument?.from_to_account_company;
              }
              if(this.paymentDocument?.from_to_account){
                this.selectedAccount = this.paymentDocument?.from_to_account;
              }
              if(this.paymentDocument?.type){
                this.getLoadAccounts(this.paymentDocument?.type);
              }
             

              this.transactionForm.patchValue({
                manual_reference: this.paymentDocument?.manual_reference,
                from_to_account: this.paymentDocument?.from_to_account.id,
                from_to_account_company: this.paymentDocument?.from_to_account_company.id,
                currency_id: this.paymentDocument?.currency_id,
                delegate_id: this.paymentDocument?.delegate?.id,
                date: this.paymentDocument?.date,
                amount: this.paymentDocument?.amount,
                organization: this.paymentDocument?.organization,
                note: this.paymentDocument?.note,
                receiver: this.paymentDocument?.receiver,
                // payer: this.paymentDocument?.payer
              });
              
            }
          },
          error: (err: HttpErrorResponse) => {
            this.msgError = err.error.error;
          }
        });
      }
    
      handleReceipt() {
        this.parent_accounts = [6];
        this.parent_accounts_company = [111, 112, 113, 117, 118];
        this.getAccounts(this.parent_accounts, this.parent_accounts_company);
      }
      handlePayment() {
    
        this.parent_accounts = [6, 113, 117, 118];
        this.parent_accounts_company = [111, 112, 113, 117, 121, 211, 42, 6];
        this.getAccounts(this.parent_accounts, this.parent_accounts_company);
    
      }
      handleCreditNote() {
    
        this.parent_accounts = [6];
        this.parent_accounts_company = [211, 42, 513];
        this.getAccounts(this.parent_accounts, this.parent_accounts_company);
    
      }
      handleDebitNote() {
    
        this.parent_accounts = [6];
        this.parent_accounts_company = [112, 41];
        this.getAccounts(this.parent_accounts, this.parent_accounts_company);
    
      }
      getLoadAccounts(type:string) {
        
        this.type = type;
    
        switch (this.type) {
          case 'receipt':
            this.handleReceipt();
            break;
    
          case 'payment':
            this.handlePayment();
            break;
    
          case 'creditNote':
            this.type = 'credit_notification';
            this.handleCreditNote();
            break;
    
          case 'debitNote':
            this.type = 'debit_notification';
    
            this.handleDebitNote();
            break;
    
          // case 'bank-entry':
          //   // this.handleBankEntry();
          //   break;
    
          default:
            alert('wrong document type please try to select a document');
            break;
        }
    
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
      getAccounts(parent: number[], parent_company: number[]) {
        this._AccountService.getParentForDocument(parent, parent_company).subscribe({
          next: (response) => {
            if (response) {
              console.log("my response:", response)
              this.currencies = response.currencies;
              this.accounts = response.children;
              this.compony_accounts = response.children_company;
            }
          },
          error: (err) => {
            console.error(err);
          }
        });
      }
    
      handleForm(): void {
        if (this.transactionForm.valid) {
          this.isLoading = true;
    
          const formData = new FormData();
          formData.append('manual_reference', this.transactionForm.get('manual_reference')?.value || '');
          formData.append('from_to_account', this.transactionForm.get('from_to_account')?.value);
          formData.append('from_to_account_company', this.transactionForm.get('from_to_account_company')?.value);
          formData.append('note_id', this.transactionForm.get('note_id')?.value || '');
          formData.append('currency_id', this.transactionForm.get('currency_id')?.value);
          formData.append('delegate_id', this.transactionForm.get('delegate_id')?.value || '');
          formData.append('date', this.transactionForm.get('date')?.value);
          formData.append('amount', this.transactionForm.get('amount')?.value);
    
          formData.append('note', this.transactionForm.get('note')?.value || '');
    
          formData.append('organization', this.transactionForm.get('organization')?.value || '');
          formData.append('type', this.type || '');
          formData.append('receiver', this.transactionForm.get('receiver')?.value || '');
          formData.append('payer', this.transactionForm.get('payer')?.value || '');
    
    
          this._PaymentDocumentService.updateDocumentById(this.documentId,formData).subscribe({
            next: (response) => {
              this.isLoading = false;
              if (response) {
                this.router.navigate(['/dashboard/document/' + this.type +'/'+ this.paymentDocument?.status]);
    
              }
            },
            error: (err: HttpErrorResponse) => {
              this.isLoading = false;
              console.log('error happend', err);
    
            }
          });
    
        }
      }
    
    
    
    
    
      // for pop up
      filteredAccounts: Account[] = [];
      selectedPopUP:string ='';
      searchQuery: string = '';
      selectedAccount:Account | null= null;
      selecteddelegateAccount:Account | null= null;
    
      selectedcompanyAccount:Account | null= null;
    
      selectAccount(account:Account){
    
        if(this.selectedPopUP  == 'company'){
          this.selectedcompanyAccount = account;
          this.transactionForm.patchValue({'from_to_account_company':account.id})
        }else if (this.selectedPopUP  == 'delegate'){
          this.selecteddelegateAccount = account;
          this.transactionForm.patchValue({'delegate_id':account.id})
    
        }else{
          this.selectedAccount = account;
          this.transactionForm.patchValue({'from_to_account':account.id})
    
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
          if(type == 'company'){
            this.filteredAccounts = this.compony_accounts;
          }else if (type == 'delegate'){
            this.filteredAccounts =this.delegates;
          }else{
            this.filteredAccounts =this.accounts;
    
          }
          const modalElement = document.getElementById(modalId);
          if (modalElement) {
            const modal = new Modal(modalElement);
            modal.show();
          }
        }
      
    
        
      onSearchChange(){
    
      
        if(this.selectedPopUP == 'company'){
          this.filteredAccounts = this.compony_accounts.filter(account =>
            account.name.toLowerCase().includes(this.searchQuery.toLowerCase())
          );
      
        }else if (this.selectedPopUP == 'delegate'){
          this.filteredAccounts = this.delegates.filter(account =>
            account.name.toLowerCase().includes(this.searchQuery.toLowerCase())
          );
        }else{
          this.filteredAccounts = this.accounts.filter(account =>
            account.name.toLowerCase().includes(this.searchQuery.toLowerCase())
          );
          }
       
      }
    
    
    }
    
    
    
    
    interface Account {
      id: string;
      name: string;
    }



    interface Transaction {
      id: number;
      amount: string;
      created_at: string;
      updated_at: string;
      creator_id: number;
      currency_id: number;
      date: string;
      status:string;
      delegate: Account | null;
      from_to_account: Account;
      from_to_account_company: Account;
      manual_reference: string|null;
      note: string | null;
      organization: string | null;
      receiver: string | null;
      type: string; 
    }
    