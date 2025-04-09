import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DeterminantService } from '../../shared/services/determinants.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-update-determinant',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,TranslateModule],
  templateUrl: './update-determinant.component.html',
  styleUrl: './update-determinant.component.css'
})
export class UpdateDeterminantComponent {


submitted =false;
  msgError: string = '';
  isLoading: boolean = false;
  values: {value:string} [] =[];

  constructor(            private route: ActivatedRoute,
  private _DeterminantService:DeterminantService ,private _Router: Router,private translate: TranslateService,private toastr: ToastrService) {
  
  }


  ngOnInit() {

    const groupId = this.route.snapshot.paramMap.get('id'); 
    if (groupId) {
      this.loadDeterminant(groupId);
    }
  }
  loadDeterminant(id:string){

    this._DeterminantService.showDeterminantById(id).subscribe({
      next: (response) => {
        if (response) {
   
          const delegate =  response.data;
          this.determinantForm.patchValue({
            determinant: delegate.name,
        });
 
        delegate.values.forEach((value:any)=>{
          this.addValue(value);
        })
        

        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  addValue(myValue:any =null){

    if(myValue == null){
      const value = this.determinantForm.get('determinant_value')?.value;
      if(value)
        {
          this.values.push({value:value});
          this.determinantForm.patchValue({determinant_value:null});
        }
    }else{
      this.values.push({value:myValue.value});

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
   const groupId = this.route.snapshot.paramMap.get('id');
      
   if (groupId) {
      this._DeterminantService.updateDeterminant(groupId,formData).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.toastr.success('تم تعديل المحدد بنجاح');
            this.isLoading = false;
            this._Router.navigate(['/dashboard/productDeterminants']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.msgError = err.error.error;
          this.toastr.error('حدث خطا اثناء تعديل المحدد');
          console.log(err);
        }
      });
    }}
  }
}
