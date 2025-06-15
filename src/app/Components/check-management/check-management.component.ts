
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../shared/services/account.service'
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { BankService } from '../../shared/services/bank.service';
import { CheckService } from '../../shared/services/check.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PermissionService } from '../../shared/services/permission.service';



@Component({
  selector: 'app-check-management',
  standalone: true,
  imports: [CommonModule, RouterLinkActive, RouterModule, FormsModule, ReactiveFormsModule,TranslateModule],
  templateUrl: './check-management.component.html',
  styleUrl: './check-management.component.css'
})
export class CheckManagementComponent {
  status ='waiting';
  checks: any;
  constructor(
    private _CheckServic: CheckService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    public _PermissionService: PermissionService

  ) { }


  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const newStatus = params.get('status');
      if (newStatus && this.status !== newStatus) { 
        if(newStatus == 'waiting' || newStatus == 'approved' ||newStatus == 'rejected' ){
          this.status = newStatus;
        }else{
          this.router.navigate([`/dashboard/check_list/${this.status}`]);
        }         

      }

    });

    this.getChecks();
  }

  changeStatus(status:string){
    this.status = status;
    this.router.navigate([`/dashboard/check_list/${status}`]);
    this.getChecks();
    
      }
  ManageChangeStatus(status:string , id:string){

    this._CheckServic.updateCheckStatus(id ,status ).subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.getChecks();
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
}
  getChecks() {
    this._CheckServic.getCheckBystatus(this.status).subscribe({
      next: (response) => {
        if (response) {
          this.checks = response.data;
          console.log(response);
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  deleteCheck(checkId: number): void {
    if (confirm('Are you sure you want to delete this City?')) {
      this._CheckServic.deleteCheck(checkId).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف الشيك بنجاح');
            // this.router.navigate(['/dashboard/city']);
            this.getChecks();
          }
        },
        error: (err) => {
          this.toastr.error('حدث خطا اثناء حذف الشيك');
          console.error(err);
          // alert('An error occurred while deleting the City.');
        }
      });
    }
  }
}

