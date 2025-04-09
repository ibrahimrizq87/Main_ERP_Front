import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EntryDocumentService } from '../../shared/services/entry-documnet.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-show-document-entry',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './show-document-entry.component.html',
  styleUrl: './show-document-entry.component.css'
})
export class ShowDocumentEntryComponent implements OnInit {

  documentData: any;

  constructor(
    private _EntryDocumentService: EntryDocumentService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const documentID = this.route.snapshot.paramMap.get('id');
    if (documentID) {
      this.fetchMachineData(documentID);
    }
  }

 
  fetchMachineData(documentID: string): void {
    this._EntryDocumentService.getEntryDocumentById(documentID).subscribe({
      next: (response) => {
        console.log(response.data);
        this.documentData = response.data|| {};
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching Product data:', err.message);
      }
    });
  }
  
}
