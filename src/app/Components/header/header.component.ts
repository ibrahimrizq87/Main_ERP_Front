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
  isLoggedIn: boolean = false;
  user_name: string = '';
  iconPairs = [
        { old: 'fa-angle-left', new: 'fa-angle-right' },
        { old: 'fa-chevron-left', new: 'fa-chevron-right' } ];
  //currentIconDirection = 'right'; // Default to right-facing icon
  currentLang: string | undefined;

  constructor(private translate: TranslateService,  private _Router: Router,private _AuthService: AuthService) {
    this.currentLang= localStorage.getItem('lang') || 'ar';

  }
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
  toggleLanguageDropdown() {
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
  }

  switchLanguage(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
    //this.updateIcons();
    this.setLanguageDirection(lang);
    this.isLanguageDropdownOpen = false;
    //this.iconSwitcherService.switchIcons(lang, this.iconPairs);

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