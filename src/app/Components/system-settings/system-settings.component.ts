import { Component } from '@angular/core';
import { NgModule } from '@angular/core';
import { RouterOutlet, RouterModule, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [ RouterOutlet, RouterModule, RouterLinkActive,CommonModule ,TranslateModule],
  templateUrl: './system-settings.component.html',
  styleUrl: './system-settings.component.css'
})
export class SystemSettingsComponent {

}
