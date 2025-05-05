import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../shared/services/account.service';
import { CommonModule } from '@angular/common';
import { AccountnodeComponent } from '../accountnode/accountnode.component';
import { TranslateModule } from '@ngx-translate/core';
import { Modal } from 'bootstrap';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

interface Account {
  id: string;
  name: string;
  type: string;
  parent_id?: string;
  child?: Account[];
  showChildren?: boolean;
}

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, AccountnodeComponent,TranslateModule,FormsModule,ReactiveFormsModule],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {
  currencies: any[] = [];
  groups: any[] = [];
  parentAccounts: Account[] = [];
  hierarchicalAccounts: Account[] = [];
  type: string | null = '';
  isSubmitted=false;
  isLoading =false;
  accountImportForm: FormGroup = new FormGroup({
    file: new FormControl(null, [Validators.required]),
  });
  constructor(private _AccountService: AccountService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    // this.getParams();
    this.loadGroups();
  }
  // getParams() {
  //   this.route.paramMap.subscribe(params => {
  //     this.type = params.get('type');
  //   });
  // }

  loadGroups(): void {

    this._AccountService.getAllMainAccounts().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);

          this.parentAccounts = response.data;
          this.hierarchicalAccounts = this.buildAccountHierarchy(this.parentAccounts);
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  // Recursively build the hierarchy with toggle property initialized
  buildAccountHierarchy(accounts: Account[]): Account[] {
    return accounts.map(account => ({
      ...account,
      showChildren: false, // Initialize as collapsed
      child: account.child ? this.buildAccountHierarchy(account.child) : []
    }));
  }
  exportAccounts() {
    this._AccountService.exportAccountsData().subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'accounts.xlsx'); 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      error: (err) => {
        console.error("Error downloading file:", err);
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
  closeModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
   this.accountImportForm.patchValue({file:null});  
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }

  onFileColorSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.accountImportForm.patchValue({ file: file }); 
      console.log(file)
      this.accountImportForm.get('file')?.updateValueAndValidity();
    }else{
      console.error('No file selected');
    }
    
  }
  handleForm(){
    this.isSubmitted =true;
      if (this.accountImportForm.valid) {
          this.isLoading = true;

    const formData = new FormData();
    const file = this.accountImportForm.get('file')?.value;

    if (file instanceof File) { 
      formData.append('file', file, file.name);
    } else {
      console.error('Invalid file detected:', file);
      return; 
    }
    this._AccountService.importAccountsData(formData).subscribe({
      next: (response) => {
        console.log(response);
        if (response) {
          this.isLoading = false; 
          this.closeModal('ImportForm');       
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
         
      }
    });
  }
      }

}