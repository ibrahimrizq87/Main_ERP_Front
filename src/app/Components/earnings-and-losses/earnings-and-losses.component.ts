import { Component, OnInit } from '@angular/core';
import { EarningsAndLossesService } from '../../shared/services/earnings-and-losses.service';
import { CommonModule } from '@angular/common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-earnings-and-losses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './earnings-and-losses.component.html',
  styleUrl: './earnings-and-losses.component.css'
})
export class EarningsAndLossesComponent implements OnInit {

  
  currentYear: number = 0;
  earningAndLosses: any[] = []; 
  
  constructor(
    private _EarningsAndLossesService: EarningsAndLossesService
  ) {}

  ngOnInit(): void {
    this.getCurrentYear(); 
    this.loadEarningAndLosses();
  }

  loadEarningAndLosses(): void {
    this._EarningsAndLossesService.earningsAndLosses().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.earningAndLosses = response; 
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
 
  getCurrentYear(): void {
    const now = new Date();
    this.currentYear = now.getFullYear();
  }
   
  exportToPDF(): void {
    const content: HTMLElement | null = document.getElementById('earnings-losses-report');
    if (content) {
      html2canvas(content, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      }).then((canvas: { toDataURL: (arg0: string) => any; height: number; width: number; }) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 190; 
        const pageHeight = 297; 
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        pdf.save(`قائمة الأرباح والخسائر - ${this.currentYear}.pdf`);
      });
    }
  }


  formatNumber(value: number): string {
    return new Intl.NumberFormat('ar-EG').format(value);
  }

 
  calculateTotal(items: any[]): number {
    return items.reduce((sum, item) => sum + (item.value || 0), 0);
  }
  getCurrentDate(): string|number|Date {
    const now = new Date();
    return now.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}