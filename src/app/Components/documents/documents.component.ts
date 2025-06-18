import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AccountService } from '../../shared/services/account.service';
import { PaymentDocumentService } from '../../shared/services/pyment_document.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PermissionService } from '../../shared/services/permission.service';
import { Subject, debounceTime } from 'rxjs';

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
    , private router: Router,private toastr:ToastrService,
        public _PermissionService: PermissionService
    
  ) {
 this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(query => {
      this.loadAllDocuments();
    });
   

  }

 onSearchChange() {
      this.searchSubject.next(this.searchQuery);
    }
  
  
    private searchSubject = new Subject<string>();

   searchDateType ='day';

  filters = {
    // vendorName:'',
    // paymentType: 'all',
    startDate: '',
    endDate: '',
    priceFrom: '',
    priceTo: '',
    day: this.getTodayDate(),
  };

    getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
    onSearchTypeChange(){
    this.filters.startDate = '';
    this.filters.endDate = '';
    this.filters.day = '';
  }

  clearSerachFields(){
    this.filters.priceFrom = '';
    this.filters.priceTo = '';
    // this.filters.paymentType = 'all';
    // this.filters.vendorName ='';
  }



  
changeStatus(status:string){
this.status = status;
this.router.navigate([`/dashboard/document/${this.type}/${status}`]);
this.loadAllDocuments();

  }
  ManageChangeStatus(status:string , id:string){

      this._PaymentDocumentService.UpdateDocumentStatus(id ,status ).subscribe({
        next: (response) => {
          if (response) {
            this.loadAllDocuments()

          }
        },
        error: (err) => {
          console.error(err);
        }
      });
  }
  deleteDocument( id:string){
    if (confirm('Are you sure you want to delete this Document?')) {

    this._PaymentDocumentService.deleteDocument(id  ).subscribe({
      next: (response) => {
        if (response) {
          this.toastr.success('تم حذف المستند بنجاح');
          this.loadAllDocuments()

        }
      },
      error: (err) => {
        this.toastr.error('حدث خطا اثناء حذف المستند');
        console.error(err);
      }
    });
  }
}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const newType = params.get('type');
      const newStatus = params.get('status');
      console.log(newStatus);
      if (newStatus && this.status !== newStatus) {

  
          this.status = newStatus;
        
        
      }

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

  }
  handleCreditNote() {

    this.parent_accounts = [6];
    this.parent_accounts_company = [211, 42, 513];

  }
  handleDebitNote() {

    this.parent_accounts = [6];
    this.parent_accounts_company = [112, 41];

  }
  get addDocumentRouterLink(): string {
    console.log('type',this.type);
    if (this.type === 'receipt') {
      return '/dashboard/addDocument/receipt';
    }  if (this.type === 'payment') {
      return '/dashboard/addDocument/payment';
    } if (this.type =='credit_note') {
      return '/dashboard/addDocument/credit_note';
    }  if (this.type == 'debit_note') {
      return '/dashboard/addDocument/debit_note';
    }
    return '/dashboard/addDocument';
  }
  

  onParamChange(): void {
    this.loadAllDocuments();
  }
 


  loadAllDocuments(): void {


    const startDate = this.filters.startDate || '';
    const endDate = this.filters.endDate || '';
    const priceFrom = this.filters.priceFrom || '';
    const priceTo = this.filters.priceTo || '';
    const day = this.filters.day || '';
    this._PaymentDocumentService.getDocumentsByType(this.type || '' , this.status,
this.searchQuery,
      startDate,
      endDate,
      priceFrom,
      priceTo,
      day,
    ).subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.documents = response.data.documents; 
        
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
 

  // deleteDocument(documentId: number): void {
  //   if (confirm('Are you sure you want to delete this Document?')) {
  //     this._PaymentDocumentService.deleteDocument(documentId).subscribe({
  //       next: (response) => {
  //         if (response) {
  //           this.router.navigate([`/dashboard/document/${this.type}`]);
  //           this.loadAllDocuments();
  //         }
  //       },
  //       error: (err) => {
  //         console.error(err);
  //         alert('An error occurred while deleting the User.');
  //       }
  //     });
  //   }
  // }


}
