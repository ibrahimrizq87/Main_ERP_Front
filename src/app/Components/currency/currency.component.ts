import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CurrencyService } from '../../shared/services/currency.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormSubmittedEvent, FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-currency',
  standalone: true,
  imports: [RouterLinkActive,RouterModule,CommonModule,TranslateModule,FormsModule],
  templateUrl: './currency.component.html',
  styleUrl: './currency.component.css'
})
export class CurrencyComponent implements OnInit {

  currencies: any[] = []; 
  filteredCurrencies: any[] = []; 
  searchTerm: string = '';

  constructor(private _CurrencyService: CurrencyService, private router: Router,private toastr:ToastrService) {}

  ngOnInit(): void {
    this.loadCurrency(); 
  }

  makeDefault(currencyId:string){
    

      this._CurrencyService.setCurrencyAsDefault(currencyId).subscribe({
        next: (response) => {
          if (response) {
            this.loadCurrency();
          }
        },
        error: (err) => {
          console.error(err);
          alert('An error occurred while deleting the currency.');
        }
      });
    
  }

  loadCurrency(): void {
    this._CurrencyService.viewAllCurrency().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.currencies = response.data;
          this.filteredCurrencies = [...this.currencies]; 
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  filterCurrencies(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredCurrencies = this.currencies.filter(currency => 
      currency.currency_name_ar?.toLowerCase().includes(term) ||
      currency.derivative_name_ar?.toLowerCase().includes(term) ||
      currency.abbreviation?.toLowerCase().includes(term) ||
      currency.value?.toString().toLowerCase().includes(term)
    );
  }
  deleteCurrency(currency_id: number): void {
    if (confirm('Are you sure you want to delete this currency?')) {
      this._CurrencyService.deleteCurrency(currency_id).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف العملة بنجاح');
            this.router.navigate(['/dashboard/currency']);
            this.loadCurrency();
          }
        },
        error: (err) => {
          this.toastr.error('حدث خطا اثناء حذف العملة');
          console.error(err);
          alert('An error occurred while deleting the currency.');
        }
      });
    }
  }
}

