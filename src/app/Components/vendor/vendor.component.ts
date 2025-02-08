import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, RouterLinkActive, Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-vendor',
  standalone: true,
  imports: [RouterOutlet, RouterModule, RouterLinkActive,CommonModule ,FormsModule,TranslateModule],
  templateUrl: './vendor.component.html',
  styleUrl: './vendor.component.css'
})
export class VendorComponent {

  Vendors: any[] = [];

  constructor(private _UserService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.loadVendor();
  }

  loadVendor(): void {
    this._UserService.viewAllVendor().subscribe({
      next:(response) => {
        if (response) {
          console.log(response.data)
          this.Vendors = response.data;
        }
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
  deleteVendor(vendorId: number): void {
    if (confirm('Are you sure you want to delete this Vendor?')) {
      this._UserService.deleteVendor(vendorId).subscribe({
        next: (response) => {
          if (response) {
            this.router.navigate(['/dashboard/vendor']);
            this.loadVendor();
          }
        },
        error: (err) => {
          console.error(err);
          alert('An error occurred while deleting the Vendor.');
        }
      });
    }
  }

}
