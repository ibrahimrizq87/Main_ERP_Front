import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AccountCategoriesService } from '../../shared/services/account_categories.service';
import { ToastrService } from 'ngx-toastr';




@Component({
  selector: 'app-account-categories',
  standalone: true,
  imports: [CommonModule , RouterLinkActive , RouterModule,TranslateModule],
  templateUrl: './account-categories.component.html',
  styleUrl: './account-categories.component.css'
})
export class AccountCategoriesComponent {

  accountCategories: any[] = [];
  type ='client';

  constructor(private _AccountCategoriesService: AccountCategoriesService , private router: Router , 
    private route: ActivatedRoute,private toastr:ToastrService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const newStatus = params.get('type');
      if (newStatus && this.type !== newStatus) {
          this.type = newStatus;
 
      }
    });

    this.loadCategories(this.type);
  }


  changeStatus(status:string){
    this.type = status;
    this.router.navigate([`/dashboard/account-categories/${status}`]);
    this.loadCategories(status);
    
      }
  loadCategories(type:string): void {
    this._AccountCategoriesService.getAllAccountCategoryByType(type).subscribe({
      next: (response) => {
        if (response) {

          console.log(response)
          this.accountCategories = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
 
  deleteDocument(documentId: number): void {
    if (confirm('Are you sure you want to delete this Document?')) {
      this._AccountCategoriesService.deleteAccountCategory(documentId).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف الفئة بنجاح');
            this.loadCategories(this.type);
          }
        },
        error: (err:HttpErrorResponse) => {
          this.toastr.error('حدث خطا اثناء حذف الفئة');
          console.log(err.error);
          // alert('An error occurred while deleting the Document.');
          
        }
      });
    }
  }
}

