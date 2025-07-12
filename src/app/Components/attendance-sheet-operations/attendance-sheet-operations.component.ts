import { Component, OnInit } from '@angular/core';
import { BankService } from '../../shared/services/bank.service';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PermissionService } from '../../shared/services/permission.service';
import { AttendanceService } from '../../shared/services/attendance.service';

@Component({
  selector: 'app-attendance-sheet-operations',
  standalone: true,
  imports: [CommonModule,RouterLinkActive,RouterModule ,TranslateModule,FormsModule],
  templateUrl: './attendance-sheet-operations.component.html',
  styleUrl: './attendance-sheet-operations.component.css'
})
export class AttendanceSheetOperationsComponent {
  constructor(
    private _AttendanceService: AttendanceService, 
    private router: Router,
    private toastr:ToastrService,    
    public _PermissionService: PermissionService
  ) {}

selectedFile: File | null = null;

onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.selectedFile = input.files[0];
  }
}


importAttendance(): void {
  if (!this.selectedFile) return;

  const formData = new FormData();
  formData.append('file', this.selectedFile);
  this._AttendanceService.importAttendance(formData).subscribe({
      next: (response) => {
            this.toastr.success('تمت العملية بنجاح');
            console.log(response)

      },
      error: (err) => {
        console.error("Error:", err);
        this.toastr.error('حدث خطا ');

      }
    });

}

  exportAttendance(){

    const name = 'attendance template';
    this._AttendanceService.exportAttendanceTemplate().subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', name+'.xlsx'); 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      error: (err) => {
        console.error("Error downloading file:", err);
      }
    });
  }


}
