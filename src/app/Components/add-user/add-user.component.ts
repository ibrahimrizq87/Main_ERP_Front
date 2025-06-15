import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../../shared/services/account.service';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [FormsModule,CommonModule,ReactiveFormsModule,TranslateModule],

  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css'
})
export class AddUserComponent implements OnInit {
  msgError: string = '';
  isLoading: boolean = false;
  roles: Role[] = [];
  accounts: any[] = [];

  constructor(private _AccountService:AccountService ,private _UserService:UserService,
     private _Router: Router,private translate: TranslateService,
     private toastr: ToastrService) {
    // this.translate.setDefaultLang('en'); 
  }
  
  ngOnInit(): void {
    this.loadRoles();
    this.loadAccounts();

  }
  loadAccounts() {
    this._AccountService.getAccountsByParent('111').subscribe({
      next: (data) => {
        this.accounts = data;
      },
      error: (err) => {
        console.error('Failed to load accounts', err);
      }
    });
  }
  selectedRole: any;
  onRoleChange(event: any) {
    const selectedRole = event.target.value;
    this.roles.forEach(role => {
      this.selectedRole = role.id === selectedRole;
    });
    console.log('Selected role:', this.selectedRole);
  }

  userForm: FormGroup = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    user_name: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required]),
    role_id: new FormControl(null, [Validators.required]),
    image: new FormControl(null)
  });
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.userForm.patchValue({ image: file });
    }
  }
  handleForm() {
   
    if (this.userForm.valid) {
      this.isLoading = true;

      const formData = new FormData();
    
      formData.append('name', this.userForm.get('name')?.value);
      formData.append('user_name', this.userForm.get('user_name')?.value);
      formData.append('password', this.userForm.get('password')?.value);
      formData.append('role_id', this.userForm.get('role_id')?.value);
      if( this.userForm.get('image')?.value){
        formData.append('image', this.userForm.get('image')?.value);
      }

      this._UserService.addUser(formData).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.toastr.success('تم اضافه المستخدم بنجاح');
            this.isLoading = false;
            this._Router.navigate(['/dashboard/users']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error('حدث خطا اثناء اضافه المستخدم');
          this.isLoading = false;
           this.msgError = err.error.error;
          console.log(err);
        }
      });
    }
  }
  loadRoles(): void {
    this._UserService.getAllRoLes().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.roles = response.data; 
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
onSearchChange(){

}


  closeModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }

searchQuery = '';


onSearchChanged(event: String) {
  console.log(event);
}

selectAccount(account: any) {
  console.log(account);
}



}



interface Role{
  id: number;
  name: string;
}
