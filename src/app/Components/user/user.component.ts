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
  
  // Search properties
  searchType: string = 'name'; // Default search type
  searchValue: string = '';
  selectedRole: string = '';
  
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
    let params: any = {
      page: this.currentPage,
      per_page: this.itemsPerPage
    };

    if (this.searchType === 'role' && this.selectedRole) {
      params['filter[role]'] = this.selectedRole;
    } 
    else if (this.searchType === 'name' && this.searchValue) {
      params['filter[name]'] = this.searchValue;
    }
    else if (this.searchType === 'user_name' && this.searchValue) {
      params['filter[user_name]'] = this.searchValue;
    }

    this._UserService.getAllUsers(params).subscribe({
      next: (response) => {
        this.handleUserResponse(response);
      },
      error: (err) => {
        console.error(err);
      }
    });
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

  onSearchTypeChange(): void {
    this.searchValue = '';
    this.selectedRole = '';
    this.currentPage = 1;
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
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

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }
}