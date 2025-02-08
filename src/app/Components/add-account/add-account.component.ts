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
  mainGroups: any[] = [];
  subGroups: any[] = [];
  submitted: boolean = false;
  priceCategories: any[] = []; 
  selectedGroup: string = '';
  selectedCurrency: string = '';
  msgError: string = '';
  isLoading: boolean = false;
  parentAccounts: Account[] = [];
  hierarchicalAccounts: any[] = [];
  hierarchicalStores: any[] = [];
  accountForm: FormGroup;
  type: string | null = '';
  accountType:string='';
  barentID:string='';
  additionalInformation: boolean = false;
  currentAccount: any;
  citiesByCountry: { [key: string]: any[] } = {};
  countries: any[] = [];
  delegates:any[]=[];
  disosables:any[]=[];
  expenses:any[]=[];
  inputsDisabled: boolean = false;
  readonly maxImageSize = 2048 * 1024;
  constructor(private _AccountService: AccountService,
    private route: ActivatedRoute
    , private router: Router, private fb: FormBuilder
    , private _GroupService: GroupService,
    private _StoreService:StoreService,
    private _PriceService:PriceService,
    private _CityService: CityService) {
    this.accountForm = this.fb.group({
      name_ar: this.fb.control(null, [Validators.required]),
      name_en: this.fb.control(null),
      net_balance: this.fb.control(0, [Validators.required, Validators.min(0)]),
      type: this.fb.control("branch", [Validators.required]),
      groupId: this.fb.control(this.selectedGroup),
      group_branch_Id: this.fb.control(this.selectedGroup),
      currency_id: this.fb.control(null),
      parent_id: this.fb.control(null),

      phones: this.fb.array([]),
      addresses: this.fb.array([]),
      store_id:this.fb.control(null),
      category_price_id:this.fb.control(null),
      delegate_id:this.fb.control(null),
      
      
      
      
      id_number:this.fb.control('',[Validators.maxLength(20)]),
      birthdate:this.fb.control(''),
      image: this.fb.control(null, [this.validateImage.bind(this)]),
      name:this.fb.control(''),
      on_job: this.fb.control(false),
      salary: this.fb.control('',[Validators.min(0)]),
      start_date: this.fb.control(''),
      end_date: this.fb.control (''),
      start_work: this.fb.control(''),
      end_work: this.fb.control(''),
      paid_type: this.fb.control(''),
      invoice_number: this.fb.control(0),

      
      exception_consumption:this.fb.control(false),
      percentage:this.fb.control(0,[Validators.min(0),Validators.max(100)]),
      start_consumption:this.fb.control(''),
      number:this.fb.control(0,[Validators.min(0)]),
      consumption_complex_account_id:this.fb.control(null),
      consumption_expense_account_id:this.fb.control(null)
     
      
    });
    this.addPhoneNumber();
    this.addAddress(); 
    this.loadDelegates();
  }
  selectedFile: File | null = null;

 
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.accountForm.patchValue({ image: file });
    }
  }
  toggleInputs(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.accountForm.get('start_consumption')?.disable();
      this.accountForm.get('number')?.disable();
      this.accountForm.get('percentage')?.disable();
      this.accountForm.get('consumption_complex_account_id')?.disable();
      this.accountForm.get('consumption_expense_account_id')?.disable();
    } else {
      this.accountForm.get('start_consumption')?.enable();
      this.accountForm.get('number')?.enable();
      this.accountForm.get('percentage')?.enable();
      this.accountForm.get('consumption_complex_account_id')?.enable();
      this.accountForm.get('consumption_expense_account_id')?.enable();
    }
  }
 
  validateImage(control: AbstractControl): ValidationErrors | null {
    const file = this.selectedFile;
    if (file) {
      const fileType = file.type;
      const fileSize = file.size;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(fileType)) {
        return { invalidFileType: true };
      }
      if (fileSize > this.maxImageSize) {
        return { fileTooLarge: true };
      }
    }
    return null; 
  }
  onGroupChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedGroup =selectedValue;
    this.getSubGroups(this.selectedGroup);
  }
  onSubGroupChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedGroup =selectedValue;
    // this.getSubGroups(this.selectedGroup);
  }
  onCurrencyChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedCurrency =selectedValue;
  }
  getSubGroups(id:string){
    this._GroupService.getGroupsById(id).subscribe({
      next: (response) => {
        if (response) {
          console.log(response)
          this.subGroups = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  ngOnInit(): void {
    this.getParams();

    this.loadGroups();
    this.loadCities();
    this.loadStores();
    this.loadPriceCategories();
    this.loadDelegates();
    this.loadDisosables();
    this.loadExpenses();
    // this.loadGroupsType();
  }

  getParams() {
    this.route.paramMap.subscribe(params => {
      this.type = params.get('type');
    });
    if (this.type == '611' || this.type == '421' || this.type == '622' || this.type == '621' || this.type == '623' || this.type == '624' ||this.type== '121') {
      this.additionalInformation = true;
    }
    if (this.type != 'all') {
      this.accountType='child'
      this.getAccount(this.type || '');
    }else{
      this.loadGroupsType();
    }
  }
 
  loadCities(): void {
    this._CityService.viewAllCities().subscribe({
      next: (response) => {
        if (response) {
          this.citiesByCountry = {};
          response.data.forEach((city: any) => {
            if (!this.citiesByCountry[city.country]) {
              this.citiesByCountry[city.country] = [];
            }
            this.citiesByCountry[city.country].push(city);
          });
          this.countries = Object.keys(this.citiesByCountry);
        }
      },
      error: (err) => console.error(err)
    });
  }
  loadStores(): void {
    this._StoreService.getAllStores().subscribe({
      next: (response) => {
        if (response) {
          console.log(response)
         
          this.parentAccounts = response.data;
         
          this.hierarchicalStores = this.buildAccountHierarchy(this.parentAccounts);
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  loadPriceCategories(): void {
    this._PriceService.viewAllCategory().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.priceCategories = response.data; 
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

 

  get phones(): FormArray {
    return this.accountForm.get('phones') as FormArray;
  }

  addPhoneNumber() {
    this.phones.push(this.fb.group({
      phone: [''],
      type: ['mobile'] 
    }));
  }

  removePhoneNumber(index: number) {
    if (this.phones.length > 1) {
      this.phones.removeAt(index);
    }
  }
  get addresses(): FormArray {
    return this.accountForm.get('addresses') as FormArray;
  }
  removeAddress(index: number) {
    if (this.addresses.length > 1) {
      this.addresses.removeAt(index);
    }
  }
 
  addAddress() {
    this.addresses.push(this.fb.group({
      address: [''],
      city_id: [null]
    }));
  }

  getAccount(id: string) {
    this._AccountService.getAccountById(id).subscribe({
      next: (response) => {
        this.currentAccount = response.data;
        this.selectedGroup = this.currentAccount.group.id;
        if( this.currentAccount.group.has_children){
          this.getSubGroups(this.selectedGroup);
        }
        this.barentID=this.currentAccount.id;
        console.log("current account herer ::::",response);

         console.log("current account herer ::::",this.currentAccount);
      },
      error: (err) => {
        console.error(err);
      }
    })
  }
  loadGroups(): void {
    this._AccountService.getData().subscribe({
      next: (response) => {
        if (response) {
          console.log(response)
          // this.groups = response.group;
          this.parentAccounts = response.accounts;
          this.currencies = response.currencies;
          console.log(response.currencies)
          this.hierarchicalAccounts = this.buildAccountHierarchy(this.parentAccounts);
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  loadGroupsType(): void {
    this._GroupService.groupsMain().subscribe({
      next: (response: any) => {
        this.mainGroups = response.data;
        console.log("main group:" , this.mainGroups)
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }
  buildAccountHierarchy(accounts: Account[]): any[] {
    return accounts.map(account => ({
      ...account,
      children: account.child ? this.buildAccountHierarchy(account.child) : []
    }));
  }

  onTypeChange(event: any) {
    const selectedType = event.target.value;
    this.isBranchSelected = selectedType === 'branch';

    if (this.isBranchSelected) {
      this.accountForm.get('parent_id')?.setValidators([Validators.required]);
    } else {
      this.accountForm.get('parent_id')?.clearValidators();
      this.accountForm.get('parent_id')?.setValue(null);
    }
    this.accountForm.get('parent_id')?.updateValueAndValidity();
  }
  loadExpenses(): void {
      this._AccountService.getAccountsByParent('42').subscribe({
        next: (response) => {
          if (response) {
            console.log("Expenses",response)
            const expenses = response.data;
            expenses.forEach((account: { hasChildren: any; id: any; }) => {
              account.hasChildren = expenses.some((childAccount: { parent_id: any; }) => childAccount.parent_id === account.id);
            });
    
            this.expenses = expenses;
          }
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
    loadDisosables(): void {
      this._AccountService.getAccountsByParent('122').subscribe({
        next: (response) => {
          if (response) {
            console.log("Disosables",response)
            const disosables = response.data;
            disosables.forEach((account: { hasChildren: any; id: any; }) => {
              account.hasChildren = disosables.some((childAccount: { parent_id: any; }) => childAccount.parent_id === account.id);
            });
    
            this.disosables = disosables;
          }
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
    loadDelegates(): void {
      this._AccountService.getAccountsByParent('623').subscribe({
        next: (response) => {
          if (response) {
            console.log("delegates",response)
            const delegates = response.data;
            delegates.forEach((account: { hasChildren: any; id: any; }) => {
              account.hasChildren = delegates.some((childAccount: { parent_id: any; }) => childAccount.parent_id === account.id);
            });
    
            this.delegates = delegates;
          }
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
    
selectedPayType:string ='nan';
    onPayTypeChange(event:Event){
      const selectedValue = (event.target as HTMLSelectElement).value;
      this.selectedPayType =selectedValue;
    }
  handleForm() {
    this.submitted = true;
    console.log('currency', this.selectedCurrency);
    console.log('parent_id', this.barentID);
  
    if (this.accountForm.valid && this.selectedGroup && this.selectedCurrency) {
      this.isLoading = true;
      const formData = new FormData();
      formData.append('name_ar', this.accountForm.get('name_ar')?.value);
      formData.append('name_en', this.accountForm.get('name_en')?.value || '');
      formData.append('net_balance', this.accountForm.get('net_balance')?.value);
      formData.append('currency_id', this.accountForm.get('currency_id')?.value || '');
      formData.append('group_id', this.selectedGroup);
      formData.append('type', this.accountForm.get('type')?.value);
  
      if (this.isBranchSelected) {
        formData.append('parent_id', this.accountForm.get('parent_id')?.value);
      } else if (this.accountType == 'child') {
        formData.append('parent_id', this.barentID);
        console.log('parent_id', this.barentID);
        formData.append('type_account', 'account');
      }
  
      // Check if type is 623 and add additional information
      if (this.type === '623'||this.type === '611'||this.type === '622' || this.type === '121') {
        // Add phone information
        this.phones.controls.forEach((phoneControl, index) => {
          formData.append(`phones[${index}][phone]`, phoneControl.get('phone')?.value);
          formData.append(`phones[${index}][type]`, phoneControl.get('type')?.value);
        });
  
        // Add address information
        this.addresses.controls.forEach((addressControl, index) => {
          formData.append(`addresses[${index}][address]`, addressControl.get('address')?.value);
          formData.append(`addresses[${index}][city_id]`, addressControl.get('city_id')?.value);
        });
      }
      if (this.type === '623'){
        // Add store_id and category_price_id if available
        formData.append('store_id', this.accountForm.get('store_id')?.value || '');
        formData.append('category_price_id', this.accountForm.get('category_price_id')?.value || '');
      }
      if (this.type === '611'){
        formData.append('delegate_id', this.accountForm.get('delegate_id')?.value || '');
        formData.append('paid_type', this.accountForm.get('paid_type')?.value);
        formData.append('value', this.accountForm.get('invoice_number')?.value || "0");

      }
      if (this.type === '622'){
        if(this.selectedFile){
        formData.append('image', this.selectedFile ||'');
        }
        formData.append('id_number', this.accountForm.get('id_number')?.value || '');
        formData.append('name', this.accountForm.get('name')?.value || '');
        formData.append('on_job', this.accountForm.get('on_job')?.value ||false);
        // formData.append('on_job', JSON.stringify(this.accountForm.get('on_job')?.value));
        formData.append('birthdate', this.accountForm.get('birthdate')?.value || '');
        formData.append('salary', this.accountForm.get('salary')?.value || '');
        formData.append('start_date', this.accountForm.get('start_date')?.value || '');
        formData.append('end_date', this.accountForm.get('end_date')?.value || '');
        formData.append('start_work', this.accountForm.get('start_work')?.value || '');
        formData.append('end_work', this.accountForm.get('end_work')?.value || '');

      }
     
      if(this.type==='121'){
        formData.append('exception_consumption', this.accountForm.get('exception_consumption')?.value);
        formData.append('percentage', this.accountForm.get('percentage')?.value || '');
        formData.append('start_consumption', this.accountForm.get('start_consumption')?.value);
        console.log('Percentage Value:', this.accountForm.get('percentage')?.value);

        formData.append('number', this.accountForm.get('number')?.value || '');
        formData.append('consumption_complex_account_id', this.accountForm.get('consumption_complex_account_id')?.value || '');
        formData.append('consumption_expense_account_id', this.accountForm.get('consumption_expense_account_id')?.value || '');
      }
      
      this._AccountService.addAccount(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log(response)
          if (response) {
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
          this.isLoading = false;
          this.msgError = err.error.error;
        }
      });
    }
  }
  
}
