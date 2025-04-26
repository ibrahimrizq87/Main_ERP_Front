import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../../shared/services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule,TranslateModule,FormsModule,RouterModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css'
})
export class RolesComponent  implements OnInit {

  Roles: any[] = []; 
  filteredRoles: any[] = [];
  searchTerm: string = '';

  constructor(private _UserService: UserService, private router: Router,
     private toastr:ToastrService

  ) {}

  ngOnInit(): void {
    this.loadRoles(); 
  }

  loadRoles(): void {
    this._UserService.getAllRoLes().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.Roles = response.data; 
          this.filteredRoles = [...this.Roles];
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  deleteRole(roleId: number): void {
    if (confirm('هل أنت متأكد أنك تريد حذف هذا الدور؟')) {
      this._UserService.deleteRole(roleId).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف الدور بنجاح');
            this.router.navigate(['/dashboard/roles']);
            this.loadRoles();
          }
        },
        error: (err) => {
          this.toastr.error('حدث خطأ أثناء حذف الدور');
          console.error(err);
          // alert('حدث خطأ أثناء حذف الوحدة.');
        }
      });
    }
  }
  
  searchRoles(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredRoles = [...this.Roles];
    } else {
      this.filteredRoles = this.Roles.filter(role =>
        role.name.toLowerCase().includes(this.searchTerm.toLowerCase()) 
      );
    }
  }}
