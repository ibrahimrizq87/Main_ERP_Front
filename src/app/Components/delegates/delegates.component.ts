import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CurrencyService } from '../../shared/services/currency.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormSubmittedEvent, FormsModule } from '@angular/forms';
import { DelegateService } from '../../shared/services/delegate.service';
import { ToastrService } from 'ngx-toastr';
import { PermissionService } from '../../shared/services/permission.service';
@Component({
  selector: 'app-delegates',
  standalone: true,
  imports: [RouterLinkActive,RouterModule,CommonModule,TranslateModule,FormsModule],
  templateUrl: './delegates.component.html',
  styleUrl: './delegates.component.css'
})
export class DelegatesComponent {



  currencies: any[] = []; 
  filteredCurrencies: any[] = []; 
  searchTerm: string = '';

  constructor(private _DelegateService: DelegateService, private router: Router,private toastr:ToastrService,
    public _PermissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.loadDelegates(); 
  }

  loadDelegates(): void {
    this._DelegateService.getAllDelegates().subscribe({
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
      this._DelegateService.deleteDelegate(currency_id).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف العميل بنجاح');
            // this.router.navigate(['/dashboard/currency']);
            this.loadDelegates();
          }
        },
        error: (err) => {
          this.toastr.error('حدث خطا اثناء حذف العميل');
          console.error(err);
          // alert('An error occurred while deleting the currency.');
        }
      });
    }
  }
}




