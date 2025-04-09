
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ColorService } from '../../shared/services/colors.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-update-color',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule ,TranslateModule],
  templateUrl: './update-color.component.html',
  styleUrl: './update-color.component.css'
})
export class UpdateColorComponent {

  isSubmitted = false;
  msgError: string = '';
  isLoading: boolean = false;

  constructor(private route: ActivatedRoute,
    private _ColorService:ColorService , private _Router: Router,private translate: TranslateService,
  private toastr: ToastrService) {
   
  }


  colorForm: FormGroup = new FormGroup({
    color: new FormControl(null, [Validators.required]),
    color_code: new FormControl('#000000', [Validators.required])

  });
  ngOnInit(): void {
    const currency_id = this.route.snapshot.paramMap.get('id'); 
    if (currency_id) {
      this.fetchColorData(currency_id);
    }
  }


  fetchColorData(id:string){
    this._ColorService.getColorById(id).subscribe({
      next: (response) => {
        if (response) {
          const currencyData = response.data ; 
          console.log(currencyData)
          this.colorForm.patchValue({
            color:currencyData.color,
            color_code:currencyData.color_code ?? null,
          
           
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.msgError = err.error.error;
      }
    });
  }
  handleForm() {
    this.isSubmitted = true;
    if (this.colorForm.valid) {
      this.isLoading = true;

      const formData = new FormData();
    
      formData.append('color', this.colorForm.get('color')?.value);
      formData.append('color_code', this.colorForm.get('color_code')?.value || '');



      const country_id = this.route.snapshot.paramMap.get('id');

      this._ColorService.updateColor(country_id || '',formData).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.toastr.success('تم تعديل اللون بنجاح');
            this.isLoading = false;        
            this._Router.navigate(['/dashboard/colors']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error('حدث خطا اثناء تعديل اللون');
          this.isLoading = false;
           this.msgError = err.error.error;
          console.log(err);
        }
      });
    }
  }
}
