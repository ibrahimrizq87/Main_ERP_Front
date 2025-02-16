import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { RouterOutlet, RouterModule, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AccountSettingService } from '../../shared/services/account_settings.service';
// import { messaging } from '../../../configs/firebase.config';
// import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent, RouterOutlet, RouterModule, RouterLinkActive,CommonModule ,TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  dropdownStates: { [key: string]: boolean } = {};
constructor (private router :Router ,     
  private _AccountSettingService: AccountSettingService,){}
  accountNavs: MainAccountNavSetting[] = [];

  // requestPermission() {
  //   messaging.getToken({vapidKey: environment.firebase.vapidKey})
  //     .then((currentToken) => {
  //       if (currentToken) {
  //         console.log(currentToken);
  //       } else {
  //         console.log('No registration token available. Request permission to generate one.');
  //       }
  //     }).catch((err) => {
  //       console.log(err);
  //     });
  // }

  // listen() {
  //   messaging.onMessage((incomingMessage) => {
  //     console.log(incomingMessage);
  //   })
  // }
  ngOnInit(): void {
    this.loadSettings();
    // this.requestPermission();
    // this.listen();
  }
loadSettings(): void {
  this._AccountSettingService.getMainAccountNav().subscribe({
    next: (response) => {
      if (response) {
        this.accountNavs = response.data;
      }

      // this.isLoading = false;
    },
    error: (err) => {
      console.error(err);
      // this.isLoading = false;
    }
  });
}



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
  name: {ar:string,en:string};
}

interface Account {
  id: string;
  name: string;
  parent_id?: string;
  child?: Account[];
  showChildren?: boolean;
}