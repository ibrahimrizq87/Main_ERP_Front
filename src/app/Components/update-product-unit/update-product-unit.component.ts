import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ProductUnitsService } from '../../shared/services/product_units.service';
import { ToastrService } from 'ngx-toastr';

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
    private _ProductUnitsService: ProductUnitsService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
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
    this._ProductUnitsService.getAllProductUnitById(unitId).subscribe({
      next: (response) => {
        if (response) {
          const UnitsData = response.data ; 
          console.log(UnitsData)
          this.unitForm.patchValue({
            unit: UnitsData.name,
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
      unitsData.append('name', this.unitForm.get('unit')?.value);
    
    
      const unitId = this.route.snapshot.paramMap.get('id');
      
      if (unitId) {
        this._ProductUnitsService.updateProductUnit(unitId, unitsData).subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response) {
              this.toastr.success('تم تعديل الوحدة بنجاح');
              this.msgSuccess = response;
              setTimeout(() => {
                this.router.navigate(['/dashboard/productUnit']);
              }, 2000);
            }
          },
          error: (err: HttpErrorResponse) => {
            this.toastr.error('حدث خطا اثناء تعديل الوحدة');
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

