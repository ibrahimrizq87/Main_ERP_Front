import { Component, OnInit } from '@angular/core';
import { CashierService } from '../../shared/services/cashier.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-print-invoice',
  standalone: true,
  imports: [],
  templateUrl: './print-invoice.component.html',
  styleUrl: './print-invoice.component.css'
})
export class PrintInvoiceComponent implements OnInit{
  constructor(
    private _CashierService: CashierService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  invoiceData: any;
  ngOnInit(): void {
    const invoiceId = this.route.snapshot.paramMap.get('id'); 
    if (invoiceId) {
      this.fetchInvoiceData(invoiceId);
    }
  }

  fetchInvoiceData(invoiceId: string): void {
    this._CashierService.getBillCashierById(invoiceId).subscribe({
      next: (response) => {
        if (response && response.data) {
          console.log(response)
          this.invoiceData= response.data;
        }
      },
      error: (err: HttpErrorResponse) => {
         console.log(err);
      }
    });
  }

}


