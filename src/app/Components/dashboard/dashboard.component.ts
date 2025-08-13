import { Component, HostListener } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { RouterOutlet, RouterModule, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AccountSettingService } from '../../shared/services/account_settings.service';
import { PermissionService } from '../../shared/services/permission.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent, RouterOutlet, RouterModule, RouterLinkActive, CommonModule, TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  dropdownStates: { [key: string]: boolean } = {};
  accountNavs: MainAccountNavSetting[] = [];

  constructor(
    private router: Router,
    private _AccountSettingService: AccountSettingService,
    public _PermissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this._AccountSettingService.getMainAccountNav().subscribe({
      next: (response) => {
        if (response) {
          this.accountNavs = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  toggleDropdown(dropdownId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    // Close all other dropdowns
    Object.keys(this.dropdownStates).forEach(key => {
      if (key !== dropdownId) {
        this.dropdownStates[key] = false;
      }
    });
    
    // Toggle the clicked dropdown
    this.dropdownStates[dropdownId] = !this.dropdownStates[dropdownId];
  }

  isDropdownOpen(dropdownId: string): boolean {
    return !!this.dropdownStates[dropdownId];
  }

  closeAllDropdowns(): void {
    Object.keys(this.dropdownStates).forEach(key => {
      this.dropdownStates[key] = false;
    });
  }

  bankMangment() {
    this.closeAllDropdowns();
    this.router.navigate(['/dashboard/bank']);
  }

  accounting(id: string) {
    this.closeAllDropdowns();
    this.router.navigate(['/dashboard/accounting/' + id]);
  }
}

export interface MainAccountNavSetting {
  id: number;
  title: string;
  order: number;
  children: ChildAccountNavSetting[];
}

export interface ChildAccountNavSetting {
  id: number;
  title: string;
  account: AccountChild;
}

interface AccountChild {
  id: string;
  name: { ar: string, en: string };
}

interface Account {
  id: string;
  name: string;
  parent_id?: string;
  child?: Account[];
  showChildren?: boolean;
}