import { Component } from '@angular/core';
import { AttendanceService } from '../../shared/services/attendance.service';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-show-attendance-details',
  standalone: true,
  imports: [],
  templateUrl: './show-attendance-details.component.html',
  styleUrl: './show-attendance-details.component.css'
})
export class ShowAttendanceDetailsComponent {


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
          console.log(response)
        }
      },
      error: (err: HttpErrorResponse) => {
         console.log(err);
      }
    });
  }


}
