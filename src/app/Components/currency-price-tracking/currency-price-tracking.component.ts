import { Component } from '@angular/core';
import { AccountService } from '../../shared/services/account.service';

@Component({
  selector: 'app-currency-price-tracking',
  standalone: true,
  imports: [],
  templateUrl: './currency-price-tracking.component.html',
  styleUrl: './currency-price-tracking.component.css'
})
export class CurrencyPriceTrackingComponent {



  constructor(private _AccountService: AccountService) {
  }



  ngOnInit(): void {

    this._AccountService.getCurrencyTracking().subscribe({
      next: (response) => {

console.log(response);

},
      error: (error) => {
        console.log(error);
      }
    });
  }




}
