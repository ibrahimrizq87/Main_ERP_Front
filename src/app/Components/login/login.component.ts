import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { UserService } from '../../shared/services/user.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [HeaderComponent,RouterModule,FormsModule,CommonModule,ReactiveFormsModule ,TranslateModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  msgError: string = '';
  isLoading: boolean = false;

  constructor(
    private _UserService: UserService,
    private _Router: Router,
    private toastr: ToastrService,
    private _AuthService: AuthService
  ) {}

  loginForm: FormGroup = new FormGroup({
    user_name: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required, Validators.minLength(8)]),
  });

  ngOnInit(): void {
    // Only check auth state if token exists
    if (localStorage.getItem('Token')) {
      this.getMyInfo();
    }
  }

  getMyInfo() {
    this._AuthService.getMyInfo().subscribe({
      next: (response) => {
        if (response) {
          this.redirectBasedOnRole(response.data.user.role);
        }
      },
      error: (err: HttpErrorResponse) => {
        // Clear invalid token if request fails
        localStorage.removeItem('Token');
        console.log(err);
      }
    });
  }

  handleForm() {
    if (this.loginForm.valid) {
      this.isLoading = true;

      const formData = new FormData();
      formData.append('user_name', this.loginForm.get('user_name')?.value);
      formData.append('password', this.loginForm.get('password')?.value);

      this._UserService.setLogin(formData).subscribe({
        next: (response) => {
          if (response) {
            localStorage.setItem('Token', response.data.token);
            this.toastr.success(response.message);
            
            // Get user info after successful login
            this._AuthService.getMyInfo().subscribe({
              next: (userInfo) => {
                console.log(userInfo);
                this.isLoading = false;
                this.redirectBasedOnRole(userInfo.data.user.role);
              },
              error: (err) => {
                this.isLoading = false;
                this._Router.navigate(['/']);
              }
            });
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          if(err.status == 422) {
            this.msgError = err.error.errors;
          }
          this.toastr.error(err.error.message || 'حدث خطا اثناء تسجيل الدخول');
        }
      });
    }
  }

  private redirectBasedOnRole(role: string): void {
    if (role === 'worker'|| role === 'admin') {
      this._Router.navigate(['/dashboard']);
    } else {
      // Default route for client or any other role
      this._Router.navigate(['/']);
    }
  }
}