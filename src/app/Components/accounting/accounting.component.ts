import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterLinkActive, Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../../shared/services/account.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { Subject, debounceTime } from 'rxjs';

@Component({
  selector: 'app-accounting',
  standalone: true,
  imports: [RouterModule, RouterLinkActive, CommonModule, TranslateModule, FormsModule, NgxPaginationModule],
  templateUrl: './accounting.component.html',
  styleUrl: './accounting.component.css'
})
export class AccountingComponent implements OnInit {

  isAMainAccount = false;
  accounts: any[] = [];
  type: string | null = '';
  onSearchChange() {
    this.searchSubject.next(this.searchQuery);
  }


  private searchSubject = new Subject<string>();
  searchQuery: string = '';


  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

  constructor(private _AccountService: AccountService, private router: Router, private route: ActivatedRoute, private toastr: ToastrService) {
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(query => {
      this.loadAccounts();
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const newType = params.get('type');
      if (this.type !== newType) {
        this.type = newType;
        this.currentPage = 1;
        this.onParamChange();
      }
    });


    if (
      this.type == '611' ||
      this.type == '621' ||
      this.type == '622' ||
      this.type == '113' ||
      this.type == '118' ||
      this.type == '211' ||
      this.type == '119' ||
      this.type == '623'
    ) {
      this.isAMainAccount = false;
    } else {
      this.isAMainAccount = true;
    }
  }

  onParamChange(): void {
    this.loadAccounts();

    if (
      this.type == '611' ||
      this.type == '621' ||
      this.type == '622' ||
      this.type == '113' ||
      this.type == '118' ||
      this.type == '211' ||
      this.type == '119' ||
      this.type == '623'
    ) {
      this.isAMainAccount = false;
    } else {
      this.isAMainAccount = true;
    }
  }

  loadAccounts(): void {
    this._AccountService.getAccountsByParentIndex(this.type || '',
      this.searchQuery,
      this.currentPage,
      this.itemsPerPage

    ).subscribe({
      next: (response) => {
        if (response) {
          const accounts = response.data.accounts;

          console.log(response);
          this.accounts = accounts;

          this.totalItems = response.data.meta.total;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  addAccount() {
    this.router.navigate(['dashboard/addAccount/' + this.type])
  }

  deleteAccount(accountID: number): void {
    if (confirm('Are you sure you want to delete this Account?')) {
      this._AccountService.deleteAccount(accountID).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف الحساب بنجاح');
            this.router.navigate(['/dashboard/accounting/' + this.type]);
            this.loadAccounts();
          }
        },
        error: (err) => {
          this.toastr.error('حدث خطا اثناء حذف الحساب');
          console.error(err);
        }
      });
    }
  }





  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
  }
}