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
import { CountryService } from '../../shared/services/country.service';
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
  isSubmited = false;
  cities:City [] =[];
  constructor(private _BankService:BankService
    ,
    private _CountryService:CountryService ,private _Router: Router,private translate: TranslateService,private _CityService:CityService) {
  
  }
  ngOnInit(): void {
    this.loadBanks();
    this.loadCountries();
  }

  bankBranchForm: FormGroup = new FormGroup({
    name_branch: new FormControl(null, [Validators.required]),
    phone: new FormControl(null, [Validators.required]),
    fax:new FormControl(null),
    city_id: new FormControl(null, [Validators.required]),
    address: new FormControl(null, [Validators.required]),
    notes :new FormControl(null),
    bank_id: new FormControl(null, [Validators.required]),
    country_id: new FormControl(null)
  });
  // loadCities(): void {
  //   this._CityService.viewAllCities().subscribe({
  //     next: (response) => {
  //       if (response) {
  //         this.citiesByCountry = {};
  //         response.data.forEach((city: any) => {
  //           if (!this.citiesByCountry[city.country]) {
  //             this.citiesByCountry[city.country] = [];
  //           }
  //           this.citiesByCountry[city.country].push(city);
  //         });
  //         this.countries = Object.keys(this.citiesByCountry);
  //       }
  //     },
  //     error: (err) => {
  //       console.error(err);
  //     }
  //   });
  // }

  onBankChange(event:Event){

    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedBank =selectedValue;
    console.log( this.selectedCountry);
  }
  onCityChange(event:Event){
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedCity =selectedValue;
  }
  
  loadCountries(): void {
    this._CountryService.viewAllcountries().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.countries = response.data; 
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  onCountryChange(event:Event){

    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedCountry =selectedValue;
    this.loadCities( this.selectedCountry);


  }
  loadCities(id:string): void {
    this._CityService.viewAllcitiesByCountry(id).subscribe({
      next: (response) => {
        if (response) {
          this.cities = response.data; 
          console.log(this.cities );

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
   this.isSubmited =true;
    if (this.bankBranchForm.valid && this.selectedBank && this.selectedCity ) {
      this.isLoading = true;

      const formData = new FormData();
    
      formData.append('name', this.bankBranchForm.get('name_branch')?.value);
      formData.append('phone', this.bankBranchForm.get('phone')?.value);
      formData.append('fax', this.bankBranchForm.get('fax')?.value || '');
      formData.append('city_id', this.bankBranchForm.get('city_id')?.value);
      formData.append('address_description', this.bankBranchForm.get('address')?.value);
      formData.append('note', this.bankBranchForm.get('notes')?.value || '');
      formData.append('bank_id', this.bankBranchForm.get('bank_id')?.value);

      // 'name'                 => 'required|string|max:255',
      // 'phone'                => 'required|string|max:15',
      // 'fax'                  => 'nullable|string|max:15',
      // 'address_description'  => 'required|string',
      // 'note'                 => 'nullable|string',
      // 'city_id'              => 'required|exists:cities,id',
      // 'bank_id'              => 'required|exists:banks,id',
   

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
interface City{
  id:string;
  name:string;
}