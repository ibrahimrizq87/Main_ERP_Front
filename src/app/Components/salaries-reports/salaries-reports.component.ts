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

  constructor(
    private _SalaryService: SalaryService,
    private toastr: ToastrService,
    private _EmployeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadSalariesData();
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

  onEmployeeChange(): void {
    this.loadSalariesData();
  }

  onMonthChange(): void {
    this.loadSalariesData();
  }

  loadSalariesData(): void {
    if (!this.selectedMonth) {
      this.toastr.warning('Please select a month');
      return;
    }

    this.isLoading = true;
    this.salariesData = null;
    
    this._SalaryService.getSalariesReports(this.selectedMonth, this.selectedEmployeeId)
      .subscribe({
        next: (response) => {
          this.salariesData = response.data || null;
          console.log('Salaries data:', this.salariesData);
          this.isLoading = false;
          
          if (!this.salariesData) {
            this.toastr.info('No salary data found for the selected criteria');
          }
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Failed to load salary data');
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