import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { EmployeeService } from '../../shared/services/employee.service';
import { SalaryService } from '../../shared/services/salary.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-salaries-reports',
  standalone: true,
  imports: [TranslateModule, CommonModule, FormsModule],
  templateUrl: './salaries-reports.component.html',
  styleUrl: './salaries-reports.component.css'
})
export class SalariesReportsComponent implements OnInit {
  employees: any[] = [];
  selectedEmployeeId: string = '';
  selectedMonth: string = this.getCurrentMonth();
  salariesData: any = null;
  isLoading: boolean = false;
  searchOption: 'month' | 'employee' = 'month'; // Default to month search

  constructor(
    private _SalaryService: SalaryService,
    private toastr: ToastrService,
    private _EmployeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    if (this.searchOption === 'month') {
      this.loadSalariesByMonth();
    }
  }

  getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  loadEmployees(): void {
    this._EmployeeService.getAllEmployees().subscribe({
      next: (response) => {
        if (response) {
          this.employees = response.data;
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to load employees');
      }
    });
  }

  onSearchOptionChange(): void {
    this.salariesData = null;
    if (this.searchOption === 'month') {
      this.loadSalariesByMonth();
    } else {
      this.selectedEmployeeId = '';
    }
  }

  onEmployeeChange(): void {
    if (this.searchOption === 'employee' && this.selectedEmployeeId) {
      this.loadSalariesByEmployee();
    }
  }

  onMonthChange(): void {
    if (this.searchOption === 'month') {
      this.loadSalariesByMonth();
    }
  }

  loadSalariesByMonth(): void {
    if (!this.selectedMonth) {
      this.toastr.warning('Please select a month');
      return;
    }

    this.isLoading = true;
    this.salariesData = null;
    
    this._SalaryService.getSalaryByMonth(this.selectedMonth)
      .subscribe({
        next: (response) => {
          this.salariesData = response.data || null;
          console.log('Salaries by month:', this.salariesData);
          this.isLoading = false;
          
          if (!this.salariesData) {
            this.toastr.info('No salary data found for the selected month');
          }
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Failed to load salary data by month');
          this.isLoading = false;
        }
      });
  }

  loadSalariesByEmployee(): void {
    if (!this.selectedEmployeeId) {
      this.toastr.warning('Please select an employee');
      return;
    }

    this.isLoading = true;
    this.salariesData = null;
    
    this._SalaryService.getSalaryByEmployee(this.selectedEmployeeId)
      .subscribe({
        next: (response) => {
          this.salariesData = response.data || null;
          console.log('Salaries by employee:', this.salariesData);
          this.isLoading = false;
          
          if (!this.salariesData) {
            this.toastr.info('No salary data found for the selected employee');
          }
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Failed to load salary data by employee');
          this.isLoading = false;
        }
      });
  }

  getSelectedEmployeeName(): string {
    if (!this.selectedEmployeeId) return '';
    const employee = this.employees.find(e => e.id === this.selectedEmployeeId);
    return employee?.account?.name || '';
  }
}