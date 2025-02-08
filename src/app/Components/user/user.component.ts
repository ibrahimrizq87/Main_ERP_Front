import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,RouterModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit {

  users: any[] = []; 
  filteredCities: any[] = []; 
  searchQuery: string = ''; 

  constructor(private _UserServicev: UserService, private router: Router) {}

  ngOnInit(): void {
    this.loadUsers(); 
  }

  loadUsers(): void {
    this._UserServicev.viewAllUsers().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.users = response.data; 
          // this.filteredCities = this.users;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  // onSearch(): void {
  //   const query = this.searchQuery.toLowerCase();
  //   this.filteredCities = this.users.filter(city =>
  //     city.city.toLowerCase().includes(query) || city.country.toLowerCase().includes(query)
  //   );
  // }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this User?')) {
      this._UserServicev.deleteUser(userId).subscribe({
        next: (response) => {
          if (response) {
            this.router.navigate(['/dashboard/users']);
            this.loadUsers();
          }
        },
        error: (err) => {
          console.error(err);
          alert('An error occurred while deleting the User.');
        }
      });
    }
  }
}
