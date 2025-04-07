import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../../shared/services/account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from '../../shared/services/group.service';
// import { CityService } from '../../shared/services/city.service';
import { CommonModule } from '@angular/common';
import { CheckService } from '../../shared/services/check.service';
import { CurrencyService } from '../../shared/services/currency.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-check-operations',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,CommonModule,TranslateModule],
  templateUrl: './check-operations.component.html',
  styleUrl: './check-operations.component.css'
})
export class CheckOperationsComponent {
  checkOerationForm : FormGroup;
  isLoading:boolean = false;
  additionalInformation=false;
  needRequiredAccount=false;
  requiredAcounts:Account [] =[];
  checks:Check [] =[];
  entryItems :EntryItem [] =[];
  selectedCheck:any;
  selectedAccount:any;
  delegates:any;
  needReasone:boolean =false;
  currencies:any;
  selectedOperation:number = 100;

  sameBankAcount:boolean =false;
operations = [
  'تحصيل الشيكات الواردة',
  'ايداع الشيكات الواردة',
  'تحقيق الشيكات الصادرة',
  'صرف الشيكات الواردة نقدا',
  'صرف الشيكات الصادرة نقدا',
  'ارجاع الشيكات الواردة الى الصندوق',
  'ارجاع الشيكات الواردة الى الزمم',
  'ارجاه الشيكات الصادرة فيها مشكلة مشكلة',
  "سحب الشيكات الواردة الى الصندوق",
  "نقل الشيكات الواردة",
  "ألغاء الشيكات الصادرة",
  "ارجاع الشيكات المجيرة الى الصندوق",
  "ارجاع الشيكات المجيرة الى الذمم",

]
  constructor(private _AccountService: AccountService,
    private route: ActivatedRoute
    , private router: Router, private fb: FormBuilder
    , private _GroupService: GroupService,
  private _CheckService:CheckService,
private _CurrencyService:CurrencyService,
    private toastr: ToastrService
) {
    this.checkOerationForm = this.fb.group({
      type: this.fb.control("", [Validators.required]),
      check: this.fb.control(""),
      requiredAccount: this.fb.control(""),
      organization: ['', Validators.maxLength(255)],
      currency_id: ['', Validators.required],
      delegate_id: [''],
      note: ['', Validators.maxLength(255)],
      date: [this.getTodayDate()],
      reasone: [''],
      manual_reference: [''],


      
    });
  }

  ngOnInit() {
    this.loadCurrencies();
    this.loadDelegates()
  }

  loadDelegates() {
    this._AccountService.getAccountsByParent('623').subscribe({
      next: (response) => {
        if (response) {
          this.delegates = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }


  loadCurrencies(){
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
  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  addItem(){
    this.addEntryItem();  
  }
  addEntryItem(){
console.log('heree');
console.log(this.selectedOperation);

    switch (this.selectedOperation) {
      case 0:
        if (this.selectedCheck){

          this._AccountService.getAccountByParentAndBank(this.selectedCheck.payed_to.id , 113).subscribe({
            next:(respons) =>{
              this.selectedAccount = respons.data;
              console.log('respons:',respons);

              const existingItem = this.entryItems.find(item => item.check.id === this.selectedCheck.id);
              if (existingItem) {
                this.toastr.error('This check has already been added. can not do two oprations on one check');
                alert('This check has already been added. can not do two oprations on one check');
              } else {

              this.entryItems.push({
                amount: parseInt(this.selectedCheck.amount),
                check:this.selectedCheck,
                creditor: this.selectedCheck.payed_to,
                debitor: this.selectedAccount,
                operation: this.selectedOperation,

                // case:0   
                     });
              this.selectedCheck=null;
              this.selectedAccount=null;
              // this.checkOerationForm.get('requiredAccount')?.setValue('');
              this.checkOerationForm.get('check')?.setValue('');
            }


            },error:(err) =>{
              console.log('error',err);
            },
          });
          
      
      }else{
        this.toastr.error('you need to select an check');
          alert('you need to select an check')
        }

        // Case for 'تحصيل الشيكات الواردة'
      
        break;
  
      case 1:
        console.log(this.selectedCheck);
        console.log(this.selectedAccount);

        if (this.selectedCheck &&  this.selectedAccount){

          const existingItem = this.entryItems.find(item => item.check.id === this.selectedCheck.id);
          if (existingItem) {
            this.toastr.error('This check has already been added. can not do two oprations on one check');
            alert('This check has already been added. can not do two oprations on one check');
          } else {
          this.entryItems.push({
            amount: parseInt(this.selectedCheck.amount),
            check:this.selectedCheck,
            creditor: this.selectedCheck.payed_to,
            debitor: this.selectedAccount,
            operation: this.selectedOperation,

            // case:-1    
                });
          this.selectedCheck=null;
          this.selectedAccount=null;
          this.checkOerationForm.get('requiredAccount')?.setValue('');
          this.checkOerationForm.get('check')?.setValue('');
        }}else{
          this.toastr.error('you need to select an check');
          alert('you need to select an account')
        }

        console.log(this.entryItems);

// source_account:Account,
        // Case for 'ايداع الشيكات الواردة'
        break;
  
      case 2:
        if (this.selectedCheck){

          this._AccountService.getAccountByParentAndBank(this.selectedCheck.source_account.id , 113).subscribe({
            next:(respons) =>{
              this.selectedAccount = respons.data;
              console.log('respons:',respons);

              const existingItem = this.entryItems.find(item => item.check.id === this.selectedCheck.id);
              if (existingItem) {
                this.toastr.error('This check has already been added. can not do two oprations on one check');
                alert('This check has already been added. can not do two oprations on one check');
              } else {

              this.entryItems.push({
                amount: parseInt(this.selectedCheck.amount),
                check:this.selectedCheck,
                creditor:this.selectedAccount,
                debitor: this.selectedCheck.source_account,
                operation: this.selectedOperation,

                // case:0    
                    });
              this.selectedCheck=null;
              this.selectedAccount=null;
              // this.checkOerationForm.get('requiredAccount')?.setValue('');
              this.checkOerationForm.get('check')?.setValue('');
            }


            },error:(err) =>{
              console.log('error',err);
            },
          });
          
      
      }else{
          this.toastr.error('you need to select an check');
          alert('you need to select an check')
        }
        // Case for 'تحقيق الشيكات الصادرة'
        break;
  
      case 3:

      if (this.selectedCheck &&  this.selectedAccount){

        const existingItem = this.entryItems.find(item => item.check.id === this.selectedCheck.id);
        if (existingItem) {
          this.toastr.error('This check has already been added. can not do two oprations on one check');
          alert('This check has already been added. can not do two oprations on one check');
        } else {
        this.entryItems.push({
          amount: parseInt(this.selectedCheck.amount),
          check:this.selectedCheck,
          creditor:this.selectedCheck.payed_to,
          debitor:  this.selectedAccount,
          operation: this.selectedOperation,

          // case:-1  
              });
        this.selectedCheck=null;
        this.selectedAccount=null;
        this.checkOerationForm.get('requiredAccount')?.setValue('');
        this.checkOerationForm.get('check')?.setValue('');
      }}else{
        this.toastr.error('you need to select an check');
        alert('you need to select an account')
      }

        // Case for 'صرف الشيكات الواردة نقدا'
        break;
  
      case 4:
        if (this.selectedCheck &&  this.selectedAccount){

          const existingItem = this.entryItems.find(item => item.check.id === this.selectedCheck.id);
          if (existingItem) {
            this.toastr.error('This check has already been added. can not do two oprations on one check');
            alert('This check has already been added. can not do two oprations on one check');
          } else {
          this.entryItems.push({
            amount: parseInt(this.selectedCheck.amount),
            check:this.selectedCheck,
            creditor: this.selectedAccount,
            debitor: this.selectedCheck.source_account,
            operation: this.selectedOperation,

            // case:-1  
                  });
          this.selectedCheck=null;
          this.selectedAccount=null;
          this.checkOerationForm.get('requiredAccount')?.setValue('');
          this.checkOerationForm.get('check')?.setValue('');
        }}else{
          this.toastr.error('you need to select an check');
          alert('you need to select an account')
        }
        // Case for 'صرف الشيكات الصادرة نقدا'
        console.log("Selected operation: صرف الشيكات الصادرة نقدا");
        break;
  
      case 5:
        if (this.selectedCheck &&  this.selectedAccount){

          const existingItem = this.entryItems.find(item => item.check.id === this.selectedCheck.id);
          if (existingItem) {
            this.toastr.error('This check has already been added. can not do two oprations on one check');
            alert('This check has already been added. can not do two oprations on one check');
          } else {
          this.entryItems.push({
            amount: parseInt(this.selectedCheck.amount),
            check:this.selectedCheck,
            creditor:this.selectedCheck.payed_to,
            debitor:  this.selectedAccount,
            operation: this.selectedOperation,

            // case:-1     
               });
          this.selectedCheck=null;
          this.selectedAccount=null;
          this.checkOerationForm.get('requiredAccount')?.setValue('');
          this.checkOerationForm.get('check')?.setValue('');
        }}else{
          this.toastr.error('you need to select an check');
          alert('you need to select an account')
        }
        // Case for 'ارجاع الشيكات الواردة الى الصندوق'
        console.log("Selected operation: ارجاع الشيكات الواردة الى الصندوق");
        break;
  
      case 6:

      if (this.selectedCheck){

        const existingItem = this.entryItems.find(item => item.check.id === this.selectedCheck.id);
        if (existingItem) {
          this.toastr.error('This check has already been added. can not do two oprations on one check');
          alert('This check has already been added. can not do two oprations on one check');
        } else {
        this.entryItems.push({
          amount: parseInt(this.selectedCheck.amount),
          check:this.selectedCheck,
          creditor:this.selectedCheck.payed_to,
          debitor:this.selectedCheck.main_source,
          operation: this.selectedOperation,

          // case:-1    
            });
        this.selectedCheck=null;
        this.selectedAccount=null;
        // this.checkOerationForm.get('requiredAccount')?.setValue('');
        this.checkOerationForm.get('check')?.setValue('');
      }}else{
        this.toastr.error('you need to select an check');
        alert('you need to select an account')
      }
        // Case for 'ارجاع الشيكات الواردة الى الزمم'
        console.log("Selected operation: ارجاع الشيكات الواردة الى الزمم");
        break;
  
      case 7:
        // Case for 'ارجاه الشيكات الصادرة'
        console.log("Selected operation: ارجاه الشيكات الصادرة");
        break;
  
      case 8:

      if (this.selectedCheck &&  this.selectedAccount){

        const existingItem = this.entryItems.find(item => item.check.id === this.selectedCheck.id);
        if (existingItem) {
          this.toastr.error('This check has already been added. can not do two oprations on one check');
          alert('This check has already been added. can not do two oprations on one check');
        } else {
        this.entryItems.push({
          amount: parseInt(this.selectedCheck.amount),
          check:this.selectedCheck,
          creditor: this.selectedCheck.payed_to,
          debitor: this.selectedAccount,
          operation: this.selectedOperation,

          // case:-1   
             });
        this.selectedCheck=null;
        this.selectedAccount=null;
        this.checkOerationForm.get('requiredAccount')?.setValue('');
        this.checkOerationForm.get('check')?.setValue('');
      }}else{
        this.toastr.error('you need to select an check');
        alert('you need to select an account')
      }
        // Case for 'سحب الشيكات الواردة الى الصندوق'
        console.log("Selected operation: سحب الشيكات الواردة الى الصندوق");
        break;
  
      case 9:
        if (this.selectedCheck &&  this.selectedAccount){

          const existingItem = this.entryItems.find(item => item.check.id === this.selectedCheck.id);
          if (existingItem) {
            this.toastr.error('This check has already been added. can not do two oprations on one check');
            alert('This check has already been added. can not do two oprations on one check');
          } else {
          this.entryItems.push({
            amount: parseInt(this.selectedCheck.amount),
            check:this.selectedCheck,
            creditor: this.selectedCheck.payed_to,
            debitor: this.selectedAccount,
            operation: this.selectedOperation,

            // case:-1     
               });
          this.selectedCheck=null;
          this.selectedAccount=null;
          this.checkOerationForm.get('requiredAccount')?.setValue('');
          this.checkOerationForm.get('check')?.setValue('');
        }}else{
          this.toastr.error('you need to select an check');
          alert('you need to select an account')
        }
        // Case for 'نقل الشيكات الواردة'
        console.log("Selected operation: نقل الشيكات الواردة");
        break;
  
      case 10:
        if (this.selectedCheck ){

          const existingItem = this.entryItems.find(item => item.check.id === this.selectedCheck.id);
          if (existingItem) {
            this.toastr.error('This check has already been added. can not do two oprations on one check');
            alert('This check has already been added. can not do two oprations on one check');
          } else {
          this.entryItems.push({
            amount: parseInt(this.selectedCheck.amount),
            check:this.selectedCheck,
            creditor: this.selectedCheck.payed_to,
            debitor: this.selectedCheck.source_account,
            operation: this.selectedOperation,

            // case:-1
          });
          this.selectedCheck=null;
          this.selectedAccount=null;
          // this.checkOerationForm.get('requiredAccount')?.setValue('');
          this.checkOerationForm.get('check')?.setValue('');
        }}else{
          this.toastr.error('you need to select an check');
          alert('you need to select an account')
        }
        // Case for 'ألغاء الشيكات الصادرة'
        console.log("Selected operation: ألغاء الشيكات الصادرة");
        break;
  
      case 11:
        // Case for 'ارجاع الشيكات المجيرة الى الصندوق'
        console.log("Selected operation: ارجاع الشيكات المجيرة الى الصندوق");
        break;
  
      case 12:
        // Case for 'ارجاع الشيكات المجيرة الى الذمم'
        console.log("Selected operation: ارجاع الشيكات المجيرة الى الذمم");
        break;
  
      default:
        console.log("Unknown operation selected");
    }

  }

  getAccounts(ids : number []){
    console.log(ids);
    this._AccountService.getChildrenByParentIds(ids).subscribe({
     next: (response)=>{
this.requiredAcounts = response.data;

// console.log('required data', this.requiredAcounts);
// console.log('required data', response);

},
      error: (err)=>{
console.log(err);
      }
    })
  }
//   getChecks(to:number|null , from:number|null , type:string){
//    this._CheckService.getChecksForOperations(to,from,type).subscribe({
//     next:(response)=>{
// console.log(response);
// this.checks = response.data;

//     },error: (err)=>{
//       console.log(err);

//     }
//    })
//   }

getChecks(type:number){
  this._CheckService.getChecksForOperations(type).subscribe({
   next:(response)=>{
console.log(response);
this.checks = response.data;

   },error: (err)=>{
     console.log(err);

   }
  })
 }
  onCheckChange(event: Event){
    const selectedValue = (event.target as HTMLSelectElement).value;
    console.log(selectedValue);
    this.selectedCheck = this.checks.find(check => check.id === parseInt(selectedValue));
  
  
    if (this.selectedCheck) {
      console.log("Selected Check:", this.selectedCheck);
      // this.addEntryItem();
     

    } else {
      console.log("No check found with the selected ID.");
    }
  }
  onTypeChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    console.log(selectedValue);
  
    // Convert selected value to integer index
    const selectedIndex = parseInt(selectedValue, 10);
  this.selectedOperation = selectedIndex;
    switch (selectedIndex) {
      case 0:
        // this.needRequiredAccount = true;
        // this.getAccounts([113]);

        // this.getChecks(118 , 112 , 'incoming');
        this.sameBankAcount = true;
        this.getChecks(0);

        // Case for 'تحصيل الشيكات الواردة'
        console.log("Selected operation: تحصيل الشيكات الواردة");
        break;
  
      case 1:

      this.needRequiredAccount = true;
      this.getAccounts([113 , 118]);
      
      // this.getChecks(112 , null , 'incoming');
      this.getChecks(1);
        // Case for 'ايداع الشيكات الواردة'
        console.log("Selected operation: ايداع الشيكات الواردة");
        break;
  
      case 2:

      // this.needRequiredAccount = true;
      // this.getAccounts([113]);

      // this.getChecks(6 , 211 , 'outgoing');
      this.sameBankAcount = true;
      this.getChecks(2);
        // Case for 'تحقيق الشيكات الصادرة'
        console.log("Selected operation: تحقيق الشيكات الصادرة");
        break;
  
      case 3:


      this.needRequiredAccount = true;
      this.getAccounts([111]);

      // this.getChecks(112 , null , 'incoming');
      this.getChecks(3);
        // Case for 'صرف الشيكات الواردة نقدا'
        console.log("Selected operation: صرف الشيكات الواردة نقدا");
        break;
  
      case 4:

      this.needRequiredAccount = true;
      this.getAccounts([111]);

      // this.getChecks(6 , 211 , 'outgoing');
      this.getChecks(4);
        // Case for 'صرف الشيكات الصادرة نقدا'
        console.log("Selected operation: صرف الشيكات الصادرة نقدا");
        break;
  
      case 5:

      this.needRequiredAccount = true;
      this.getAccounts([112]);

      // this.getChecks(113 , null , 'incoming');
      this.getChecks(5);
        // Case for 'ارجاع الشيكات الواردة الى الصندوق'
        console.log("Selected operation: ارجاع الشيكات الواردة الى الصندوق");
        break;
  
      case 6:
        this.needRequiredAccount = false;
        // this.getAccounts([111]);
        this.getChecks(6);
        // this.getChecks(113 , 112 , 'incoming');
        // Case for 'ارجاع الشيكات الواردة الى الزمم'
        console.log("Selected operation: ارجاع الشيكات الواردة الى الزمم");
        break;
  
      case 7:
        // Case for 'ارجاه الشيكات الصادرة'
        console.log("Selected operation: ارجاه الشيكات الصادرة");
        break;
  
      case 8:

      this.needRequiredAccount = true;
      this.getAccounts([112]);

      // this.getChecks(118 , 112 , 'incoming');
      this.getChecks(8);
        // Case for 'سحب الشيكات الواردة الى الصندوق'
        console.log("Selected operation: سحب الشيكات الواردة الى الصندوق");
        break;
  
      case 9:
        this.needRequiredAccount = true;
        this.getAccounts([112]);
        this.getChecks(9);
        // this.getChecks(113 , 112 , 'incoming');
  
        // Case for 'نقل الشيكات الواردة'
        console.log("Selected operation: نقل الشيكات الواردة");
        break;
  
      case 10:

      this.needRequiredAccount = false;
        // this.getAccounts([112]);
        this.getChecks(10);
        // this.getChecks(6 , 211 , 'outgoing');
        // Case for 'ألغاء الشيكات الصادرة'
        console.log("Selected operation: ألغاء الشيكات الصادرة");
        break;
  
      case 11:

      this.needRequiredAccount = false;
      // this.getAccounts([112]);
      this.getChecks(11);
      // this.getChecks(null , null , 'endorsed');
        // Case for 'ارجاع الشيكات المجيرة الى الصندوق'
        console.log("Selected operation: ارجاع الشيكات المجيرة الى الصندوق");
        break;
  
      case 12:
        // Case for 'ارجاع الشيكات المجيرة الى الذمم'
        console.log("Selected operation: ارجاع الشيكات المجيرة الى الذمم");
        break;
  
      default:
        console.log("Unknown operation selected");
    }
  }
  
  onRequiredAccountChange(event:Event){
    const selectedValue = (event.target as HTMLSelectElement).value;
    console.log(selectedValue);
    this.selectedAccount = this.requiredAcounts.find(account => account.id === parseInt(selectedValue));
    // this.addEntryItem();

  }


  handleForm() {
    // this.submitted = true;

    if (this.checkOerationForm.valid && this.entryItems.length>0){

      this.isLoading = true;

      const formData = new FormData();
      formData.append('manual_reference', this.checkOerationForm.get('manual_reference')?.value || '');
      formData.append('date', this.checkOerationForm.get('date')?.value );
      formData.append('organization', this.checkOerationForm.get('organization')?.value || '');
      formData.append('currency_id', this.checkOerationForm.get('currency_id')?.value );
      formData.append('delegate_id', this.checkOerationForm.get('delegate_id')?.value || '');
      formData.append('note', this.checkOerationForm.get('note')?.value || '');

      // const entryItems = this.entryForm.get('entryItems') as FormArray;
      
      this.entryItems.forEach((item, index) => {
      
        formData.append(`entryItems[${index}][creditor]`, item.creditor.id);
        formData.append(`entryItems[${index}][debitor]`, item.debitor.id);
        formData.append(`entryItems[${index}][amount]`, item.amount.toString());
        formData.append(`entryItems[${index}][check]`, item.check.id);
        formData.append(`entryItems[${index}][operation]`, item.operation.toString());

        // operation: this.selectedOperation,

        // if(item.case >= 0){
        //   formData.append(`entryItems[${index}][case]`, item.case.toString());
        // }


      });
      this._CheckService.AddOperationOnCheck(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response) {
          this.toastr.success('تمت العمليه بنجاح');
          this.router.navigate(['/dashboard/check_list/waiting']);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.toastr.error('حدث خطا اثناء العمليه');
        this.isLoading = false;
        console.log(err);
      }
    });
    
    }
  }
}



interface Check {
  id:number,
amount:number,
due_date:string,
check_number:number,
payed_to:Account,
source_account:Account,
}

interface Account {
  id:number,
name:string,
}

interface EntryItem {
  creditor:any,
debitor:any,
amount:number,
check:any,
operation:number
}

