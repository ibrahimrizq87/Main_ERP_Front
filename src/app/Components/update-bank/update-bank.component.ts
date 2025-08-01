import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BankService } from '../../shared/services/bank.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-update-bank',
  standalone: true,
  imports: [CommonModule ,ReactiveFormsModule ,FormsModule ,TranslateModule],
  templateUrl: './update-bank.component.html',
  styleUrl: './update-bank.component.css'
})
export class UpdateBankComponent implements OnInit {
  msgError: string = '';
  msgSuccess:string ='';
  isLoading: boolean = false;
  bankForm: FormGroup ;
    constructor(
    private _BankService: BankService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.bankForm = new FormGroup({
      name_ar: new FormControl(null, [Validators.required,Validators.maxLength(255)]),
      name_en: new FormControl(null, [Validators.maxLength(255)]),
      type_bank:new FormControl(null, [Validators.required]),
     
    
    });
  }
    ngOnInit(): void {
    const bankId = this.route.snapshot.paramMap.get('id'); 
    if (bankId) {
      this.fetchBank(bankId);
    }
  }
  fetchBank(bankId: string): void {
    this._BankService.getBankById(bankId).subscribe({
      next: (response) => {
        if (response) {
          const bankData = response.data ; 
          console.log(bankData)
          this.bankForm.patchValue({
            name_ar: bankData.name_langs.ar,
            name_en: bankData.name_langs.en,
            type_bank:bankData.type
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.msgError = err.error.error;
      }
    });
  }
   handleForm(): void {
    if (this.bankForm.valid) {
      this.isLoading = true;
  
      const bankData = new FormData();
      bankData.append('name[ar]', this.bankForm.get('name_ar')?.value);
      bankData.append('name[en]', this.bankForm.get('name_en')?.value);
      bankData.append('type', this.bankForm.get('type_bank')?.value);
    
    
      const bankId = this.route.snapshot.paramMap.get('id');
      
      if (bankId) {
        this._BankService.updateBank(bankId, bankData).subscribe({
          next: (response) => {
            this.toastr.success('تم تعديل البنك بنجاح');
            this.isLoading = false;
            if (response) {
              this.msgSuccess = response;
              setTimeout(() => {
                this.router.navigate(['/dashboard/banks']);
              }, 2000);
            }
          },
          error: (err: HttpErrorResponse) => {
            this.toastr.error('حدث خطا اثناء تعديل البنك');
            this.isLoading = false;
            this.msgError = err.error.error;
          }
        });
      } else {
        this.isLoading = false;
        this.msgError = 'Bank ID is invalid.';
      }
    }
  } 
  onCancel(): void {
        this.bankForm.reset();
        this.router.navigate(['/dashboard/banks']); 
      }  
}

