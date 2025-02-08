import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AccountService } from '../../shared/services/account.service';
import { PaymentDocumentService } from '../../shared/services/pyment_document.service';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-add-document',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-document.component.html',
  styleUrl: './add-document.component.css'
})
export class AddDocumentComponent {
  transactionForm: FormGroup;
  isLoading = false;
  accounts: any;
  compony_accounts: any;
  notes: any;
  currencies: any;

  delegates: any;
  creators: any;
  parent_accounts: any;

  parent_accounts_company: any;

  type: string | null = '';
  constructor(private route: ActivatedRoute
    , private fb: FormBuilder,
    private _AccountService: AccountService,
    private _PaymentDocumentService: PaymentDocumentService
  ) {

    this.transactionForm = this.fb.group({
      manual_reference: [''],
      from_to_account: [null, Validators.required],
      from_to_account_company: [null, Validators.required],
      note_id: [null],
      currency_id: [null, Validators.required],
      delegate_id: [null],
      date: [this.getTodayDate()],
      amount: [null, [Validators.required, Validators.min(0)]],
      organization: [''],
      note: [''],
      receiver: [''],
      payer: ['']
    });

  }


  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  ngOnInit(): void {
    this.getParams();

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
  getParams() {
    this.route.paramMap.subscribe(params => {
      this.type = params.get('type');
    });
    console.log(this.type);

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


      this._PaymentDocumentService.addDocument(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response) {

          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          console.log('error happend', err);

        }
      });

    }
  }



}
