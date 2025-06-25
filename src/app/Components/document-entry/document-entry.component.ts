import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { EntryDocumentService } from '../../shared/services/entry-documnet.service';
import { ToastrService } from 'ngx-toastr';
import { PermissionService } from '../../shared/services/permission.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  

@Component({
  selector: 'app-document-entry',
  standalone: true,
  imports: [CommonModule , RouterLinkActive , RouterModule,TranslateModule,FormsModule,ReactiveFormsModule],
  templateUrl: './document-entry.component.html',
  styleUrl: './document-entry.component.css'
})
export class DocumentEntryComponent implements OnInit {
  DocumentEntry: any[] = [];
  status ='waiting';

   searchDateType ='day';

  filters = {
    // vendorName:'',
    // paymentType: 'all',
    startDate: '',
    endDate: '',
    priceFrom: '',
    priceTo: '',
    day: this.getTodayDate(),
  };

    getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
    onSearchTypeChange(){
    this.filters.startDate = '';
    this.filters.endDate = '';
    this.filters.day = '';
  }

  clearSerachFields(){
    this.filters.priceFrom = '';
    this.filters.priceTo = '';
    // this.filters.paymentType = 'all';
    // this.filters.vendorName ='';
  }


  constructor(private _EntryDocumentService: EntryDocumentService , private router: Router , 
    private route: ActivatedRoute,private toastr:ToastrService,
    public _PermissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const newStatus = params.get('status');
      if (newStatus && this.status !== newStatus) {
          this.status = newStatus;
 
      }
    });

    this.loadDocumentEntry(this.status);
  }

  ManageChangeStatus(status:string , id:string){

    this._EntryDocumentService.UpdateEntryDocumentStatus(id ,status ).subscribe({
      next: (response) => {
        if (response) {
          this.loadDocumentEntry(this.status);

        }
      },
      error: (err) => {
        console.error(err);
      }
    });
}
  changeStatus(status:string){
    this.status = status;
    this.router.navigate([`/dashboard/documentEntry/${status}`]);
    this.loadDocumentEntry(status);
    
  }

  loadDocumentEntry(status:string): void {
    const startDate = this.filters.startDate || '';
    const endDate = this.filters.endDate || '';
    const priceFrom = this.filters.priceFrom || '';
    const priceTo = this.filters.priceTo || '';
    const day = this.filters.day || '';
    this._EntryDocumentService.viewAllDocumentEntry(status,
      startDate,
      endDate,
      priceFrom,
      priceTo,
      day,
    ).subscribe({
      next: (response) => {
        if (response) {

          console.log(response)
          this.DocumentEntry = response.data.documents;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
 
  deleteDocument(documentId: number): void {
    if (confirm('Are you sure you want to delete this Document?')) {
      this._EntryDocumentService.deleteEntryDocument(documentId).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف المستند بنجاح');
            this.loadDocumentEntry(this.status);
          }
        },
        error: (err:HttpErrorResponse) => {
          this.toastr.error('حدث خطا اثناء حذف المستند');
          console.log(err.error);
          // alert('An error occurred while deleting the Document.');
          
        }
      });
    }
  }
}

