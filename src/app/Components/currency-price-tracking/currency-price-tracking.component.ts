import { Component } from '@angular/core';
import { AccountService } from '../../shared/services/account.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {  FormsModule } from '@angular/forms';
@Component({
  selector: 'app-currency-price-tracking',
  standalone: true,
  imports: [RouterModule,CommonModule,TranslateModule,FormsModule],
  templateUrl: './currency-price-tracking.component.html',
  styleUrl: './currency-price-tracking.component.css'
})
export class CurrencyPriceTrackingComponent {



  constructor(private _AccountService: AccountService
    , private _Router: Router
  ) {
  }


  selectRecord(record: any): void {

  switch (record.type) {
    case 'purchase_bill':
      this._Router.navigate(['/dashboard/showPurchase/'+record.model_id]);
      break;

      
    case 'sale_bill':
      this._Router.navigate(['/dashboard/showSale/'+record.model_id]);
      break;

      case 'payment_document':
        this._Router.navigate(['/dashboard/showPaymentDocument/'+record.model_id]);
        break;


        case 'entry_document':
          this._Router.navigate(['/dashboard/showEntryDocument/'+record.model_id]);
          break;

          case 'check':
            this._Router.navigate(['/dashboard/check/'+record.model_id]);
            break;
            case 'check_document':
              this._Router.navigate(['/dashboard/showPurchase/'+record.model_id]);
              break;
    default:
      console.log('Unknown type:', record.type);
  }
    console.log('Selected record:', record);
  }

account:any;
  ngOnInit(): void {

    this._AccountService.getCurrencyTracking().subscribe({
      next: (response) => {

console.log(response);
this.account = response.data.account;
this.currencyChanges = response.data.currency_prices;
this.gainLossList = response.data.exchange_rates;

},
      error: (error) => {
        console.log(error);
      }
    });
  }
  // currency_prices

  // exchange_rates

  currencyChanges :any;


  gainLossList : any;
}