import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DeterminantService } from '../../shared/services/determinants.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-product-determinants',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,TranslateModule],
  templateUrl: './add-product-determinants.component.html',
  styleUrl: './add-product-determinants.component.css'
})
export class AddProductDeterminantsComponent {
submitted =false;
  msgError: string = '';
  isLoading: boolean = false;
  values: {value:string} [] =[];

  constructor(private _DeterminantService:DeterminantService ,private _Router: Router,private translate: TranslateService,private toastr: ToastrService) {
    this.translate.setDefaultLang(localStorage.getItem('lang') || 'ar');
  
  }
  addValue(){
    const value = this.determinantForm.get('determinant_value')?.value;
    if(value)
      {
        this.values.push({value:value});
        this.determinantForm.patchValue({determinant_value:null});
      }
  }
  removeValue(index: number): void {
    this.values.splice(index, 1);
  }
  determinantForm: FormGroup = new FormGroup({
    determinant : new FormControl(null, [Validators.required]),
    determinant_value : new FormControl(null),
  });

  handleForm() {
   this.submitted =true;
    if (this.determinantForm.valid && this.values.length>0) {
      this.isLoading = true;

      const formData = new FormData();
    
      formData.append('name', this.determinantForm.get('determinant')?.value);
   this.values.forEach((value, index)=>{
    formData.append(`values[${index}][value]`, value.value);
   });

      this._DeterminantService.addDeterminant(formData).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.toastr.success('تم اضافه المحدد بنجاح');
            this.isLoading = false;
            this._Router.navigate(['/dashboard/productDeterminants']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error('حدث خطا اثناء اضافه المحدد');
          this.isLoading = false;
           this.msgError = err.error.error;
          console.log(err);
        }
      });
    }
  }
}
