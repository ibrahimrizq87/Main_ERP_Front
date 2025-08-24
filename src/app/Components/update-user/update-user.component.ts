import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-user',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,TranslateModule],
  templateUrl: './update-user.component.html',
  styleUrl: './update-user.component.css'
})
export class UpdateUserComponent implements OnInit {
  msgError: string = '';
  isLoading: boolean = false;
  roles: any;

  constructor(private _UserService:UserService ,   private route: ActivatedRoute, private _Router: Router,private translate: TranslateService,private toastr: ToastrService) {
    // this.translate.setDefaultLang('en'); 
  }
  
  ngOnInit(): void {
    this.loadRoles();
    const userId = this.route.snapshot.paramMap.get('id'); 
    if (userId) {
      this.fetchUserData(userId);
    }
  }

  userForm: FormGroup = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    user_name: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required]),
    role_id: new FormControl(null, [Validators.required]),
    image: new FormControl(null)
  });
  fetchUserData(userId: string): void {
    this._UserService.getUserById(userId).subscribe({
      next: (response) => {
        if (response) {
          const userData = response.data ; 
          console.log(userData)
          this.userForm.patchValue({
            name:userData.name,
            user_name:userData.user_name,
            password:userData.password,
            role_id: userData.role_id,
            image:userData.image,
        
          });
         


        }
      },
      error: (err: HttpErrorResponse) => {
        this.msgError = err.error.error;
      }
    });
  }
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
      const userId = this.route.snapshot.paramMap.get('id');
      if (userId){
      this._UserService.updateUser(userId,formData).subscribe({
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
  onCancel(): void {
    this.userForm.reset();
   
    this._Router.navigate(['/dashboard/users']); 
  }  
}
