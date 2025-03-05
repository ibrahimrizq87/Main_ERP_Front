import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormSubmittedEvent, FormsModule } from '@angular/forms';
import { ClientService } from '../../shared/services/client.service';
@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [RouterLinkActive,RouterModule,CommonModule,TranslateModule,FormsModule],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css'
})
export class ClientsComponent {


  clients: any[] = []; 
  filteredCurrencies: any[] = []; 
  searchTerm: string = '';

  constructor(private _ClientService: ClientService, private router: Router) {}

  ngOnInit(): void {
    this.loadCurrency(); 
  }

  loadCurrency(): void {
    this._ClientService.getAllClients().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.clients = response.data;
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
      this._ClientService.deleteClient(currency_id).subscribe({
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
  }
}




