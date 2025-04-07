
import { Component, KeyValueChangeRecord, OnInit } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormSubmittedEvent, FormsModule } from '@angular/forms';
import { VendorService } from '../../shared/services/vendor.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [RouterLinkActive,RouterModule,CommonModule,TranslateModule,FormsModule],
  templateUrl: './vendors.component.html',
  styleUrl: './vendors.component.css'
})
export class VendorsComponent {



  vendors: any[] = []; 
  filteredCurrencies: any[] = []; 
  searchTerm: string = '';

  constructor(private _VendorService: VendorService, private router: Router,private toastr:ToastrService) {}

  ngOnInit(): void {
    this.loadCurrency(); 
  }

  loadCurrency(): void {
    this._VendorService.getAllVendors().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.vendors = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  // filterCurrencies(): void {
  //   const term = this.searchTerm.toLowerCase();
  //   this.filteredCurrencies = this.currencies.filter(currency => 
  //     currency.currency_name_ar?.toLowerCase().includes(term) ||
  //     currency.derivative_name_ar?.toLowerCase().includes(term) ||
  //     currency.abbreviation?.toLowerCase().includes(term) ||
  //     currency.value?.toString().toLowerCase().includes(term)
  //   );
  // }
  deleteCurrency(currency_id: number): void {
    if (confirm('Are you sure you want to delete this currency?')) {
      this._VendorService.deleteVendor(currency_id).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف المورد بنجاح');
            this.loadCurrency();
          }
        },
        error: (err) => {
          this.toastr.error('حدث خطا اثناء حذف المورد');
          console.error(err);
          alert('An error occurred while deleting the currency.');
        }
      });
    }
  }
}




