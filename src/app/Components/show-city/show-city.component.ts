import { Component, OnInit } from '@angular/core';
import { CityService } from '../../shared/services/city.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-show-city',
  standalone: true,
  imports: [ RouterModule],
  templateUrl: './show-city.component.html',
  styleUrl: './show-city.component.css'
})
export class ShowCityComponent implements OnInit {

  cityData: any;

  constructor(
    private _CityService: CityService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const cityId = this.route.snapshot.paramMap.get('id');
    if (cityId) {
      this.fetchMachineData(cityId);
    }
  }

 
  fetchMachineData(cityId: string): void {
    this._CityService.getCityById(cityId).subscribe({
      next: (response) => {
        console.log(response.data);
        this.cityData = response.data|| {};
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching Product data:', err.message);
      }
    });
  }
  
}