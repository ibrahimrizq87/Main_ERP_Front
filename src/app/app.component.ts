import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {  TranslateService } from '@ngx-translate/core';
import { PermissionService } from './shared/services/permission.service';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { CommonModule } from '@angular/common';  // add this import

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
    TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'erp';

  constructor(private translate: TranslateService , private _PermissionService:PermissionService) {
    this.translate.setDefaultLang(localStorage.getItem('lang') || 'ar'); 
    this._PermissionService.savePermissionsFromServer();
  }
}
