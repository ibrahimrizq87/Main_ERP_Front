import { Component } from '@angular/core';
import { FormBuilder, ValidationErrors, AbstractControl, FormControl, FormGroup, FormArray, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AccountSettingService } from '../../shared/services/account_settings.service';
import { AccountService } from '../../shared/services/account.service';
import { Modal } from 'bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.css'
})
export class AccountSettingsComponent {
  maxOrder = 0;
  numbers: number[] = [];
  accounts:Account [] = [];
  filteredAccounts: Account[] = [];
  selectedSetting: MainAccountNavSetting | null = null;
  settings: MainAccountNavSetting[] = [];



  searchQuery: string = '';



  // filteredAccounts() {
  //   return this.accounts.filter(account =>
  //     account.name.toLowerCase().includes(this.searchQuery.toLowerCase())
  //   );
  // }
  onSearchChange(){
    this.filteredAccounts = this.accounts.filter(account =>
      account.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    console.log(this.accounts)
  }

  currentLanguage: string = 'en';

  mainAccountForm: FormGroup;
  isLoading = false;
  isSubmited = false;

  constructor(private fb: FormBuilder,
     private _AccountSettingService: AccountSettingService,
     private _AccountService: AccountService,private toastr: ToastrService) {
    this.mainAccountForm = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      order: ['', [Validators.required, Validators.pattern('^[0-9]+$')]]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
    this.loadAccounts();

    this.currentLanguage = localStorage.getItem('language') || 'en';


  }

  loadSettings(): void {
    this._AccountSettingService.getMainAccountNav().subscribe({
      next: (response) => {
        if (response) {
          console.log(response.data);
          this.settings = response.data;
        }
        this.maxOrder = this.settings.length + 1;
        this.numbers = Array.from({ length: this.maxOrder }, (_, i) => i + 1);
      },
      error: (err) => {
        console.error(err);
        // this.isLoading = false;
      }
    });
  }

  selectAccount(account:Account){
    this.selectedAccount = account;
    this.closeModal('shiftModal');
  }



  loadAccounts(): void {
    this._AccountService.getAllHasChildren().subscribe({
      next: (response) => {
        if (response) {
          console.log(response.data); 
          this.accounts = response.data;

          this.filteredAccounts = response.data;
        }
        
      },
      error: (err) => {
        console.error(err);
        // this.isLoading = false;
      }
    });
  }


  
  onSubmit(): void {

    if (this.maxOrder <= 7) {
      this.isSubmited = true;
      if (this.mainAccountForm.valid) {
        this.isLoading = true;
        const formData = new FormData();
        formData.append('title', this.mainAccountForm.get('title')?.value);
        formData.append('order', this.mainAccountForm.get('order')?.value);
        if (this.mainAccountForm.get('id')?.value) {
          formData.append('id', this.mainAccountForm.get('id')?.value);
        }
        this._AccountSettingService.addMainAccountNav(formData).subscribe({
          next: (response) => {
            if (response) {
              this.settings = response.data;
            }
            this.isLoading = false;
            this.isSubmited = false;

            this.loadSettings();
            this.mainAccountForm.reset();
          },
          error: (err) => {
            console.error(err);
            this.isLoading = false;
          }
        });
      }
    } else {
    //  alert('you can not add more than 6 settings');
    this.toastr.error('لا يمكنك اضافة اكثر من 6 اعدادات');
    }


  }


  showChildFormId: number | null = null;
  childTitle: string = '';
  selectedAccount: Account | null  = null;
  settingID: number | null = null;


  toggleChildForm(settingId: number | null) {
    this.showChildFormId = this.showChildFormId === settingId ? null : settingId;
    if (this.showChildFormId) {
      this.childTitle = '';
      this.selectedAccount = null;
      this.settingID = settingId;

    }
  }

  addChild(setting: any) {
    if (this.childTitle && this.selectedAccount !== null ) {
      
      const formData = new FormData();
      formData.append('title',this.childTitle);
      formData.append('nav_setting_id',setting.id);
      formData.append('account_id',this.selectedAccount.id);  

      
      this._AccountSettingService.addChildAccountNav(formData).subscribe({
        next: (response) => {
          if (response) {
            this.settings = response.data;
          }
      

          this.loadSettings();
          this.childTitle = '';
          this.selectedAccount = null;
          this.settingID= null;
          this.showChildFormId = null;        },
        error: (err) => {
          console.error(err);
        }
      });
    

    }else{
      this.toastr.error('من فضلك ادخل العنوان واختر الحساب');
      // alert('please select account and enter title');
    }
  }

  editSetting(setting: any) {

    this.mainAccountForm.setValue({
      id: setting.id,
      title: setting.title,
      order: setting.order
    });
    this.settings = this.settings.filter(_setting => _setting.id !== setting.id);
  }

  closeModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }

  openModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }

  getLocalizedAccountName(account: AccountChild): string {
    return this.currentLanguage === 'ar' ? account.name.ar : account.name.en;
  }

  deleteChild(childId: number): void {

    this._AccountSettingService.deleteChildAccountNav(childId).subscribe({
      next: (response) => {
        // alert('Child deleted successfully');
        this.toastr.success('تم حذف الاعدادات بنجاح');
        this.loadSettings();
      },
      error: (err) => {
        console.error(err);
      }
    });
    console.log('Deleting child with ID:', childId);
  }


  deleteSetting(id: number) {
    this._AccountSettingService.deleteMainNav(id).subscribe({
      next: (response) => {
        this.toastr.success('تم حذف الاعدادات بنجاح');
        this.loadSettings();

      },
      error: (err) => {
        this.toastr.error('حدث خطا اثناء حذف الاعدادات');
        console.error(err);
        this.isLoading = false;
      }
    });
  }



}

export interface MainAccountNavSetting {
  id: number;
  title: string;
  order: number;
  children: ChildAccountNavSetting[];
}
export interface ChildAccountNavSetting {
  id: number;
  title: string;
  account: AccountChild;
}


interface AccountChild {
  id: string;
  name: {ar:string,en:string};
}

interface Account {
  id: string;
  name: string;
  parent_id?: string;
  child?: Account[];
  showChildren?: boolean;
}