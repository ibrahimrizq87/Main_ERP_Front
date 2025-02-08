import { Component } from '@angular/core';
import { ProductsService } from '../../shared/services/products.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-product-determinants',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,TranslateModule],
  templateUrl: './add-product-determinants.component.html',
  styleUrl: './add-product-determinants.component.css'
})
export class AddProductDeterminantsComponent {

  msgError: string = '';
  isLoading: boolean = false;

  constructor(private _ProductsService:ProductsService ,private _Router: Router,private translate: TranslateService) {
  
  }


  determinantForm: FormGroup = new FormGroup({
    determinant : new FormControl(null, [Validators.required]),
  });

  handleForm() {
   
    if (this.determinantForm.valid) {
      this.isLoading = true;

      const formData = new FormData();
    
      formData.append('determinant', this.determinantForm.get('determinant')?.value);
   

      this._ProductsService.addProductDeterminants(formData).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.isLoading = false;
            this._Router.navigate(['/dashboard/productDeterminants']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
           this.msgError = err.error.error;
          console.log(err);
        }
      });
    }
  }
}
