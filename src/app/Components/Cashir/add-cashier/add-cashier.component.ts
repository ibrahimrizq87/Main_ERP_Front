import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { Modal } from 'bootstrap';
import { AccountService } from '../../../shared/services/account.service';



@Component({
  selector: 'app-add-cashier',
  standalone: true,
  imports: [FormsModule,CommonModule,ReactiveFormsModule,TranslateModule],
  templateUrl: './add-cashier.component.html',
  styleUrl: './add-cashier.component.css'
})
export class AddCashierComponent {
isLoading: boolean = false;

selectedAccount: any;
selectedStore: any;
selectedEmployee: any;

  openModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }


    constructor(private _AccountService:AccountService ){
    }

  closeModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }
stores: any[] = [];
employees: any[] = [];
  accounts: any[] = [];

  searchQuery: string = '';

  selectEmployeee(event: any) {

  }

  selectStore(event: any) {
    
  }
  selectAccount(event: any) {
    
  }




    loadAccounts() {
    this._AccountService.getAccountsByParent('111').subscribe({
        next: (response) => {
        if (response) {
          console.log(response);
          this.accounts = response.data;

        }
      },
      error: (err) => {
        console.error(err);
      }
    
    });
  }




  onSearchChange() {
    // This method can be used to handle search input changes
    // For example, you can filter the list of accounts, stores, or employees based on the search query
  }
}
