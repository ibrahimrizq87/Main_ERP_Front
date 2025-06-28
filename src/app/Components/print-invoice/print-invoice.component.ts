import { Component, OnInit } from '@angular/core';
import { CashierService } from '../../shared/services/cashier.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CommonModule } from '@angular/common';
// OR if using html2pdf.js:
// import * as html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-print-invoice',
  standalone: true,
  imports: [ CommonModule],
  templateUrl: './print-invoice.component.html',
  styleUrl: './print-invoice.component.css'
})
export class PrintInvoiceComponent implements OnInit {

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
  goback() {
    this.router.navigate(['/cashier']);

  }
  fetchInvoiceData(invoiceId: string): void {
    this._CashierService.getBillCashierById(invoiceId).subscribe({
      next: (response) => {
        if (response && response.data) {
          console.log('Invoice data fetched:', response.data);
          this.invoiceData = response.data;
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      }
    });
  }

  // Using jspdf + html2canvas
  downloadAsPDF(): void {
    const element = document.getElementById('invoice-content') as HTMLElement;
    
    html2canvas(element).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice_${this.invoiceData.id}.pdf`);
    });
  }

  /* Alternative using html2pdf.js
  downloadAsPDF(): void {
    const element = document.getElementById('invoice-content');
    const opt = {
      margin: 10,
      filename: `invoice_${this.invoiceData.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  }
  */
}