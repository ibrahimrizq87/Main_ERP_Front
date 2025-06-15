import { Component, OnInit } from '@angular/core';
import { BankService } from '../../shared/services/bank.service';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PermissionService } from '../../shared/services/permission.service';

@Component({
  selector: 'app-banks',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,RouterModule,RouterLinkActive,TranslateModule,FormsModule],
  templateUrl: './banks.component.html',
  styleUrl: './banks.component.css'
})
export class BanksComponent implements OnInit {

  banks: any[] = []; 
  filteredBanks: any[] = [];
  searchQuery: string = '';

  constructor(private _BankService: BankService, private router: Router,private toastr:ToastrService,
            public _PermissionService: PermissionService
    
  ) {}

  ngOnInit(): void {
    this.loadBanks(); 
  }

  loadBanks(): void {
    this._BankService.viewAllBanks().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.banks = response.data;
          this.filteredBanks = this.banks;  
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  filterBanks(): void {
    if (this.searchQuery.trim() === '') {
      this.filteredBanks = this.banks;  
    } else {
      this.filteredBanks = this.banks.filter(bank =>
        bank.aribic_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        bank.english_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        bank.type_bank.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }
  deleteBank(bankId: number): void {
    if (confirm('Are you sure you want to delete this Bank?')) {
      this._BankService.deleteBank(bankId).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف البنك بنجاح');
            this.router.navigate(['/dashboard/banks']);
            this.loadBanks();
          }
        },
        error: (err) => {
          this.toastr.error('حدث خطا اثناء حذف البنك');
          console.error(err);
          // alert('An error occurred while deleting the Bank.');
        }
      });
    }
  }
}

