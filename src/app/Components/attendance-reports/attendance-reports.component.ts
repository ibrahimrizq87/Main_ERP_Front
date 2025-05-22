// src/app/Components/attendance-reports/attendance-reports.component.ts
import { Component, OnInit } from '@angular/core';
import { AttendanceService } from '../../shared/services/attendance.service';
import { ToastrService } from 'ngx-toastr';
import { EmployeeService } from '../../shared/services/employee.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-attendance-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './attendance-reports.component.html',
  styleUrl: './attendance-reports.component.css'
})
export class AttendanceReportsComponent implements OnInit {
  employees: any[] = [];
  selectedEmployeeId: string = '';
  selectedMonth: string = this.getCurrentMonth();
  attendanceData: any[] = [];
  isLoading: boolean = false;

  constructor(
    private _AttendanceService: AttendanceService,
    private toastr: ToastrService,
    private _EmployeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
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
    if (this.selectedEmployeeId) {
      this.loadAttendanceData();
    }
  }

  onMonthChange(): void {
    if (this.selectedEmployeeId) {
      this.loadAttendanceData();
    }
  }

  loadAttendanceData(): void {
    if (!this.selectedEmployeeId) {
      this.toastr.warning('Please select an employee');
      return;
    }

    this.isLoading = true;
    this._AttendanceService.getEmployeesAttendance(this.selectedMonth, this.selectedEmployeeId)
      .subscribe({
        next: (response) => {
          this.attendanceData = response.data.data|| [];
          console.log(this.attendanceData);
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Failed to load attendance data');
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