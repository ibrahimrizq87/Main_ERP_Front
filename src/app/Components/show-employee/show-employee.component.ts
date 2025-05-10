import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../shared/services/employee.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-show-employee',
  standalone: true,
  imports: [TranslateModule,CommonModule],
  templateUrl: './show-employee.component.html',
  styleUrl: './show-employee.component.css'
})
export class ShowEmployeeComponent implements OnInit{

  constructor(
    private _EmployeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  employeeData: any;
  ngOnInit(): void {
    const employeeId = this.route.snapshot.paramMap.get('id'); 
    if (employeeId) {
      this.fetchEmployeeId(employeeId);
    }
  }

  fetchEmployeeId(employeeId: string): void {
    this._EmployeeService.showEmployeeById(employeeId).subscribe({
      next: (response) => {
        if (response && response.data) {
          console.log(response)
          this.employeeData= response.data;
        }
      },
      error: (err: HttpErrorResponse) => {
         console.log(err);
      }
    });
  }
  goBack() {
    this.router.navigate(['/dashboard/employees']);
    }
}
