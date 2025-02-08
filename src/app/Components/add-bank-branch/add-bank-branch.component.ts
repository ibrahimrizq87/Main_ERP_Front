import { Component, OnInit } from '@angular/core';
import { BankService } from '../../shared/services/bank.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CityService } from '../../shared/services/city.service';
import { Modal } from 'bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-bank-branch',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule ,TranslateModule],
  templateUrl: './add-bank-branch.component.html',
  styleUrl: './add-bank-branch.component.css'
})
export class AddBankBranchComponent implements OnInit {
  msgError: string = '';
  isLoading: boolean = false;
  countries: any[] = [];
  citiesByCountry: { [key: string]: any[] } = {};
  selectedCountry: string = '';
  selectedCity:any;
  banks: any[] = []; 
  selectedBank: any;
  
  constructor(private _BankService:BankService ,private _Router: Router,private translate: TranslateService,private _CityService:CityService) {
  
  }
  ngOnInit(): void {
    this.loadCities();
    this.loadBanks();
  }

  bankBranchForm: FormGroup = new FormGroup({
    name_branch: new FormControl(null, [Validators.required]),
    phone: new FormControl(null, [Validators.required]),
    fax:new FormControl(null),
    city_id: new FormControl(null, [Validators.required]),
    address: new FormControl(null, [Validators.required]),
    notes :new FormControl(null),
    bank_id: new FormControl(null, [Validators.required])
  });
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
  handleForm() {
   
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
   

      this._BankService.addBankBranch(formData).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.isLoading = false;
            this._Router.navigate(['/dashboard/bankBranch']);
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
