import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductsService } from '../../shared/services/products.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-update-product-unit',
  standalone: true,
  imports: [CommonModule , FormsModule , ReactiveFormsModule,TranslateModule],
  templateUrl: './update-product-unit.component.html',
  styleUrl: './update-product-unit.component.css'
})
export class UpdateProductUnitComponent implements OnInit {
  msgError: string = '';
  msgSuccess:string ='';
  isLoading: boolean = false;
  unitForm: FormGroup ;
    constructor(
    private _ProductsService: ProductsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.unitForm = new FormGroup({
      unit: new FormControl(null, [Validators.required]),
     
    
    });
  }
    ngOnInit(): void {
    const unitId = this.route.snapshot.paramMap.get('id'); 
    if (unitId) {
      this.fetchProductsUnits(unitId);
    }
  }
  fetchProductsUnits(unitId: string): void {
    this._ProductsService.getUnitById(unitId).subscribe({
      next: (response) => {
        if (response) {
          const UnitsData = response.data ; 
          console.log(UnitsData)
          this.unitForm.patchValue({
            unit: UnitsData.unit,
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.msgError = err.error.error;
      }
    });
  }
   handleForm(): void {
    if (this.unitForm.valid) {
      this.isLoading = true;
  
      const unitsData = new FormData();
      unitsData.append('unit', this.unitForm.get('unit')?.value);
    
    
      const unitId = this.route.snapshot.paramMap.get('id');
      
      if (unitId) {
        this._ProductsService.updateUnit(unitId, unitsData).subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response) {
              this.msgSuccess = response;
              setTimeout(() => {
                this.router.navigate(['/dashboard/productUnit']);
              }, 2000);
            }
          },
          error: (err: HttpErrorResponse) => {
            this.isLoading = false;
            this.msgError = err.error.error;
          }
        });
      } else {
        this.isLoading = false;
        this.msgError = 'unit ID is invalid.';
      }
    }
  } 
  onCancel(): void {
        this.unitForm.reset();
       
        this.router.navigate(['/dashboard/productUnit']); 
      }  
}

