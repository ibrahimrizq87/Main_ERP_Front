import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CityService } from '../../shared/services/city.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PermissionService } from '../../shared/services/permission.service';

@Component({
  selector: 'app-city',
  standalone: true,
  imports: [RouterLinkActive, RouterModule,CommonModule,ReactiveFormsModule,FormsModule,
    TranslateModule
  ],
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.css']
})
export class CityComponent implements OnInit {

  cities: any[] = []; 
  filteredCities: any[] = []; // Filtered list to display
  searchQuery: string = ''; 

  constructor(
    private _CityService: CityService, 
    private router: Router,private toastr:ToastrService, 
    public _PermissionService: PermissionService) {}

  ngOnInit(): void {
    this.loadCities(); 
  }

  loadCities(): void {
    this._CityService.viewAllCities().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.cities = response.data; 
          this.filteredCities = this.cities;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  onSearch(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredCities = this.cities.filter(city =>
      city.city.toLowerCase().includes(query) || city.country.toLowerCase().includes(query)
    );
  }

  deleteCity(cityId: number): void {
    if (confirm('Are you sure you want to delete this City?')) {
      this._CityService.deleteCity(cityId).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف المدينة بنجاح');
            this.router.navigate(['/dashboard/city']);
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
