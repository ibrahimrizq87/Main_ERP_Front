import { Component, OnInit } from '@angular/core';
import { BankService } from '../../shared/services/bank.service';
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-show-bank-branch',
  standalone: true,
  imports: [ RouterLinkActive , RouterModule ,TranslateModule],
  templateUrl: './show-bank-branch.component.html',
  styleUrl: './show-bank-branch.component.css'
})
export class ShowBankBranchComponent implements OnInit{
  constructor(
    private _BankService: BankService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  bankBranch: any;
  ngOnInit(): void {
    const branchId = this.route.snapshot.paramMap.get('id'); 
    if (branchId) {
      this.fetchBranchData(branchId);
    }
  }

  fetchBranchData(branchId: string): void {
    this._BankService.showBankBranch(branchId).subscribe({
      next: (response) => {
        if (response && response.data) {
          console.log(response)
          this.bankBranch= response.data;
        }
      },
      error: (err: HttpErrorResponse) => {
         console.log(err);
      }
    });
  }

}

