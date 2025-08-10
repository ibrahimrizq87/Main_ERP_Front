import { Component, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [TranslateModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'], 
})
export class HeaderComponent implements OnInit {
  isLanguageDropdownOpen = false;
  isUserDropdownOpen = false; // New property for user dropdown
  isLoggedIn: boolean = false;
  user_name: string = '';
  user_image: string = ""
  iconPairs = [
    { old: 'fa-angle-left', new: 'fa-angle-right' },
    { old: 'fa-chevron-left', new: 'fa-chevron-right' }
  ];
  currentLang: string | undefined;

  constructor(
    private translate: TranslateService,  
    private _Router: Router,
    private _AuthService: AuthService
  ) {
    this.currentLang = localStorage.getItem('lang') || 'ar';
  }

  ngOnInit(): void {
    const token = localStorage.getItem('Token');
    this.isLoggedIn = !!token; 

    if (token) {
      this.getMyInfo(); 
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown')) {
        this.isUserDropdownOpen = false;
      }
    });
  }

  getMyInfo() {
    this._AuthService.getMyInfo().subscribe({
      next: (response) => {
        this.user_name = response.data.user.user_name;
        this.user_image = response.data.user.image || ''; // Handle case where user_image might be null
        console.log(response);
      },
      error: (err: HttpErrorResponse) => {
        localStorage.removeItem('Token');
        this.isLoggedIn = false;
        console.error(err);
      }
    });
  }

  toggleLanguageDropdown() {
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
  }

  toggleUserDropdown() {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  switchLanguage(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
    this.setLanguageDirection(lang);
    this.isLanguageDropdownOpen = false;
  }

  setLanguageDirection(lang: string) {
    const htmlElement = document.documentElement;
    if (lang === 'ar') {
      htmlElement.dir = 'rtl';
      htmlElement.lang = 'ar';
      localStorage.setItem('lang', 'ar');
    } else {
      htmlElement.dir = 'ltr';
      htmlElement.lang = lang;
      localStorage.setItem('lang', lang);
    }
  }

  logout() {
    const formData = new FormData();
    formData.append('user_name', this.user_name);   
    
    this._AuthService.logout(formData).subscribe({
      next: (res) => {
        console.log('Logged out:', res);
        localStorage.removeItem('Token');
        this.isLoggedIn = false;
        this.isUserDropdownOpen = false; // Close dropdown
        this._Router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Logout failed:', err);
        localStorage.removeItem('Token');
        this.isLoggedIn = false;
        this.isUserDropdownOpen = false; // Close dropdown
        this._Router.navigate(['/login']);
      }
    });
  }
}