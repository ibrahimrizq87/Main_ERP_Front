import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-show-vendor',
  standalone: true,
  imports: [RouterModule ,RouterLinkActive,CommonModule ,TranslateModule],
  templateUrl: './show-vendor.component.html',
  styleUrl: './show-vendor.component.css'
})
export class ShowVendorComponent implements OnInit {
  vendorData: any = {
    userName: '',
    arabicName: '',
    englishName: '',
    currency: '',
    phoneNumbers: [],
    group: [],
    country: '',
    city: ''
  };

  constructor(
    private _UserService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const vendorId = this.route.snapshot.paramMap.get('id'); 
    if (vendorId) {
      this.fetchVendorData(vendorId);
    }
  }

  fetchVendorData(vendorId: string): void {
    this._UserService.showVendorById(vendorId).subscribe({
      next: (response) => {
        if (response && response.data) {
          console.log(response)
          const user = response.data.user;
         
          const userPhone = response.data.user.user_phone;
          const userGroup = response.data.user.user_group;

          this.vendorData = {
            userName: user.user_name || '',
            arabicName: user.arabic_name || '',
            englishName: user.english_name || '',
            currency: user.currency || '',
            phoneNumbers: userPhone.map((phone: any) => phone.phone),
            group: userGroup.map((group:any)=>group.name),
            country: 'Country', 
            city: 'City'       
          };
        }
      },
      error: (err: HttpErrorResponse) => {
         console.log(err);
      }
    });
  }
}