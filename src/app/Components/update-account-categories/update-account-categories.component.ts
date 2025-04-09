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
  selector: 'app-update-account-categories',
  standalone: true,
  imports: [CommonModule , ReactiveFormsModule ,TranslateModule],
  templateUrl: './update-account-categories.component.html',
  styleUrl: './update-account-categories.component.css'
})
export class UpdateAccountCategoriesComponent {

 msgError: string = '';
  isLoading: boolean = false;
  type ='client';

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
    const bankId = this.route.snapshot.paramMap.get('id'); 
    if (bankId) {
      this.fetchCategory(bankId);
    }

  }
  fetchCategory(id:string){
    this._AccountCategoriesService.getAllAccountCategoryById(id).subscribe({
      next: (response) => {
        if (response) {
          const bankData = response.data ; 
          console.log(bankData)
          this.categoryForm.patchValue({
            name: bankData.name,
          
          });


          this.type = bankData.type;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.msgError = err.error.error;
      }
    });


  }

  handleForm() {
   
    if (this.categoryForm.valid) {
      this.isLoading = true;

      const formData = new FormData();
    
      formData.append('name', this.categoryForm.get('name')?.value);
   
      const categoryId = this.route.snapshot.paramMap.get('id');
      
      if (categoryId) {
      this._AccountCategoriesService.updateAccountCategory(categoryId ,formData  ).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.toastr.success('تم تعديل الفئة بنجاح');
            this.isLoading = false;
            this._Router.navigate(['/dashboard/account-categories/'+ this.type ]);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error('حدث خطا اثناء تعديل الفئة');
          
          this.isLoading = false;
           this.msgError = err.error.error;
          console.log(err);
        }
      });}
    }
  }
}
