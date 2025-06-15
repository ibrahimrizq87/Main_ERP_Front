import { Component } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ColorService } from '../../shared/services/colors.service';
import { ToastrService } from 'ngx-toastr';
import { PermissionService } from '../../shared/services/permission.service';

@Component({
  selector: 'app-colors',
  standalone: true,
  imports: [RouterLinkActive, RouterModule,CommonModule,ReactiveFormsModule,FormsModule,
    TranslateModule
  ],
  
  templateUrl: './colors.component.html',
  styleUrl: './colors.component.css'
})
export class ColorsComponent {



  colors: any[] = []; 
  filteredCountries: any[] = []; 
  searchQuery: string = ''; 

  constructor(private _ColorService: ColorService, private router: Router,private toastr:ToastrService,
     public _PermissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.loadCities(); 
  }

  loadCities(): void {
    this._ColorService.viewAllColors().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.colors = response.data; 
          // this.filteredCountries = this.countries;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  // onSearch(): void {
  //   const query = this.searchQuery.toLowerCase();
  //   this.filteredCountries = this.countries.filter(city =>
  //     city.city.toLowerCase().includes(query) || city.country.toLowerCase().includes(query)
  //   );
  // }

  deleteColor(cityId: number): void {
    if (confirm('Are you sure you want to delete this City?')) {
      this._ColorService.deleteColor(cityId).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف المدينة بنجاح');
            // this.router.navigate(['/dashboard/city']);
            this.loadCities();
          }
        },
        error: (err) => {
          this.toastr.error('حدث خطا اثناء حذف المدينة');
          console.error(err);
          // alert('An error occurred while deleting the City.');
        }
      });
    }
  }
}
