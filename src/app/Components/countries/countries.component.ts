import { Component } from '@angular/core';



import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CountryService } from '../../shared/services/country.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-countries',
  standalone: true,
  imports: [RouterLinkActive, RouterModule,CommonModule,ReactiveFormsModule,FormsModule,
    TranslateModule
  ],
  templateUrl: './countries.component.html',
  styleUrl: './countries.component.css'
})

export class CountriesComponent  {

  countries: any[] = []; 
  filteredCountries: any[] = []; // Filtered list to display
  searchQuery: string = ''; 

  constructor(private _CountryService: CountryService, private router: Router,private toastr:ToastrService) {}

  ngOnInit(): void {
    this.loadCities(); 
  }

  loadCities(): void {
    this._CountryService.viewAllcountries().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.countries = response.data; 
          this.filteredCountries = this.countries;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  onSearch(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredCountries = this.countries.filter(city =>
      city.city.toLowerCase().includes(query) || city.country.toLowerCase().includes(query)
    );
  }

  deleteCountry(cityId: number): void {
    if (confirm('Are you sure you want to delete this City?')) {
      this._CountryService.deleteCountry(cityId).subscribe({
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
