import { Component, OnInit } from '@angular/core';
import { DocumentService } from '../../shared/services/document.service';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-document-entry',
  standalone: true,
  imports: [CommonModule , RouterLinkActive , RouterModule,TranslateModule],
  templateUrl: './document-entry.component.html',
  styleUrl: './document-entry.component.css'
})
export class DocumentEntryComponent implements OnInit {
  DocumentEntry: any[] = [];

  constructor(private _DocumentService: DocumentService , private router: Router) {}

  ngOnInit(): void {
    this.loadDocumentEntry();
  }

  loadDocumentEntry(): void {
    this._DocumentService.viewAllDocumentEntry().subscribe({
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
      this._DocumentService.deleteDocument(documentId).subscribe({
        next: (response) => {
          if (response) {
            this.router.navigate(['/dashboard/documentEntry']);
            this.loadDocumentEntry();
          }
        },
        error: (err:HttpErrorResponse) => {
          console.log(err.error);
          alert('An error occurred while deleting the Document.');
          
        }
      });
    }
  }
}

