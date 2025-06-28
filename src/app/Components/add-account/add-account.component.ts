import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../shared/services/account.service'
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { GroupService } from '../../shared/services/group.service';
import { FormBuilder, ValidationErrors, AbstractControl, FormControl, FormGroup, FormArray, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreService } from '../../shared/services/store.service';
import { TranslateModule } from '@ngx-translate/core';
import { Modal } from 'bootstrap';

import { PriceService } from '../../shared/services/price.service';
import { CurrencyService } from '../../shared/services/currency.service';
import { ToastrService } from 'ngx-toastr';

interface Account {
  id: string;
  name_ar: string;
  name_en?: string;
  parent_id?: string;
  child?: Account[];
}
@Component({
  selector: 'app-add-account',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './add-account.component.html',
  styleUrl: './add-account.component.css'
})
export class AddAccountComponent implements OnInit {
  isBranchSelected = false;
  isSubmited = false;
  currencies: any[] = [];
  submitted: boolean = false;
  selectedCurrency: string = '';
  msgError: string = '';
  isLoading: boolean = false;
  accountForm: FormGroup;
  type: string | null = '';
  accountType: string = '';
  barentID: string = '';
  currentAccount: any;
  inputsDisabled: boolean = false;
  isAssetAccount: boolean = false;

  readonly maxImageSize = 2048 * 1024;
  constructor(private _AccountService: AccountService,
    private route: ActivatedRoute
    , private router: Router, private fb: FormBuilder
    , private _GroupService: GroupService,
    private _StoreService: StoreService,
    private _PriceService: PriceService,
    private _CurrencyService: CurrencyService,
    private toastr: ToastrService) {
    this.accountForm = this.fb.group({
      name_ar: this.fb.control(null, [Validators.required]),
      name_en: this.fb.control(null, [Validators.required]),
      net_balance: this.fb.control(0, [Validators.required, Validators.min(0)]),
      currency_id: this.fb.control(null),
      start_date: this.fb.control(null),
      period_number: this.fb.control(1),
      purchase_price: this.fb.control(null),
      current_price: this.fb.control(null),
      precentage: this.fb.control(null),

      collection_account_ar: this.fb.control(null),
      collection_account_en: this.fb.control(null),
      // collectionAccountType:this.fb.control(null),

    });
  }
  selectedFile: File | null = null;

  collectionAccountType = 'new';
  collectionTpyeChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.collectionAccountType = selectedValue;

  }
  onCurrencyChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedCurrency = selectedValue;
  }

  ngOnInit(): void {
    this.getParams();
    this.loadCurrency();

    if (this.isAssetAccount) {
      this.loadCollectionAccounts();
      this.loadExpensesAccounts();
    }
  }
  selectedExpensesAccount: any;
  selectedCollectionAccount: any;

  expensesAccounts: any;
  collectionAccounts: any;
  filteredAccounts: any;

  popupType = '';
  searchQuery = '';


  loadCollectionAccounts() {
    this._AccountService.getAccountsByParent('122'
      , this.searchQuery
    ).subscribe({
      next: (response) => {
        if (response) {
          const cashAccounts = response.data.accounts;
          this.collectionAccounts = cashAccounts;
          console.log('collection  accounts: ', cashAccounts)

          this.updateAccounts();
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  loadExpensesAccounts() {
    this._AccountService.getAccountsByParent('42'
      , this.searchQuery
    ).subscribe({
      next: (response) => {
        if (response) {
          const cashAccounts = response.data.accounts;
          this.expensesAccounts = cashAccounts;
          console.log('expenses accounts: ', cashAccounts)
          this.updateAccounts();
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  selectAccount(account: any) {
    if (this.popupType == 'collection') {
      this.selectedCollectionAccount = account;
    } else if (this.popupType == 'expenses') {
      this.selectedExpensesAccount = account;
    }
    this.closeModal('accountModal');
  }


  closeModal(modalId: string) {
    this.searchQuery = '';
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }

  openModal(modalId: string, type: string) {
    this.searchQuery = '';
    this.popupType = type;

    if (type == 'collection') {
      this.filteredAccounts = this.collectionAccounts;
    } else if (type == 'expenses') {
      this.filteredAccounts = this.expensesAccounts;
    }

    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }


  updateAccounts() {
    if (this.popupType == 'collection') {
      this.filteredAccounts = this.collectionAccounts;
    } else if (this.popupType == 'expenses') {
      this.filteredAccounts = this.expensesAccounts;
    }
  }



  onSearchChange() {
    if (this.popupType == 'collection') {
      this.loadCollectionAccounts();
    } else if (this.popupType == 'expenses') {
      this.loadExpensesAccounts();
    }
  }

  getParams() {
    this.route.paramMap.subscribe(params => {
      this.type = params.get('type');
    });
    if (this.type == '611' || this.type == '421' || this.type == '622' || this.type == '621' || this.type == '623' || this.type == '624' || this.type == '121') {
      // this.additionalInformation = true;
    }
    if (this.type != 'all') {
      this.accountType = 'child'
      this.getAccount(this.type || '');
    } else {
      // this.loadGroupsType();
    }


    if (this.type == '121') {
      this.isAssetAccount = true;
    }
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
  getAccount(id: string) {
    this._AccountService.getAccountById(id).subscribe({
      next: (response) => {
        this.currentAccount = response.data;
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  handleForm() {
    this.submitted = true;
    let error = false;


    if (this.isAssetAccount) {

      //       start_date: this.fb.control(null),
      // period_number: this.fb.control(1),
      // purchase_price: this.fb.control(null),
      // current_price: this.fb.control(null),
      // precentage: this.fb.control(null),


      if (!this.selectedExpensesAccount ||
        !this.accountForm.get('start_date')?.value ||
        !this.accountForm.get('period_number')?.value ||
        !this.accountForm.get('purchase_price')?.value ||
        !this.accountForm.get('current_price')?.value ||
        !this.accountForm.get('precentage')?.value ||
        (this.collectionAccountType == 'new' && (!this.accountForm.get('collection_account_ar')?.value || !this.accountForm.get('collection_account_en')?.value)) ||
        this.collectionAccountType == 'select' && (!this.selectedCollectionAccount)
      ) {
        this.toastr.error('Please make sure to enter all data');
        error = true;
      }
    }
    if (this.accountForm.valid && this.selectedCurrency && !error) {
      this.isLoading = true;
      const formData = new FormData();

      formData.append('start_balance', this.accountForm.get('net_balance')?.value);
      formData.append('currency_id', this.accountForm.get('currency_id')?.value);
      if (this.currentAccount) {
        formData.append('parent_id', this.currentAccount.id);

      } else {
        this.toastr.error('A problem happend please relaod page');
        return;
      }


      formData.append('name[ar]', this.accountForm.get('name_ar')?.value);
      formData.append('name[en]', this.accountForm.get('name_en')?.value);

      formData.append('currency_id', this.selectedCurrency);



      if (this.isAssetAccount) {


        //       start_date: this.fb.control(null),
        // period_number: this.fb.control(1),
        // purchase_price: this.fb.control(null),
        // current_price: this.fb.control(null),
        // precentage: this.fb.control(null),

        formData.append('expenses_account_id', this.selectedExpensesAccount.id);
        formData.append('purchase_price', this.accountForm.get('purchase_price')?.value);
        formData.append('current_price', this.accountForm.get('current_price')?.value);
        formData.append('current_period', this.accountForm.get('period_number')?.value);
        formData.append('precentage', this.accountForm.get('precentage')?.value);
        formData.append('start_date', this.accountForm.get('start_date')?.value);



        if (this.collectionAccountType == 'new') {
          formData.append('collection_name[ar]', this.accountForm.get('collection_account_ar')?.value);
          formData.append('collection_name[en]', this.accountForm.get('collection_account_en')?.value);

        } else {
          formData.append('collection_account_id', this.selectedCollectionAccount.id);
        }

      }





      this._AccountService.addAccount(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log(response)
          if (response) {
            this.toastr.success('تم اضافه الحساب بنجاح');
            console.log(response)
            if (this.currentAccount) {
              this.router.navigate(['/dashboard/accounting/' + this.currentAccount.id]);
            } else {
              this.router.navigate(['/dashboard/accounting/all']);
            }
          }
        },
        error: (err: HttpErrorResponse) => {
          console.log(err.error)
          this.toastr.error('حدث خطا اثناء اضافه الحساب');
          this.isLoading = false;
          this.msgError = err.error.error;
        }
      });
    }
  }

}
