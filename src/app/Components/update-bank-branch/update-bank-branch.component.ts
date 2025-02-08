import { Component, OnInit } from '@angular/core';
import { BankService } from '../../shared/services/bank.service';
import { ActivatedRoute, Router, RouterLinkActive } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CityService } from '../../shared/services/city.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Modal } from 'bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-update-bank-branch',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule ,TranslateModule ],
  templateUrl: './update-bank-branch.component.html',
  styleUrl: './update-bank-branch.component.css'
})
export class UpdateBankBranchComponent implements OnInit {
  msgError: string = '';
  msgSuccess:string ='';
  isLoading: boolean = false;

  countries: any[] = [];
  citiesByCountry: { [key: string]: any[] } = {};
  selectedCountry: string = '';
  // selectedCity: string = '';
  selectedCity:any;
  selectedBank: any;
  banks: any[] = []; 
  bankBranchForm: FormGroup ;
    constructor(
    private _BankService: BankService,
    private router: Router,
    private route: ActivatedRoute,private _CityService:CityService
  ) {
   this.bankBranchForm = new FormGroup({
      name_branch: new FormControl(null, [Validators.required]),
      phone: new FormControl(null, [Validators.required]),
      fax:new FormControl(null),
      city_id: new FormControl(null, [Validators.required]),
      address: new FormControl(null, [Validators.required]),
      notes :new FormControl(null),
      bank_id: new FormControl(null, [Validators.required])
    });
  
  }
  openModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }
  
  closeModal(modalId: string) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      modal?.hide();
    }
  }

  selectBank(bank: any, modalId: string) {
    this.selectedBank = bank;
    this.bankBranchForm.get('bank_id')?.setValue(bank.id); // Set the selected bank's ID in the form
    this.closeModal(modalId); // Close the modal
  }
  selectCity(city: any, modalId: string) {
    this.selectedCity = city; // Set the selected city
    this.bankBranchForm.get('city_id')?.setValue(city.id); // Update the form control value
    this.closeModal(modalId); // Close the modal
  }
 
    ngOnInit(): void {
    const bankBranchId = this.route.snapshot.paramMap.get('id'); 
    if (bankBranchId) {
      this.fetchBankBranch(bankBranchId);
    }
    this.loadBanks();
    this.loadCities();
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
      error: (err) => {
        console.error(err);
      }
    });
  }
  loadBanks(): void {
    this._BankService.viewAllBanks().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.banks = response.data; 
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  // fetchBankBranch(bankBranchId: string): void {
  //   this._BankService.showBankBranch(bankBranchId).subscribe({
  //     next: (response) => {
  //       if (response) {
  //         const bankBranchData = response.data ; 
  //         console.log(bankBranchData)
  //         this.bankBranchForm.patchValue({
  //           name_branch: bankBranchData.name_branch,
  //           phone: bankBranchData.phone,
  //           fax:bankBranchData.fax,
  //           city_id: bankBranchData.city_id.id,
  //           address: bankBranchData.address,
  //           notes:bankBranchData.notes,
  //           bank_id:bankBranchData.bank.id
  //         });
  //       }
  //     },
  //     error: (err: HttpErrorResponse) => {
  //       this.msgError = err.error.error;
  //     }
  //   });
  // }
  fetchBankBranch(bankBranchId: string): void {
    this._BankService.showBankBranch(bankBranchId).subscribe({
      next: (response) => {
        if (response) {
          const bankBranchData = response.data;
  
          // Log data for debugging
          console.log('Bank Branch Data:', bankBranchData);
  
          // Update the form with fetched data
          this.bankBranchForm.patchValue({
            name_branch: bankBranchData.name_branch,
            phone: bankBranchData.phone,
            fax: bankBranchData.fax,
            city_id: bankBranchData.city_id.id,
            address: bankBranchData.address,
            notes: bankBranchData.notes,
            bank_id: bankBranchData.bank.id, // Update the bank ID
          });
  
          // Set the selectedBank property to display the bank name
          this.selectedBank = bankBranchData.bank;
          this.selectedCity = bankBranchData.city_id;
  
          // Log selected bank for debugging
          console.log('Selected Bank:', this.selectedBank);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.msgError = err.error.error;
      },
    });
  }
  
   handleForm(): void {
    if (this.bankBranchForm.valid) {
      this.isLoading = true;
  
      
      const formData = new FormData();
    
      formData.append('name_branch', this.bankBranchForm.get('name_branch')?.value);
      formData.append('phone', this.bankBranchForm.get('phone')?.value);
      formData.append('fax', this.bankBranchForm.get('fax')?.value);
      formData.append('city_id', this.bankBranchForm.get('city_id')?.value);
      formData.append('address', this.bankBranchForm.get('address')?.value);
      formData.append('notes', this.bankBranchForm.get('notes')?.value);
      formData.append('address', this.bankBranchForm.get('address')?.value);
      formData.append('bank_id', this.bankBranchForm.get('bank_id')?.value);
   
      const bankBranchId = this.route.snapshot.paramMap.get('id');
      if(bankBranchId){
      this._BankService.updateBankBranch(bankBranchId,formData).subscribe({
      
        next: (response) => {
          console.log(response);
          if (response) {
            this.isLoading = false;
            this.router.navigate(['/dashboard/bankBranch']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
           this.msgError = err.error.error;
          console.log(err);
        }
      });
    }}}
  onCancel(): void {
        this.bankBranchForm.reset();
       
        this.router.navigate(['/dashboard/bankBranch']); 
      }  
}

