import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AccountService } from '../../shared/services/account.service';
import { PaymentDocumentService } from '../../shared/services/pyment_document.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { EntryDocumentService } from '../../shared/services/entry-documnet.service';

@Component({
  selector: 'app-check-documents',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule ,TranslateModule,FormsModule,RouterModule],
  templateUrl: './check-documents.component.html',
  styleUrl: './check-documents.component.css'
})
export class CheckDocumentsComponent {


  isLoading = false;
  accounts: any;
  compony_accounts: any;
  notes: any;
  currencies: any;
  // status ='payment_check';
  delegates: any;
  creators: any;
  parent_accounts: any;

  documents: any[] = []; 
  filteredCities: any[] = []; 
  searchQuery: string = ''; 
  parent_accounts_company: any;
  type: string | null = 'payment_check';
  constructor(private route: ActivatedRoute
    , private fb: FormBuilder,
    private _EntryDocumentService: EntryDocumentService,
    private _PaymentDocumentService: PaymentDocumentService
    , private router: Router,private toastr:ToastrService
  ) {

   

  }


  
  changeStatus(status:string){
    this.type = status;
    this.router.navigate([`/dashboard/check-documents/${this.type}`]);
    this.loadAllDocuments();
  }
  ManageChangeStatus(status:string , id:string){

      this._PaymentDocumentService.UpdateDocumentStatus(id ,status ).subscribe({
        next: (response) => {
          if (response) {
            this.loadAllDocuments()

          }
        },
        error: (err) => {
          console.error(err);
        }
      });
  }
  deleteDocument( id:string){
    if (confirm('Are you sure you want to delete this Document?')) {

    this._PaymentDocumentService.deleteDocument(id  ).subscribe({
      next: (response) => {
        if (response) {
          this.toastr.success('تم حذف المستند بنجاح');
          this.loadAllDocuments()

        }
      },
      error: (err) => {
        this.toastr.error('حدث خطا اثناء حذف المستند');
        console.error(err);
      }
    });
  }
}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const newType = params.get('type');
      const newStatus = params.get('status');
      console.log(newStatus);
      // if (newStatus && this.status !== newStatus) {

  
      //     this.status = newStatus;
        
        
      // }

      if (this.type !== newType) {
        this.type = newType;
        this.onParamChange();
      }
    });
        this.loadAllDocuments()
  }



  onParamChange(): void {
    this.loadAllDocuments();
  }
 


  loadAllDocuments(): void {

    if(this.type == 'payment_check' || this.type == 'receipt_check'){
      this._PaymentDocumentService.getDocumentsByType(this.type || '' , 'approved').subscribe({
        next: (response) => {
          if (response) {
            console.log(response);
            this.documents = response.data; 
          
          }
        },
        error: (err) => {
          console.error(err);
        }
      });
    }else if(this.type == 'entry'){

      this._EntryDocumentService.getEntryDocumentByType('check').subscribe({
        next: (response) => {
          if (response) {
            console.log('entry' ,response);
            this.documents = response.data; 
          
          }
        },
        error: (err) => {
          console.error(err);
        }
      });
      

    }
   
  }

}
