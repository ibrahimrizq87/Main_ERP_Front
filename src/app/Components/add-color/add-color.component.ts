
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ColorService } from '../../shared/services/colors.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-add-color',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule ,TranslateModule],
  templateUrl: './add-color.component.html',
  styleUrl: './add-color.component.css'
})
export class AddColorComponent {
  color='';
  isSubmitted = false;
  msgError: string = '';
  isLoading: boolean = false;

  constructor(private _ColorService:ColorService , private _Router: Router,private translate: TranslateService,private toastr: ToastrService) {
    // this.translate.setDefaultLang('en'); 
  }


  colorForm: FormGroup = new FormGroup({
    color: new FormControl(null, [Validators.required]),
    color_code: new FormControl('#000000', [Validators.required])

  });

  handleForm() {

    this.isSubmitted = true;
   
    if (this.colorForm.valid) {
      this.isLoading = true;

      const formData = new FormData();
    
      formData.append('color', this.colorForm.get('color')?.value);
      formData.append('color_code', this.colorForm.get('color_code')?.value || '');

      this._ColorService.addColor(formData).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.toastr.success('تم اضافه اللون بنجاح');
            this.isLoading = false;        
            this._Router.navigate(['/dashboard/colors']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error('حدث خطا اثناء اضافه اللون');
          this.isLoading = false;
           this.msgError = err.error.error;
          console.log(err);
        }
      });
    }
  }
}
