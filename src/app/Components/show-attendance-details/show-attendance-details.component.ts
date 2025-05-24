import { Component } from '@angular/core';
import { AttendanceService } from '../../shared/services/attendance.service';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-show-attendance-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './show-attendance-details.component.html',
  styleUrl: './show-attendance-details.component.css'
})
export class ShowAttendanceDetailsComponent {

    attendanceData : any = null;
    attendancesData : any = null;
  employee: any;
    
    constructor(
      private _AttendanceService: AttendanceService,
      private toastr: ToastrService,
          private route: ActivatedRoute
      
    ) {}

  ngOnInit(): void {
    const accountId = this.route.snapshot.paramMap.get('id'); 
    if (accountId) {
      this.fetchAttendance(accountId);
    }
  }
  fetchAttendance(accountId: string): void {
    this._AttendanceService.getAttendanceById(accountId).subscribe({
      next: (response) => {
        if (response && response.data) {
          console.log(response.data)
          this.attendanceData = response.data.attendance_data.attendance;  
          this.attendancesData = response.data.attendance_data;
          this.employee= response.data.employee;

        }
      },
      error: (err: HttpErrorResponse) => {
         console.log(err);
      }
    });
  }


}
