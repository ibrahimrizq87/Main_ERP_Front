import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AttendanceService } from '../../shared/services/attendance.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-update-attendance',
  standalone: true,
  imports: [CommonModule ,TranslateModule,FormsModule ,ReactiveFormsModule],
  templateUrl: './update-attendance.component.html',
  styleUrl: './update-attendance.component.css'
})
export class UpdateAttendanceComponent implements OnInit {
  msgError: string = '';
  msgSuccess:string ='';
  isLoading: boolean = false;
  isSubmited: boolean = false;
  attendanceForm: FormGroup ;
    constructor(
    private _AttendanceService:AttendanceService ,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.attendanceForm = new FormGroup({
      

      check_in: new FormControl(null, [Validators.required]),
      check_out: new FormControl(null, [Validators.required]),
      status: new FormControl(null, [Validators.required]),
      start_status: new FormControl(null, [Validators.required]),
      end_status: new FormControl(null, [Validators.required]),
      working_hours: new FormControl(null, [Validators.required, Validators.min(0)])
     
    
    });
  }
    ngOnInit(): void {
    const attendanceId = this.route.snapshot.paramMap.get('id'); 
    if (attendanceId) {
      this.fetchAttendance(attendanceId);
    }
  }
  fetchAttendance(attendanceId: string): void {
    this._AttendanceService.getAttendanceById(attendanceId).subscribe({
      next: (response) => {
        if (response) {
          const attendanceData = response.data ; 
          console.log(attendanceData)
          this.attendanceForm.patchValue({
            check_in: attendanceData.attendance_data.attendance.check_in,
            check_out: attendanceData.attendance_data.attendance.check_out,
            status: attendanceData.attendance_data.attendance.status,
            start_status: attendanceData.attendance_data.attendance.start_status,
            end_status: attendanceData.attendance_data.attendance.end_status,
            working_hours: attendanceData.attendance_data.attendance.working_hours
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.msgError = err.error.error;
      }
    });
  }
   handleForm(): void {
    if (this.attendanceForm.valid) {
      this.isLoading = true;
      this.isSubmited = true;
  
      const attendanceData = new FormData();
     
      attendanceData.append('check_in', this.attendanceForm.get('check_in')?.value);
      attendanceData.append('check_out', this.attendanceForm.get('check_out')?.value);
      attendanceData.append('status', this.attendanceForm.get('status')?.value);
      attendanceData.append('start_status', this.attendanceForm.get('start_status')?.value);
      attendanceData.append('end_status', this.attendanceForm.get('end_status')?.value);
      attendanceData.append('working_hours', this.attendanceForm.get('working_hours')?.value);
    
    
      const attendanceId = this.route.snapshot.paramMap.get('id');
      
      if (attendanceId) {
        this._AttendanceService.updateAttendance(attendanceId, attendanceData).subscribe({
          next: (response) => {
            this.toastr.success(" تم تعديل الحضور بنجاح");
            this.isLoading = false;
            if (response) {
              this.msgSuccess = response;
              setTimeout(() => {
                this.router.navigate(['/dashboard/attendance-reports']);
              }, 2000);
            }
          },
          error: (err: HttpErrorResponse) => {
            this.toastr.error('حدث خطا اثناء تعديل الحضور');
            this.isLoading = false;
            this.isSubmited = false;
            this.msgError = err.error.error;
          }
        });
      } else {
        this.isLoading = false;
        this.isSubmited = false;
        this.msgError = 'Attendance ID is invalid.';
      }
    }
  } 
  onCancel(): void {
        this.attendanceForm.reset();
        this.router.navigate(['/dashboard/attendance-reports']); 
      }  
}

