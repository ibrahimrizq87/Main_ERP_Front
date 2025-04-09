import { Component, OnInit } from '@angular/core';
import { PaymentDocumentService } from '../../shared/services/pyment_document.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-show-payment-document',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './show-payment-document.component.html',
  styleUrl: './show-payment-document.component.css'
})
export class ShowPaymentDocumentComponent implements OnInit{
  constructor(
    private _PaymentDocumentService: PaymentDocumentService,
    private route: ActivatedRoute
  ) {}
  paymentDocumentData: any;
  paymentDocumentType: string | null = null;
  ngOnInit(): void {
    const accountId = this.route.snapshot.paramMap.get('id'); 
    if (accountId) {
      this.fetchAccountData(accountId);
    }
  }

  fetchAccountData(paymentDocumentId: string): void {
    this._PaymentDocumentService.getDocumentById(paymentDocumentId).subscribe({
      next: (response) => {
        if (response && response.data) {
          // console.log(response)
          this.paymentDocumentData = response.data;
          this.paymentDocumentType = response.data.type;
          console.log("store data",this.paymentDocumentData);
        }
      },
      error: (err: HttpErrorResponse) => {
         console.log(err);
      }
    });
  }

}
