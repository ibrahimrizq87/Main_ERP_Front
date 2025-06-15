import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Modal } from 'bootstrap';
import { AccountService } from '../../../shared/services/account.service';
import { StoreService } from '../../../shared/services/store.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { EmployeeService } from '../../../shared/services/employee.service';
import { CashierService } from '../../../shared/services/cashier.service';

@Component({
  selector: 'app-update-cashier',
  standalone: true,
  imports: [FormsModule,CommonModule,ReactiveFormsModule,TranslateModule],
  templateUrl: './update-cashier.component.html',
  styleUrl: './update-cashier.component.css'
})
export class UpdateCashierComponent {


isLoading: boolean = false;

selectedAccount: any;
selectedStore: any;
selectedEmployee: any;


  ngOnInit(): void {
    const cashier_id = this.route.snapshot.paramMap.get('id'); 
    if (cashier_id) {
      this.fetchCashierData(cashier_id);
    }



    this.loadAccounts(); 
    this.loadStores(); 
    this.loadEmployees();

  }

  fetchCashierData(id:string){
    this._CashierService.showCashierById(id).subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          const cashier = response.data;
          this.selectedAccount = cashier.account;
          this.selectedStore = cashier.store;
          this.selectedEmployee = {name: cashier.user.name, user_id: cashier.user.id};
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('An error occurred while fetching cashier data.');
      }
    });
  
}

  openModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }


    constructor(
      private _AccountService:AccountService,
      private _StoreService:StoreService,
      private _EmployeeService: EmployeeService,
      private toastr:ToastrService,    
      private _CashierService:CashierService,   
      private _Router: Router, 
      private route: ActivatedRoute,
      

    ){
    }

  closeModal(modalId: string) {
    this.searchQuery = '';
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }


  selectStore(event: any) {
    this.selectedStore = event;
    this.closeModal('storeModal');
    
  }

  onStoreSearchChange(){
  this.loadStores()
  }

  stores: any[] = [];
  storeSearchQuery: string = '';
  loadStores() {
        this._StoreService.getAllStores(
      'store', // type
      this.searchQuery, // name
      1, // page
      20 // perPage
        ).subscribe({
        next: (response) => {
        if (response) {
          console.log(response);
          this.stores = response.data;

        }
      },
      error: (err) => {
        console.error(err);
      }
    
    });
  }
  
  employees: any[] = [];
  accounts: any[] = [];
  // searchQuery: string = '';

  selectEmployeee(event: any) {
    this.selectedEmployee = event;
    this.closeModal('employeeModal');
  }

handelSubmit(){
  if (this.selectedAccount && this.selectedStore && this.selectedEmployee) {
    this.isLoading = true;
    const formData = new FormData();
    formData.append('account_id', this.selectedAccount.id);
    formData.append('store_id', this.selectedStore.id);
    formData.append('employee_id', this.selectedEmployee.user_id);


    this._CashierService.addCashier(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this._Router.navigate(['/dashboard/cashiers']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        console.error(err);
        if (err.error && err.error.error) {
          this.toastr.error(err.error.error);
        } else {
          this.toastr.error('An error occurred while adding the cashier.');
        }
      }
    });
  }
  else {
    this.isLoading = false;
    this.toastr.error('Please select an account, store, and employee before submitting.');
  }
}
  selectAccount(account: any) {
    this.selectedAccount = account;
    this.closeModal('accountModal');
    
  }

employeeSearchQuery: string = '';




    searchQuery: string = '';
    loadAccounts() {
    this._AccountService.getAccountsByParent(
      '111',
      this.searchQuery,
      1,
      20
    ).subscribe({
        next: (response) => {
        if (response) {
          console.log(response);
          this.accounts = response.data.accounts;

        }
      },
      error: (err) => {
        console.error(err);
      }
    
    });
  }


   loadEmployees() {
    this._EmployeeService.getEmployeesForPopup(
      this.searchQuery,
      1,
      20
    ).subscribe({
        next: (response) => {
        if (response) {
          console.log(response);
          this.employees = response.data.employees;

        }
      },
      error: (err) => {
        console.error(err);
      }
    
    });
  }


  onAccountSearchChange() {
    this.loadAccounts();
  }

  onSearchChange() {
    this.loadEmployees();
  }
}
