import { Component } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-roles',
  standalone: true,
  imports: [TranslateModule,ReactiveFormsModule,CommonModule],
  templateUrl: './add-roles.component.html',
  styleUrl: './add-roles.component.css'
})
export class AddRolesComponent {
  msgError: string = '';
  isLoading: boolean = false;

  constructor(private _UserService:UserService , private _Router: Router,private toastr: ToastrService) {
   
  }

  roleForm: FormGroup = new FormGroup({
    name: new FormControl(null, [Validators.required,Validators.maxLength(255)]),
  });

  handleForm() {
    if (this.roleForm.valid) {
      this.isLoading = true;
  
      const formData = new FormData();
      formData.append('name', this.roleForm.get('name')?.value);
  
      this._UserService.addRole(formData).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.toastr.success('تم إضافة الدور بنجاح');
            this.isLoading = false;
            this._Router.navigate(['/dashboard/roles']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error('حدث خطأ أثناء إضافة الدور');
          this.isLoading = false;
          this.msgError = err.error.error;
          console.log(err);
        }
      });
    }
  }
  
}
