import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cashiers',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,RouterModule,RouterLinkActive,TranslateModule,FormsModule],
  templateUrl: './cashiers.component.html',
  styleUrl: './cashiers.component.css'
})
export class CashiersComponent {

  Cashiers: any[] = [];


  deleteCashier(cashierId: string): void {}

  filterCashiers(): void {}
  loadCashiers(): void {
    // This method should fetch the list of cashiers from the service
    // and assign it to this.Cashiers
  }
  ngOnInit(): void {
    this.loadCashiers(); // Load cashiers when the component initializes
  }
searchQuery: string = '';
}
