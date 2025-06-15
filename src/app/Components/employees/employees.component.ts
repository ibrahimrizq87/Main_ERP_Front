import { Component } from '@angular/core';
import { EmployeeService } from '../../shared/services/employee.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PermissionService } from '../../shared/services/permission.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule,RouterModule,FormsModule,TranslateModule],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.css'
})
export class EmployeesComponent {
  employees: any[] = []; 
  filteredEmployee: any[] = []; 
  searchTerm: string = '';

  constructor(private _EmployeeService: EmployeeService, private router: Router,private toastr:ToastrService,
            public _PermissionService: PermissionService
    
  ) {}

  ngOnInit(): void {
    this.loadEmployees(); 
  }

  loadEmployees(): void {
    this._EmployeeService.getAllEmployees().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.employees = response.data;
          this.filteredEmployee = [...this.employees]; 
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  filterEmployees(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredEmployee = this.employees.filter(employee => 
      employee.currency_name_ar?.toLowerCase().includes(term) ||
      employee.derivative_name_ar?.toLowerCase().includes(term) ||
      employee.abbreviation?.toLowerCase().includes(term) ||
      employee.value?.toString().toLowerCase().includes(term)
    );
  }
  deleteEmployee(employee_id: number): void {
    if (confirm('Are you sure you want to delete this Employee?')) {
      this._EmployeeService.deleteEmployee(employee_id).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف employee بنجاح');
            this.router.navigate(['/dashboard/employees']);
            this.loadEmployees();
          }
        },
        error: (err) => {
          this.toastr.error(' employee حدث خطا اثناء حذف ');
          console.error(err);
        }
      });
    }
  }
}
