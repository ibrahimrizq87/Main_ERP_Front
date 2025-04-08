import { Component, OnInit } from '@angular/core';
import { BankService } from '../../shared/services/bank.service';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-bank-branch',
  standalone: true,
  imports: [CommonModule , ReactiveFormsModule, RouterModule ,RouterLinkActive,TranslateModule,FormsModule],
  templateUrl: './bank-branch.component.html',
  styleUrl: './bank-branch.component.css'
})
export class BankBranchComponent  implements OnInit {

  bankBranches: any[] = []; 
  filteredBankBranches: any[] = [];
  searchQuery: string = '';

  constructor(private _BankService: BankService, private router: Router,private toastr:ToastrService) {}

  ngOnInit(): void {
    this.loadBankBranches(); 
  }

  loadBankBranches(): void {
    this._BankService.viewAllBankBranches().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.bankBranches = response.data; 
          this.filteredBankBranches = this.bankBranches; 
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  deleteBankBranch(bankId: number): void {
    if (confirm('Are you sure you want to delete this Bank Branch?')) {
      this._BankService.deleteBankBranch(bankId).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف الفرع البنكي بنجاح');
            this.router.navigate(['/dashboard/bankBranch']);
            this.loadBankBranches();
          }
        },
        error: (err) => {
          this.toastr.error('حدث خطا اثناء حذف الفرع البنكي');
          console.error(err);
          // alert('An error occurred while deleting the Bank Branch.');
        }
      });
    }
  }
  searchBankBranches(): void {
    this.filteredBankBranches = this.bankBranches.filter(bank => {
      const branchName = bank.name_branch.toLowerCase();
      const phone = bank.phone.toLowerCase();
      const fax = bank.fax.toLowerCase();
      const bankName = bank.bank.name_ar.toLowerCase(); 

      return branchName.includes(this.searchQuery.toLowerCase()) ||
             phone.includes(this.searchQuery.toLowerCase()) ||
             fax.includes(this.searchQuery.toLowerCase()) ||
             bankName.includes(this.searchQuery.toLowerCase());
    });
  }
}


