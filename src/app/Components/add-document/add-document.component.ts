import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators ,FormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AccountService } from '../../shared/services/account.service';
import { PaymentDocumentService } from '../../shared/services/pyment_document.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Modal } from 'bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CurrencyService } from '../../shared/services/currency.service';
import { SalesService } from '../../shared/services/sales.service';


@Component({
  selector: 'app-add-document',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,TranslateModule , FormsModule],
  templateUrl: './add-document.component.html',
  styleUrl: './add-document.component.css'
})
export class AddDocumentComponent {
  transactionForm: FormGroup;
  isLoading = false;
  accounts:Account [] = [];
  compony_accounts: Account [] = [];
  notes: any;
  currencies: any;
  forignCurrencyName ='';
  amountInLocalCurrency = 0;

  delegates: Account [] = [];
  creators: any;
  parent_accounts: any;
  isSubmited = false;
  parent_accounts_company: any;
  needCurrecyPrice = false;
  type: string | null = '';
  pay_bill =false;


  constructor(private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private _Router: Router,
    private _CurrencyService:CurrencyService,
    private _AccountService: AccountService,
    private _PaymentDocumentService: PaymentDocumentService,
    private _SalesService: SalesService,

    private toastr: ToastrService,
  ) {

    this.transactionForm = this.fb.group({
      manual_reference: [''],
      from_to_account: [null, Validators.required],
      from_to_account_company: [null, Validators.required],
      note_id: [null],
      sale_bill_id: [null],
      delegate_id: [null],
      date: [this.getTodayDate()],
      amount: [null, [Validators.required, Validators.min(0)]],
      organization: [''],
      note: [''],
      receiver: [''],
      currency_value: [''],
      payer: ['']
    });

  }


togglePayBill(){
this.pay_bill = !this.pay_bill;

if(this.selectedAccount){
    if(this.type =='receipt'){
          this.loadBills(this.selectedAccount.id);
          }else if(this.type =='payment'){
          this.loadReturnBills(this.selectedAccount.id);
    }
}

}

  caculateAmountInLocalCurrency() {
    const amount =this.transactionForm.get('amount')?.value|| 0;
    const currency_value = this.transactionForm.get('currency_value')?.value || 0;
    this.amountInLocalCurrency = amount * currency_value;

    const value = this.transactionForm.get('amount')?.value | 0;
    if(this.pay_bill && this.selectedBill){
      const toBePaid =this.selectedBill.total - this.selectedBill.total_paid;
      if(toBePaid < value){
            this.transactionForm.patchValue({'amount':toBePaid});
    }
  }



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
    this.loadDefaultCurrency();
    this.loadCurrency();
  }

  loadCurrency(): void {
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




  handleReceipt() {
    this.parent_accounts = [611 , 621 , 622 , 623 ,624];
    this.parent_accounts_company = [111, 112, 113, 117, 118];
    this.loadAccounts(this.parent_accounts , 'accounts');
    this.loadAccounts(this.parent_accounts_company , 'company') ;

  }
  handlePayment() {

    this.parent_accounts = [611 , 621 , 622 , 623 ,624, 113, 117, 118];
    this.parent_accounts_company = [111, 112, 113, 117, 121, 211, 42, 611 , 621 , 622 , 623 ,624];
    this.loadAccounts(this.parent_accounts , 'accounts');
    this.loadAccounts(this.parent_accounts_company , 'company') ;
  }
  handleCreditAndDebitNote(type:string) {

      this._AccountService.getAccountsCreditOrDebitNote(type,
      this.searchQuery
      ).subscribe({
      next: (response) => {
        if (response) {
          console.log("my response:", response)
          this.accounts = response.data.accounts;
          this.compony_accounts = response.data.compony_accounts;
          this.updateData();

        }
      },
      error: (err) => {
        console.log(err);
      }
    });

  }
  getParams() {
    this.route.paramMap.subscribe(params => {
      this.type = params.get('type');
    });
    this.handelType();
  }
  handelType(){
    switch (this.type) {
      case 'receipt':
        this.handleReceipt();
        break;

      case 'payment':
        this.handlePayment();
        break;

      case 'credit_note':
        this.type = 'credit_note';
        this.handleCreditAndDebitNote('credit_note');
        break;

      case 'debit_note':
        this.type = 'debit_note';

        this.handleCreditAndDebitNote('debit_note');
        break;

      default:
        this.toastr.error('خطا في نوع المستند');
        this.router.navigate(['/dashboard/document/' + this.type ]);
        break;
    }
  }


  loadAccounts(parent: number[] , type:string) {
  this._AccountService.getAccountsByParents(parent,
    this.searchQuery
  ).subscribe({
      next: (response) => {
        if (response) {
          if(type == 'company'){
              this.compony_accounts = response.accounts;
          }else{
            this.accounts = response.accounts;
          }
          this.updateData();
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
          console.log("my response:", response);
          this.accounts = response.children;
          this.compony_accounts = response.children_company;
          this.updateData();
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
    if((this.selectedAccount?.currency.id != this.currency.id) && 
    (this.selectedcompanyAccount?.currency.id != this.currency.id) && 
    (this.selectedcompanyAccount?.currency.id != this.selectedAccount?.currency.id)){
      alert('فى حالة وجود حساب بعملة اجنبية يجب ان يكو ن الحساب الاخر بنفس العملة او بعملة الشركة');
      isCorrectCurrency = false;
    }


    if(this.pay_bill && !this.selectedBill){
      alert('يجب اختيار فاتورة للتسدسد');
      isCorrectCurrency = false;
    }
    if(this.needCurrecyPrice && this.transactionForm.get('currency_value')?.value == null){
      isCorrectCurrency = false;
    }



    if (this.transactionForm.valid && isCorrectCurrency) {
      this.isLoading = true;
      const formData = new FormData();
      formData.append('manual_reference', this.transactionForm.get('manual_reference')?.value || '');
      formData.append('from_to_account', this.transactionForm.get('from_to_account')?.value);
      formData.append('from_to_account_company', this.transactionForm.get('from_to_account_company')?.value);
      formData.append('note_id', this.transactionForm.get('note_id')?.value || '');

      if(this.transactionForm.get('currency_value')?.value){
        formData.append('currency_price_value', this.transactionForm.get('currency_value')?.value);
      }

         if(this.pay_bill && this.transactionForm.get('sale_bill_id')?.value){
          if(this.type =='receipt'){
            formData.append('sale_bill_id', this.transactionForm.get('sale_bill_id')?.value);
          }else if(this.type =='payment'){
            formData.append('return_sale_bill', this.transactionForm.get('sale_bill_id')?.value);
          }



    }


      
      // formData.append('delegate_id', this.transactionForm.get('delegate_id')?.value || '');
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
            this.toastr.success('تم اضافه المستند بنجاح');
            this.router.navigate(['/dashboard/document/' + this.type +'/waiting']);

          }
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error('حدث خطا اثناء اضافه المستند');
          this.isLoading = false;
          console.log('error happend', err);

        }
      });

    }
  }





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


      this.needCurrecyPrice = false;
      this.forignCurrencyName = account.currency.name;

      if(this.selectedAccount) {
        if(this.selectedAccount.currency.id != this.currency.id){
          this.needCurrecyPrice = true;
          this.forignCurrencyName = account.currency.name;

        }      
      }

      if(this.selectedcompanyAccount) {
        if(this.selectedcompanyAccount.currency.id != this.currency.id){
          this.needCurrecyPrice = true;
          this.forignCurrencyName = account.currency.name;

        }      
      }



    }else if (this.selectedPopUP  == 'delegate'){
      this.selecteddelegateAccount = account;
      this.transactionForm.patchValue({'delegate_id':account.id})

    }else{
      this.selectedAccount = account;
      this.transactionForm.patchValue({'from_to_account':account.id})


      if(this.pay_bill){
        if(this.type =='receipt'){
          this.loadBills(account.id);
          }else if(this.type =='payment'){
          this.loadReturnBills(account.id);
          }
      }

      this.needCurrecyPrice = false;
      if(this.selectedAccount) {
        if(this.selectedAccount.currency.id != this.currency.id){
          this.needCurrecyPrice = true;
          this.forignCurrencyName = account.currency.name;

        }      
      }

      if(this.selectedcompanyAccount) {
        if(this.selectedcompanyAccount.currency.id != this.currency.id){
          this.needCurrecyPrice = true;
          this.forignCurrencyName = account.currency.name;

        }      
      }


    }
    this.closeModal('shiftModal');
  }





  loadReturnBills(clientId: string) {
    this._SalesService.getReturnBillsByClientId(clientId).subscribe({
      next: (response) => {
        if (response) {
          console.log("bills bills response:", response)
          this.saleBills = response.data;

        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }



saleBills :any;


  loadBills(clientId: string) {
    this._SalesService.getBillsByClientId(clientId).subscribe({
      next: (response) => {
        if (response) {
          console.log("bills bills response:", response)
          this.saleBills = response.data;

        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }


changeAmount(){
  const value = this.transactionForm.get('amount')?.value | 0;
  if(this.pay_bill && this.selectedBill){
    const toBePaid =this.selectedBill.total - this.selectedBill.total_paid;
    if(toBePaid < value){
           this.transactionForm.patchValue({'amount':toBePaid});

    }
  }


}

  removeCurrentDelegate(){
    this.selecteddelegateAccount =null;
   this.transactionForm.patchValue({'delegate_id':null});
  }

    closeModal(modalId: string) {
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        const modal = Modal.getInstance(modalElement);
        modal?.hide();
      }
    }
  
selectBill(bill:any){
  this.selectedBill = bill;
  console.log(bill)
  this.transactionForm.patchValue({sale_bill_id:bill.id,amount:bill.total-bill.total_paid});
  this.closeModal('salesModal');
}


    selectedBill:any;
    openModal(modalId: string , type:string) {
      this.searchQuery ='';

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


      openSalesModal(modalId: string) {
      this.searchQuery ='';

   
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        const modal = new Modal(modalElement);
        modal.show();
      }
    }
  

    
  onSearchChange(){
    if(this.selectedPopUP == 'company'){
      this.handelType();
    }
    // else if (this.selectedPopUP == 'delegate'){
    //   this.loadDelegates();
    // }
    else{
      this.handelType();
    }
  }


    updateData(){
    if(this.selectedPopUP == 'company'){
      this.filteredAccounts = this.compony_accounts;
    }
    
    // else if (this.selectedPopUP == 'delegate'){
    //   this.filteredAccounts = this.delegates;
    // }
    
    else{
      this.filteredAccounts = this.accounts;
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