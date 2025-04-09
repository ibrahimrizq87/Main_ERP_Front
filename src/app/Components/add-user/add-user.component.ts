import { Component } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [FormsModule,CommonModule,ReactiveFormsModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css'
})
export class AddUserComponent {
  msgError: string = '';
  isLoading: boolean = false;

  constructor(private _UserService:UserService , private _Router: Router,private translate: TranslateService,private toastr: ToastrService) {
    // this.translate.setDefaultLang('en'); 
  }


  userForm: FormGroup = new FormGroup({
    user_name: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required]),
    role: new FormControl(null, [Validators.required]),
  });

  handleForm() {
   
    if (this.userForm.valid) {
      this.isLoading = true;

      const formData = new FormData();
    
      formData.append('user_name', this.userForm.get('user_name')?.value);
      formData.append('password', this.userForm.get('password')?.value);
      formData.append('role', this.userForm.get('role')?.value);


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
}
