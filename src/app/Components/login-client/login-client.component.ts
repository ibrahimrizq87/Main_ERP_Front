import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login-client',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './login-client.component.html',
  styleUrl: './login-client.component.css'
})
export class LoginClientComponent {
  msgError: string = '';
  isLoading: boolean = false;

  constructor(private _AuthService:AuthService ,
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

      this._AuthService.setLogin(formData).subscribe({
        next: (response) => {
          // console.log(response);
          if (response) {
            this.isLoading = false;

          
            localStorage.setItem('ClientToken', response.data.token);
            this.toastr.success(response.message);
          

          
            this._Router.navigate(['/dashboard']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error('حدث خطا اثناء تسجيل الدخول');
          this.isLoading = false;
          if(err.status == 422){
            this.msgError = err.error.errors;
          }
          this.toastr.error(err.error.message);

        }
      });
    }
  }

}
