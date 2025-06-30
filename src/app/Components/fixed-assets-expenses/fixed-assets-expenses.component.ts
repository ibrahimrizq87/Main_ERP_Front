import { Component } from '@angular/core';
import { EmployeeService } from '../../shared/services/employee.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PermissionService } from '../../shared/services/permission.service';
import { Subject, debounceTime } from 'rxjs';
import { AccountService } from '../../shared/services/account.service';

@Component({
  selector: 'app-fixed-assets-expenses',
  standalone: true,
  imports: [CommonModule,RouterModule,FormsModule,TranslateModule],
  templateUrl: './fixed-assets-expenses.component.html',
  styleUrl: './fixed-assets-expenses.component.css'
})
export class FixedAssetsExpensesComponent {

assets: any[] = [];
  filteredEmployee: any[] = []; 
  searchTerm: string = '';

  constructor(private _AccountService: AccountService, private router: Router,private toastr:ToastrService,
            public _PermissionService: PermissionService
    
  ) {
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(query => {
      this.loadEmployees();
    });
  }

  ngOnInit(): void {
    this.loadEmployees(); 
  }

  onSearchChange() {
    this.searchSubject.next(this.searchQuery);
  }

  private searchSubject = new Subject<string>();
  searchQuery: string = '';


  loadEmployees(): void {
    this._AccountService.getAssetEquations(
      this.searchQuery
    ).subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.assets = response.data.assets;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }




  calculateAssetExpenses(): void {
    this._AccountService.CalculateAssetExpenses().subscribe({
      next: (response) => {
        if (response) {
          this.loadEmployees();
                      this.toastr.success('تمت العميل بنجاح');

          
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }



  
}
