import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-roles-system',
  standalone: true,
  imports: [TranslateModule,CommonModule],
  templateUrl: './roles-system.component.html',
  styleUrl: './roles-system.component.css'
})
export class RolesSystemComponent implements OnInit {
  activeTab: string = 'users';
  users: any[] = []; 
  roles: any[]=[];
  selectedUserId: number | null = null;
  selectedRoleId: number | null = null;
  userPermissions: any = null;
  rolesPermissions: any;
  constructor(private _UserService: UserService, private router: Router,private toastr:ToastrService) {}

  ngOnInit(): void {
    this.loadUsers(); 
    this.loadRoles();
  }
  loadUsers(): void {
    this._UserService.viewAllUsers().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.users = response.data; 
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  onUserChange(event: Event): void {
    const selectedUserId = +(event.target as HTMLSelectElement).value;
    this.selectedUserId = selectedUserId;
  
    if (selectedUserId) {
      this._UserService.getUserPermissionsForEdit(selectedUserId).subscribe({
        next: (response) => {
          if (response) {
            this.userPermissions = response.data;
            console.log('User permissions:', this.userPermissions);
          }
        },
        error: (err) => {
          console.error('Error fetching user permissions:', err);
          this.toastr.error('Failed to load user permissions');
        }
      });
    }
  }
  
  onPermissionUserToggle(moduleName: string, permission: any): void {
    permission.has_permission = !permission.has_permission;
  
    // Optionally: collect updated permissions or log them
    console.log(`Permission toggled for module: ${moduleName}`, permission);
  }
  assignPermissionsToSelectedUser(): void {
    if (!this.selectedUserId || !this.userPermissions) {
      this.toastr.warning('Please select a user first');
      return;
    }
  
    const selectedPermissionIds: number[] = [];
  
    this.userPermissions.forEach((module: any) => {
      module.permissions.forEach((permission: any) => {
        if (permission.has_permission) {
          selectedPermissionIds.push(permission.id);
        }
      });
    });
  
    this._UserService.assignPermissionsToUser(this.selectedUserId, selectedPermissionIds).subscribe({
      next: () => {

        this.toastr.success('User Permissions assigned successfully!');
        console.log('User Permissions assigned successfully!');
      },
      error: (error) => {
        console.error('Error assigning permissions:', error);
        this.toastr.error('Failed to assign permissions');
      }
    });
  }
  
  onPermissionRoleToggle(moduleName: string, permission: any): void {
    permission.has_permission = !permission.has_permission;
  
    // Optionally: collect updated permissions or log them
    console.log(`Permission toggled for module: ${moduleName}`, permission);
  }
loadRoles():void{
  this._UserService.getAllRoLes().subscribe({
    next: (response) => {
      if (response) {
        console.log(response);
        this.roles= response.data;
      }
    },
    error: (err) => {
      console.error(err);
    }
  });
}
onRoleChange(event: Event): void {
  const selectedRoleId = +(event.target as HTMLSelectElement).value;
  this.selectedRoleId = selectedRoleId;
  if (selectedRoleId) {
    this._UserService.getRolesPermissionsForEdit(selectedRoleId).subscribe({
      next: (response) => {
        if (response) {
          this.rolesPermissions = response.data;
          console.log('Roles permissions:', this.rolesPermissions);
        }
      },
      error: (err) => {
        console.error('Error fetching user permissions:', err);
        this.toastr.error('Failed to load user permissions');
      }
    });
  }
}
assignPermissionsToSelectedRole(): void {
  if (!this.selectedRoleId || !this.rolesPermissions) {
    this.toastr.warning('Please select a user first');
    return;
  }

  const selectedPermissionIds: number[] = [];

  this.rolesPermissions.forEach((module: any) => {
    module.permissions.forEach((permission: any) => {
      if (permission.has_permission) {
        selectedPermissionIds.push(permission.id);
      }
    });
  });

  this._UserService.assignPermissionsToRole(this.selectedRoleId, selectedPermissionIds).subscribe({
    next: () => {
      this.toastr.success('Roles Permissions assigned successfully!');
      console.log('Roles Permissions assigned successfully!');
    },
    error: (error) => {
      console.error('Error assigning permissions:', error);
      this.toastr.error('Failed to assign permissions');
    }
  });
}
}