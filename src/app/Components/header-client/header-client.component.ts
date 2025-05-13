import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-client',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterModule],
  templateUrl: './header-client.component.html',
  styleUrl: './header-client.component.css'
})
export class HeaderClientComponent implements OnInit {
  isLoggedIn: boolean = false;
  user_name: string = '';

  constructor(
    private _Router: Router,
    private _AuthService: AuthService
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('Token');
    this.isLoggedIn = !!token; 

    if (token) {
      this.getMyInfo(); 
    }
  }

  getMyInfo() {
    this._AuthService.getMyInfo().subscribe({
      next: (response) => {
        this.user_name = response.data.user.user_name;
        console.log(response);
      },
      error: (err: HttpErrorResponse) => {
        localStorage.removeItem('Token');
        this.isLoggedIn = false;
        console.error(err);
      }
    });
  }

  logout() {
    const formData = new FormData();
    formData.append('user_name', this.user_name);   
    this._AuthService.logout(formData).subscribe({
      next: (res) => {
        console.log('Logged out:', res);
        localStorage.removeItem('Token');
        this.isLoggedIn = false;
        this._Router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Logout failed:', err);
    
        localStorage.removeItem('Token');
        this.isLoggedIn = false;
        this._Router.navigate(['/login']);
      }
    });
  }
}
