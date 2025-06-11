
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule, NgxPaginationModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit {
  roles: any[] = [];
  users: any[] = []; 
  filteredUsers: any[] = []; 
  searchQuery: string = '';
  selectedRoleName: string | null = null;

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  lastPage: number = 1;

  constructor(
    private _UserService: UserService, 
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadUsers();
  }

  loadUsers(): void {
    if (this.selectedRoleName) {
      this._UserService.viewAllUsersByRole(this.selectedRoleName).subscribe({
        next: (response) => {
          this.handleUserResponse(response);
        },
        error: (err) => {
          console.error(err);
        }
      });
    } else {
      this._UserService.viewAllUsers().subscribe({
        next: (response) => {
          this.handleUserResponse(response);
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
  }

  private handleUserResponse(response: any): void {
    if (response) {
      this.users = response.data; 
      this.filteredUsers = [...this.users];
      this.totalItems = response.meta?.total || this.users.length;
      this.lastPage = response.meta?.last_page || 1;
    }
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this User?')) {
      this._UserService.deleteUser(userId).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف المستخدم بنجاح');
            this.loadUsers();
          }
        },
        error: (err) => {
          this.toastr.error('حدث خطا اثناء حذف المستخدم');
          console.error(err);
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
    this.currentPage = 1;
  }

  loadRoles(): void {
    this._UserService.getAllRoLes().subscribe({
      next: (response) => {
        if (response) {
          this.roles = response.data; 
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  onRoleChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }
}