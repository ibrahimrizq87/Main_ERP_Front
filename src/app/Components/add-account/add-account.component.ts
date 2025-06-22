import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../shared/services/account.service'
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
// import { FormBuilder, FormGroup, FormsModule, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { GroupService } from '../../shared/services/group.service';
import { CityService } from '../../shared/services/city.service';
import { FormBuilder,ValidationErrors, AbstractControl,FormControl, FormGroup, FormArray, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreService } from '../../shared/services/store.service';
import { TranslateModule } from '@ngx-translate/core';

import { PriceService } from '../../shared/services/price.service';
import { CurrencyService } from '../../shared/services/currency.service';
import { ToastrService } from 'ngx-toastr';

interface Account {
  id: string;
  name_ar: string;
  name_en?: string;
  parent_id?: string;
  child?: Account[];
}
@Component({
  selector: 'app-add-account',
  standalone: true,
  imports:[CommonModule,FormsModule,ReactiveFormsModule,TranslateModule],
  // imports: [CommonModule, RouterLinkActive, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-account.component.html',
  styleUrl: './add-account.component.css'
})
export class AddAccountComponent implements OnInit {
  isBranchSelected = false;
  currencies: any[] = [];
  submitted: boolean = false;
  selectedCurrency: string = '';
  msgError: string = '';
  isLoading: boolean = false;
  accountForm: FormGroup;
  type: string | null = '';
  accountType:string='';
  barentID:string='';
  currentAccount: any;
  inputsDisabled: boolean = false;
  isAssetAccount: boolean = false;

  readonly maxImageSize = 2048 * 1024;
  constructor(private _AccountService: AccountService,
    private route: ActivatedRoute
    , private router: Router, private fb: FormBuilder
    , private _GroupService: GroupService,
    private _StoreService:StoreService,
    private _PriceService:PriceService,
    private _CurrencyService: CurrencyService,
    private toastr: ToastrService) {
    this.accountForm = this.fb.group({
      name_ar: this.fb.control(null, [Validators.required]),
      name_en: this.fb.control(null , [Validators.required]),
      net_balance: this.fb.control(0, [Validators.required, Validators.min(0)]),
      currency_id: this.fb.control(null),
    });
  }
  selectedFile: File | null = null;

 

  onCurrencyChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedCurrency =selectedValue;
  }

  ngOnInit(): void {
    this.getParams();
    this.loadCurrency();
  }

  getParams() {
    this.route.paramMap.subscribe(params => {
      this.type = params.get('type');
    });
    if (this.type == '611' || this.type == '421' || this.type == '622' || this.type == '621' || this.type == '623' || this.type == '624' ||this.type== '121') {
      // this.additionalInformation = true;
    }
    if (this.type != 'all') {
      this.accountType='child'
      this.getAccount(this.type || '');
    }else{
      // this.loadGroupsType();
    }


    if(this.type == '121'){
      this.isAssetAccount = true;
    }
  }
 
  loadCurrency(): void {
    this._CurrencyService.viewAllCurrency().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.currencies = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  getAccount(id: string) {
    this._AccountService.getAccountById(id).subscribe({
      next: (response) => {
        this.currentAccount = response.data;
      },
      error: (err) => {
        console.error(err);
      }
    })
  }
 
  handleForm() {
    this.submitted = true;
  
    if (this.accountForm.valid && this.selectedCurrency) {
      this.isLoading = true;
      const formData = new FormData();
      
      formData.append('start_balance', this.accountForm.get('net_balance')?.value);
      formData.append('currency_id', this.accountForm.get('currency_id')?.value);
      if(this.currentAccount){
        formData.append('parent_id', this.currentAccount.id);

      }else{
        this.toastr.error('A problem happend please relaod page');
        // alert('a problem happend please relaod page');
        return;
      }


      formData.append('name[ar]', this.accountForm.get('name_ar')?.value);
      formData.append('name[en]', this.accountForm.get('name_en')?.value);
    
      formData.append('currency_id',this.selectedCurrency);

    
     
      
      
      this._AccountService.addAccount(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log(response)
          if (response) {
            this.toastr.success('تم اضافه الحساب بنجاح');
            console.log(response)
            if (this.currentAccount) {
              this.router.navigate(['/dashboard/accounting/' + this.currentAccount.id]);
            } else {
              this.router.navigate(['/dashboard/accounting/all']);
            }
          }
        },
        error: (err: HttpErrorResponse) => {
          console.log(err.error)
          this.toastr.error('حدث خطا اثناء اضافه الحساب');
          this.isLoading = false;
          this.msgError = err.error.error;
        }
      });
    }
  }
  
}
