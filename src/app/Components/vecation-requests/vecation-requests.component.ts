// src/app/Components/vecation-requests/vecation-requests.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { VectionService } from '../../shared/services/vection.service';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { EmployeeService } from '../../shared/services/employee.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vecation-requests',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink, RouterModule, RouterLinkActive, FormsModule],
  templateUrl: './vecation-requests.component.html',
  styleUrls: ['./vecation-requests.component.css']
})
export class VecationRequestsComponent implements OnInit {
  activeMainTab: 'old' | 'new' | null = null;
  activeSubTab: 'pending' | 'approved' | 'rejected' = 'pending';
  requests: any[] = [];
  filteredRequests: any[] = [];
  isLoading: boolean = false;
  showSubTabs: boolean = false;
  employees: any[] = [];
  selectedEmployeeId: string | null = null;

  constructor(
    private _VectionService: VectionService,
    private toastr: ToastrService,
    private _EmployeeService: EmployeeService
  ) {}

  changeMainTab(tab: 'old' | 'new'): void {
    this.activeMainTab = tab;
    this.showSubTabs = true;
    this.activeSubTab = 'pending';
    this.loadRequests();
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  changeSubTab(tab: 'pending' | 'approved' | 'rejected'): void {
    this.activeSubTab = tab;
    this.loadRequests();
  }

  onEmployeeChange(): void {
    if (!this.selectedEmployeeId) {
      this.filteredRequests = [...this.requests];
    } else {
      this.filterRequestsByEmployee(this.selectedEmployeeId);
    }
  }

  filterRequestsByEmployee(employeeId: string): void {
    if (!this.activeMainTab) return;

    this.isLoading = true;
    this._VectionService.getRequestsByEmployee(employeeId).subscribe({
      next: (response) => {
        this.filteredRequests = response.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  loadRequests(): void {
    if (!this.activeMainTab) return;
    
    this.isLoading = true;
    this._VectionService.getByStatus(this.activeSubTab, this.activeMainTab).subscribe({
      next: (response) => {
        this.requests = response.data;
        this.filteredRequests = [...this.requests]; // Initialize filteredRequests with all requests
        console.log(this.requests);
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  deleteVecationRequest(vecation_request_id: number): void {
    if (confirm('Are you sure you want to delete this Vecation Request?')) {
      this._VectionService.deleteVecationRequest(vecation_request_id).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف Vecation Requestبنجاح');
            this.loadRequests();
          }
        },
        error: (err) => {
          this.toastr.error(' Vecation Request حدث خطا اثناء حذف ');
          console.error(err);
        }
      });
    }
  }

  loadEmployees(): void {
    this._EmployeeService.getAllEmployees().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.employees = response.data.employees;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}