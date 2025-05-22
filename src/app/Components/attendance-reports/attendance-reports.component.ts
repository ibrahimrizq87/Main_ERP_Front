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




  approveAttendance(record :any , status :boolean){

 const formData = new FormData();
 formData.append('date', record.date);
 formData.append('status', status? '1' : '0');
 formData.append('employee_id', record.employee_id);



 this._AttendanceService.updateAttendanceApproval(formData)
      .subscribe({
        next: (response) => {
          this.loadAttendanceData();
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Failed to load attendance data');
          this.isLoading = false;
        }
      });
  }
    needApproval(record :any): boolean {


      // console.log(record.vacation)
      // console.log(record.vacationRequest)

      if(record.vacation){
        return true;
      }else if(record.vacationRequest){      
        return true;
      }else if(record.is_vecation_day){
      return true;
      }else if(!record.attendance){
      return false;
      }else if(record.attendance.start_status !='on_time' || record.attendance.end_status != 'on_time'){
        return false;
      }

   return true;
  }

 


  getStartStatusClass(status: string): string {
  switch (status) {
    case 'on_time': return 'text-success';
    case 'late': return 'text-warning';
    case 'very_late': return 'text-danger';
    default: return '';
  }
}

getEndStatusClass(status: string): string {
  switch (status) {
    case 'on_time': return 'text-success';
    case 'late_checkout': return 'text-warning';
    case 'left_early': return 'text-danger';
    case 'no_checkout': return 'text-muted';
    default: return '';
  }
}

getRowClass(record: any): string {
  if (record.future_data) return 'table-secondary'; // gray
  if (record.vacation || record.vacationRequest || record.is_vecation_day) return 'table-info';         // blue
  if (!record.attendance) return 'table-danger';    // red
  if ((record.attendance.status == 'attendant' && record.attendance.start_status == 'on_time' &&record.attendance.end_status == 'on_time' ) || record.attendance?.approved_by_manager) return 'table-success'; // green
  if (record.attendance.status === 'absent' || record.attendance.start_status != 'on_time' || record.attendance.end_status != 'on_time' ) return 'table-warning';  // yellow
  return '';
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
          // console.log(this.attendanceData);
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