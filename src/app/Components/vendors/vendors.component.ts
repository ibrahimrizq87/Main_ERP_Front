
import { Component, KeyValueChangeRecord, OnInit } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormSubmittedEvent, FormsModule } from '@angular/forms';
import { VendorService } from '../../shared/services/vendor.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime } from 'rxjs';

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

  onSearchChange() {
    this.searchSubject.next(this.searchQuery);
  }
    
    
  private searchSubject = new Subject<string>();
  searchQuery: string = '';

  constructor(private _VendorService: VendorService, private router: Router,private toastr:ToastrService) {
     this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(query => {
      this.loadCurrency();
    });
  }

  ngOnInit(): void {
    this.loadCurrency(); 
  }

  loadCurrency(): void {
    this._VendorService.getAllVendors(
      this.searchQuery
    ).subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.vendors = response.data.vendors;
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
          // alert('An error occurred while deleting the currency.');
        }
      });
    }
  }



selectedFile: File | null = null;

onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.selectedFile = input.files[0];
  }
}


importVendors(): void {
  if (!this.selectedFile) return;

  const formData = new FormData();
  formData.append('file', this.selectedFile);
  this._VendorService.importVendors(formData).subscribe({
      next: (response) => {
            this.toastr.success('تمت العملية بنجاح');
            console.log(response)

      },
      error: (err) => {
        console.error("Error:", err);
        this.toastr.error('حدث خطا ');

      }
    });

}

fileName: string = 'vendors_template';

  exportVendors(){

    const name = this.fileName || 'vendors_template';
    this._VendorService.exportVendorsTemplate().subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', name+'.xlsx'); 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      error: (err) => {
        console.error("Error downloading file:", err);
      }
    });
  }



}




