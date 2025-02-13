import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AccountService } from '../../shared/services/account.service';
import { PaymentDocumentService } from '../../shared/services/pyment_document.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule ,TranslateModule,FormsModule,RouterModule],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.css'
})
export class DocumentsComponent {

  // transactionForm: FormGroup;
  isLoading = false;
  accounts: any;
  compony_accounts: any;
  notes: any;
  currencies: any;
  status ='waiting';
  delegates: any;
  creators: any;
  parent_accounts: any;

  documents: any[] = []; 
  filteredCities: any[] = []; 
  searchQuery: string = ''; 
  parent_accounts_company: any;

  type: string | null = '';
  constructor(private route: ActivatedRoute
    , private fb: FormBuilder,
    private _AccountService: AccountService,
    private _PaymentDocumentService: PaymentDocumentService
    , private router: Router
  ) {

   

  }


  
  changeStatus(status:string){
this.status = status;
this.loadAllDocuments();

  }
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const newType = params.get('type');
      if (this.type !== newType) {
        this.type = newType;
        this.onParamChange();
      }
    });
        this.loadAllDocuments()
  }

  handleReceipt() {
    this.parent_accounts = [6];
    this.parent_accounts_company = [111, 112, 113, 117, 118];
    // this.getAccounts(this.parent_accounts, this.parent_accounts_company);
  }
  handlePayment() {

    this.parent_accounts = [6, 113, 117, 118];
    this.parent_accounts_company = [111, 112, 113, 117, 121, 211, 42, 6];
    // this.getAccounts(this.parent_accounts, this.parent_accounts_company);

  }
  handleCreditNote() {

    this.parent_accounts = [6];
    this.parent_accounts_company = [211, 42, 513];
    // this.getAccounts(this.parent_accounts, this.parent_accounts_company);

  }
  handleDebitNote() {

    this.parent_accounts = [6];
    this.parent_accounts_company = [112, 41];
    // this.getAccounts(this.parent_accounts, this.parent_accounts_company);

  }
  get addDocumentRouterLink(): string {
    if (this.type === 'receipt') {
      return '/dashboard/addDocument/receipt';
    }  if (this.type === 'payment') {
      return '/dashboard/addDocument/payment';
    } if (this.type =='creditNote') {
      return '/dashboard/addDocument/creditNote';
    }  if (this.type == 'debitNote') {
      return '/dashboard/addDocument/debitNote';
    }
    return '/dashboard/addDocument';
  }
  
  // getParams() {
  //   this.route.paramMap.subscribe(params => {
  //     this.type = params.get('type');
  //   });

  // }


  onParamChange(): void {
    this.loadAllDocuments();
  }
 


  loadAllDocuments(): void {


    if (this.type == 'creditNote'){
      this.type = 'credit_notification';
    }else if (this.type ==  'debitNote'){
      this.type = 'debit_notification';

    }
    this._PaymentDocumentService.getDocumentsByType(this.type || '' , this.status).subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.documents = response.data; 
        
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
 

  deleteDocument(documentId: number): void {
    if (confirm('Are you sure you want to delete this Document?')) {
      this._PaymentDocumentService.deleteDocument(documentId).subscribe({
        next: (response) => {
          if (response) {
            this.router.navigate([`/dashboard/document/${this.type}`]);
            this.loadAllDocuments();
          }
        },
        error: (err) => {
          console.error(err);
          alert('An error occurred while deleting the User.');
        }
      });
    }
  }


}
