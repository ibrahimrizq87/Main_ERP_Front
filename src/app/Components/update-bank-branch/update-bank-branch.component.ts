import { Component, OnInit } from '@angular/core';
import { BankService } from '../../shared/services/bank.service';
import { ActivatedRoute, Router, RouterLinkActive } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CityService } from '../../shared/services/city.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Modal } from 'bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CountryService } from '../../shared/services/country.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-update-bank-branch',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule ,TranslateModule ],
  templateUrl: './update-bank-branch.component.html',
  styleUrl: './update-bank-branch.component.css'
})
export class UpdateBankBranchComponent implements OnInit {
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
    private _CountryService:CountryService ,
    private route: ActivatedRoute,
    private _Router: Router,private translate: TranslateService,private _CityService:CityService,
  private  toastr :ToastrService) {
  
  }
  ngOnInit(): void {
    const cityId = this.route.snapshot.paramMap.get('id'); 
    if (cityId) {
      this.fetchBranchData(cityId);
    }
    this.loadBanks();
    this.loadCountries();
  }
  fetchBranchData(id:string){

    this._BankService.showBankBranch(id).subscribe({
      next: (response) => {
        if (response) {
          const branchData = response.data ; 
          console.log(branchData)
          this.bankBranchForm.patchValue({
            name_branch: branchData.name,
            phone: branchData.phone,
            fax:branchData.fax,
            city_id: branchData.city.id,
            address: branchData.address_description,
            notes :branchData.note,
            bank_id: branchData.bank.id,
            country_id: branchData.city.country.id
           
          });

          this.loadCities(branchData.city.country.id);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.msgError = err.error.error;
      }
    });
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
    if (this.bankBranchForm.valid  ) {
      this.isLoading = true;

      const formData = new FormData();
    
      
      formData.append('name', this.bankBranchForm.get('name_branch')?.value);
      formData.append('phone', this.bankBranchForm.get('phone')?.value);
      formData.append('fax', this.bankBranchForm.get('fax')?.value || '');
      formData.append('city_id', this.bankBranchForm.get('city_id')?.value);
      formData.append('address_description', this.bankBranchForm.get('address')?.value);
      formData.append('note', this.bankBranchForm.get('notes')?.value || '');
      formData.append('bank_id', this.bankBranchForm.get('bank_id')?.value);

         const branchyId = this.route.snapshot.paramMap.get('id');


      this._BankService.updateBankBranch(branchyId||'',formData).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.toastr.success('تم تعديل الفرع بنجاح');
            this.isLoading = false;
            this._Router.navigate(['/dashboard/bankBranch']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error('حدث خطا اثناء تعديل الفرع');
          this.isLoading = false;
           this.msgError = err.error.error;
          console.log(err);
        }
      });
    }
  }
  onCancel() {
    this.bankBranchForm.reset();
    this._Router.navigate(['/dashboard/bankBranch']); 
  }
}
interface City{
  id:string;
  name:string;
}