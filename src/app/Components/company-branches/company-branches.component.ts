import { Component } from '@angular/core';
import { CompanyBranchService } from '../../shared/services/company-branch.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-company-branches',
  standalone: true,
  imports: [CommonModule,RouterModule,TranslateModule],
  templateUrl: './company-branches.component.html',
  styleUrl: './company-branches.component.css'
})
export class CompanyBranchesComponent {

  companyBranches: any[] = []; 
  filteredCompanyBranch: any[] = []; 
  searchQuery: string = ''; 

  constructor(private _CompanyBranchService: CompanyBranchService, private router: Router,private toastr:ToastrService) {}

  ngOnInit(): void {
    this.loadCompanyBranches(); 
  }

  loadCompanyBranches(): void {
    this._CompanyBranchService.viewallCompanyBranch().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.companyBranches = response.data; 
         
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }


  deleteCompanyBranch(companyBranchId: number): void {
    if (confirm('Are you sure you want to delete this Company Branch?')) {
      this._CompanyBranchService.deleteCompanyBranch(companyBranchId).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف الفرع بنجاح');
            
            this.loadCompanyBranches();
          }
        },
        error: (err) => {
          this.toastr.error('حدث خطا اثناء حذف الفرع');
          console.error(err);
         
        }
      });
    }
  }
}
