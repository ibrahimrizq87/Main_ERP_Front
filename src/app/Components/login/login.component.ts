import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { UserService } from '../../shared/services/user.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
// import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [HeaderComponent,RouterModule,FormsModule,CommonModule,ReactiveFormsModule ,TranslateModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  msgError: string = '';
  isLoading: boolean = false;

  constructor(private _UserService:UserService ,
    private _Router: Router,private toastr:ToastrService) {}

  loginForm: FormGroup = new FormGroup({
    user_name: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required, Validators.minLength(8)]),
  });

  handleForm() {
    if (this.loginForm.valid) {
      this.isLoading = true;

      const formData = new FormData();
      formData.append('user_name', this.loginForm.get('user_name')?.value);
      formData.append('password', this.loginForm.get('password')?.value);

      this._UserService.setLogin(formData).subscribe({
        next: (response) => {
          // console.log(response);
          if (response) {
            this.isLoading = false;

          
            localStorage.setItem('Token', response.data.token);
            this.toastr.success('تم تسجيل الدخول بنجاح');
            alert(response.message);

            // Call saveUserData() to decode and store the access_token
            // this._UserService.saveUserData();

          
            this._Router.navigate(['/dashboard']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error('حدث خطا اثناء تسجيل الدخول');
          this.isLoading = false;
          if(err.status == 422){
            this.msgError = err.error.errors;
          }
          // this.toastr.error(err.error.message);
          alert(err.error.message);

          // console.log(err);
          // console.log(err.error.message);  
          // console.log(err.error.errors);     
   
          // console.log(err.status);          
     
          // console.log('herere');


        }
      });
    }
  }

}
