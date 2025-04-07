import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { EntryDocumentService } from '../../shared/services/entry-documnet.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-document-entry',
  standalone: true,
  imports: [CommonModule , RouterLinkActive , RouterModule,TranslateModule],
  templateUrl: './document-entry.component.html',
  styleUrl: './document-entry.component.css'
})
export class DocumentEntryComponent implements OnInit {
  DocumentEntry: any[] = [];
  status ='waiting';

  constructor(private _EntryDocumentService: EntryDocumentService , private router: Router , 
    private route: ActivatedRoute,private toastr:ToastrService
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
    this._EntryDocumentService.viewAllDocumentEntry(status).subscribe({
      next: (response) => {
        if (response) {

          console.log(response)
          this.DocumentEntry = response.data;
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
          alert('An error occurred while deleting the Document.');
          
        }
      });
    }
  }
}

