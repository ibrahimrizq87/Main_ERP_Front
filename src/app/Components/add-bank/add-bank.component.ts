import { Component } from '@angular/core';
import { BankService } from '../../shared/services/bank.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-bank',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule ,TranslateModule],
  templateUrl: './add-bank.component.html',
  styleUrl: './add-bank.component.css'
})
export class AddBankComponent {
  msgError: string = '';
  isLoading: boolean = false;

  constructor(private _BankService:BankService ,private _Router: Router,private translate: TranslateService) {
  
  }


  bankForm: FormGroup = new FormGroup({
    name_ar: new FormControl(null, [Validators.required,Validators.maxLength(255)]),
    name_en: new FormControl(null, [Validators.maxLength(255)]),
    type_bank:new FormControl(null, [Validators.required]),
  });

  handleForm() {
   
    if (this.bankForm.valid) {
      this.isLoading = true;

      const formData = new FormData();
    
      formData.append('name[ar]', this.bankForm.get('name_ar')?.value);
      formData.append('name[en]', this.bankForm.get('name_en')?.value);
      formData.append('type', this.bankForm.get('type_bank')?.value);
      
   

      this._BankService.addBank(formData).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.isLoading = false;
            this._Router.navigate(['/dashboard/banks']);
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
