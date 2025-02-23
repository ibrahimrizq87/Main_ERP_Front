import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ProductUnitsService } from '../../shared/services/product_units.service';

@Component({
  selector: 'app-add-product-unit',
  standalone: true,
  imports: [CommonModule,FormsModule ,ReactiveFormsModule,TranslateModule ],
  templateUrl: './add-product-unit.component.html',
  styleUrl: './add-product-unit.component.css'
})
export class AddProductUnitComponent {
  msgError: string = '';
  isLoading: boolean = false;

  constructor(private _ProductUnitsService:ProductUnitsService ,private _Router: Router,private translate: TranslateService) {
  
  }


  unitForm: FormGroup = new FormGroup({
    unit: new FormControl(null, [Validators.required,Validators.maxLength(255)]),
  });

  handleForm() {
   
    if (this.unitForm.valid) {
      this.isLoading = true;

      const formData = new FormData();
    
      formData.append('name', this.unitForm.get('unit')?.value);
   

      this._ProductUnitsService.addProductUnit(formData).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.isLoading = false;
            this._Router.navigate(['/dashboard/productUnit']);
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
