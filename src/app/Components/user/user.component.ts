import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,RouterModule,FormsModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit {

  users: any[] = []; 
  filteredUsers: any[] = []; 
  searchQuery: string = ''; 

  constructor(private _UserService: UserService, private router: Router,private toastr:ToastrService) {}

  ngOnInit(): void {
    this.loadUsers(); 
  }

  loadUsers(): void {
    this._UserService.viewAllUsers().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.users = response.data; 
          this.filteredUsers = [...this.users];
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this User?')) {
      this._UserService.deleteUser(userId).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف المستخدم بنجاح');
            this.router.navigate(['/dashboard/users']);
            this.loadUsers();
          }
        },
        error: (err) => {
          this.toastr.error('حدث خطا اثناء حذف المستخدم');
          console.error(err);
          // alert('An error occurred while deleting the User.');
        }
      });
    }
  }
  onSearch(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (query === '') {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(user => 
        user.name.toLowerCase().includes(query) || 
        user.user_name.toLowerCase().includes(query)
      );
    }
  }
}
