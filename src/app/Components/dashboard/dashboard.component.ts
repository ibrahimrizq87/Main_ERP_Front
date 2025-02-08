import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { RouterOutlet, RouterModule, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent, RouterOutlet, RouterModule, RouterLinkActive,CommonModule ,TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  dropdownStates: { [key: string]: boolean } = {};
constructor (private router :Router ){}
  // Toggle the dropdown for a specific nav item
  toggleDropdown(navItem: string) {
    this.dropdownStates[navItem] = !this.dropdownStates[navItem];
  }
  bankMangment(){
    this.router.navigate(['/dashboard/bank']);
  }
  accounting(id:string){
this.router.navigate(['/dashboard/accounting/'+id]);
  }
  // Check if the dropdown for a specific nav item is open
  isDropdownOpen(navItem: string): boolean {
    return !!this.dropdownStates[navItem];
  }
}

