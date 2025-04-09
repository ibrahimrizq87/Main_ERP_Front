import { Component } from '@angular/core';
import { PriceService } from '../../shared/services/price.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-price-category',
  standalone: true,
  imports: [CommonModule , ReactiveFormsModule ,TranslateModule],
  templateUrl: './add-price-category.component.html',
  styleUrl: './add-price-category.component.css'
})
export class AddPriceCategoryComponent {
  msgError: string = '';
  isLoading: boolean = false;

  constructor(private _PriceService:PriceService , private _Router: Router,private translate: TranslateService,private toastr: ToastrService) {
    // this.translate.setDefaultLang('en'); 
   
  }

  categoryForm: FormGroup = new FormGroup({
    name: new FormControl(null, [Validators.required,Validators.maxLength(255)]),
  });

  handleForm() {
   
    if (this.categoryForm.valid) {
      this.isLoading = true;

      const formData = new FormData();
    
      formData.append('name', this.categoryForm.get('name')?.value);
   

      this._PriceService.addCategory(formData).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.toastr.success('تم اضافه الفئه بنجاح');
            this.isLoading = false;
            this._Router.navigate(['/dashboard/priceCategory']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error('حدث خطا اثناء اضافه الفئه');
          this.isLoading = false;
           this.msgError = err.error.error;
          console.log(err);
        }
      });
    }
  }
}
