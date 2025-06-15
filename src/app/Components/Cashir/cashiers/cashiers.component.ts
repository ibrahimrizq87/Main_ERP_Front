import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CashierService } from '../../../shared/services/cashier.service';
import { PermissionService } from '../../../shared/services/permission.service';

@Component({
  selector: 'app-cashiers',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,RouterModule,RouterLinkActive,TranslateModule,FormsModule],
  templateUrl: './cashiers.component.html',
  styleUrl: './cashiers.component.css'
})
export class CashiersComponent {

  Cashiers: any[] = [];



      constructor(

        private toastr:ToastrService,    
        private _CashierService:CashierService,   
        private _Router: Router, 
            public _PermissionService: PermissionService
        
  
      ){
      }



  deleteCashier(cashierId: string): void {

  this._CashierService.deleteCashier(cashierId).subscribe({
      next: (response) => {
        if (response) {
      this.loadCashiers();
          this.toastr.success('Cashier deleted successfully');}
      }
      , error: (err) => {
        console.error('Failed to load cashiers', err);
        this.toastr.error('An error occurred while loading cashiers.');
      }
    });

  }

  filterCashiers(): void {}
  loadCashiers(): void {
    this._CashierService.getAllCashier().subscribe({
      next: (response) => {
        if (response) {
          this.Cashiers = response.data; // Assuming response.data contains the list of cashiers
        }
      }
      , error: (err) => {
        console.error('Failed to load cashiers', err);
        this.toastr.error('An error occurred while loading cashiers.');
      }
    });
  }
  ngOnInit(): void {
    this.loadCashiers(); // Load cashiers when the component initializes
  }
searchQuery: string = '';
}
