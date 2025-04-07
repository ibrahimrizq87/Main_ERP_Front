import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AccountCategoriesService } from '../../shared/services/account_categories.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-account-category',
  standalone: true,
  imports: [CommonModule , ReactiveFormsModule ,TranslateModule],
  templateUrl: './add-account-category.component.html',
  styleUrl: './add-account-category.component.css'
})
export class AddAccountCategoryComponent {
 msgError: string = '';
  isLoading: boolean = false;
  type ='client';
  isSubmited =false;
  constructor(private _AccountCategoriesService:AccountCategoriesService ,
        private _Router: Router,
        private translate: TranslateService,
        private route: ActivatedRoute,
        private toastr: ToastrService
    
  ) {
   
  }

  categoryForm: FormGroup = new FormGroup({
    name: new FormControl(null, [Validators.required,Validators.maxLength(255)]),
  });


  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const newStatus = params.get('type');

      if(newStatus != 'client' && newStatus != 'vendor' && newStatus != 'delegate'){
        alert('worng type');
        this._Router.navigate(['/dashboard/account-categories/client']);

      }
      if (newStatus && this.type !== newStatus) {
          this.type = newStatus;
 
      }
    });

  }


  handleForm() {
   this.isSubmited = true;
    if (this.categoryForm.valid) {
      this.isLoading = true;

      const formData = new FormData();
    
      formData.append('name', this.categoryForm.get('name')?.value);
   
      formData.append('type', this.type);

      this._AccountCategoriesService.addAccountCategory(formData).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.toastr.success('تم اضافه الفئة بنجاح');
            this.isLoading = false;
            this._Router.navigate(['/dashboard/account-categories/'+ this.type]);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error('حدث خطا اثناء اضافه الفئة');
          this.isLoading = false;
           this.msgError = err.error.error;
          console.log(err);
        }
      });
    }
  }
}
