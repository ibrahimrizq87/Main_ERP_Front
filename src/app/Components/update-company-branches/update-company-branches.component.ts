import { Component, OnInit } from '@angular/core';
import { CompanyBranchService } from '../../shared/services/company-branch.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CityService } from '../../shared/services/city.service';
import { CountryService } from '../../shared/services/country.service';
import { AbstractControl, FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import L from 'leaflet';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

@Component({
  selector: 'app-update-company-branches',
  standalone: true,
  imports: [CommonModule,FormsModule, ReactiveFormsModule,TranslateModule,LeafletModule],
  templateUrl: './update-company-branches.component.html',
  styleUrl: './update-company-branches.component.css'
})
export class UpdateCompanyBranchesComponent implements OnInit {

  isSubmitted = false;
  msgError: string = '';
  isLoading: boolean = false;
  countries: any[] = [];
  cities: any[] = [];

  
  map!: L.Map;
  mapOptions: L.MapOptions = {
    center: [24.7136, 46.6753], 
    zoom: 12
  };
  marker: L.Marker | null = null;
  circle: L.Circle | null = null;
  defaultRadius = 200; // meters
  readonly maxImageSize = 2048 * 1024;
  constructor(
    private _CompanyBranchService: CompanyBranchService,
    private _Router: Router,
    private toastr: ToastrService,
    private _CityService: CityService,
    private _CountryService: CountryService,
    private route: ActivatedRoute,
  ) {
    this.loadCountries();
  }

  ngOnInit(): void {
    this.fixLeafletIcons();
    const currency_id = this.route.snapshot.paramMap.get('id'); 
    if (currency_id) {
      this.fetchCompanyBranchData(currency_id);
    }
  }
  fetchCompanyBranchData(id: string) {
    this._CompanyBranchService.getCompanyBranchById(id).subscribe({
      next: (response) => {
        if (response) {
          const companyBranchData = response.data;
          this.companyBranchForm.patchValue({
            name: companyBranchData.name,
            description: companyBranchData.description,
            city_id: companyBranchData.city_id,
            address_details: companyBranchData.address_details,
            latitude: companyBranchData.lat,
            longitude: companyBranchData.long,
            radius: parseFloat(companyBranchData.radius_km),
          });
          this.loadCities(companyBranchData.country_id);
          this.updateMapMarkerAndCircle();
          if (companyBranchData.phones) {
            companyBranchData.phones.forEach((phone: any) => {
              this.phones.push(new FormGroup({
                phone_name: new FormControl(phone.phone_name, Validators.maxLength(255)),
                phone: new FormControl(phone.phone, [Validators.required, Validators.maxLength(255)])
              }));
            });
          }
          console.log(companyBranchData);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.msgError = err.error.error;
      }
    });
  }
  companyBranchForm: FormGroup = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    description: new FormControl(null, [Validators.required]),
    country_id: new FormControl(null),
    city_id: new FormControl(null, [Validators.required]),
    address_details: new FormControl(null),
    latitude: new FormControl(null),
    longitude: new FormControl(null),
    radius: new FormControl(this.defaultRadius, [Validators.min(0)]),
    image: new FormControl(null, [this.validateImage.bind(this)]),
    phones: new FormArray([]),
  });

  private fixLeafletIcons(): void {
    const iconRetinaUrl = 'assets/leaflet/marker-icon-2x.png';
    const iconUrl = 'assets/leaflet/marker-icon.png';
    const shadowUrl = 'assets/leaflet/marker-shadow.png';

    L.Icon.Default.mergeOptions({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }
  selectedFile: File | null = null;
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.companyBranchForm.patchValue({ image: file });
    }
  }
  get phones(): FormArray {
    return this.companyBranchForm.get('phones') as FormArray;
  }

  addPhone(): void {
    this.phones.push(new FormGroup({
      phone_name: new FormControl('', Validators.maxLength(255)),
      phone: new FormControl('', [Validators.required, Validators.maxLength(255)])
    }));
  }
  removePhone(index: number): void {
    this.phones.removeAt(index);
  }
  validateImage(control: AbstractControl): ValidationErrors | null {
    const file = this.selectedFile;
    if (file) {
      const fileType = file.type;
      const fileSize = file.size;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(fileType)) {
        return { invalidFileType: true };
      }
      if (fileSize > this.maxImageSize) {
        return { fileTooLarge: true };
      }
    }
    return null;
  }
  onMapReady(map: L.Map): void {
    this.map = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.onMapClick(e);
    });

    if (this.companyBranchForm.value.latitude && this.companyBranchForm.value.longitude) {
      this.updateMapMarkerAndCircle();
    }
  }

  onMapClick(e: L.LeafletMouseEvent): void {
    const { lat, lng } = e.latlng;
    this.companyBranchForm.patchValue({
      latitude: lat,
      longitude: lng
    });
    this.updateMapMarkerAndCircle();
  }

  updateMapMarkerAndCircle(): void {
    const { latitude, longitude, radius } = this.companyBranchForm.value;

    // Remove existing marker and circle
    if (this.marker) this.map.removeLayer(this.marker);
    if (this.circle) this.map.removeLayer(this.circle);

    // Add new marker and circle if we have coordinates
    if (latitude && longitude) {
      this.marker = L.marker([latitude, longitude]).addTo(this.map);
      this.circle = L.circle([latitude, longitude], {
        radius: radius || this.defaultRadius,
        color: '#3388ff',
        fillColor: '#3388ff',
        fillOpacity: 0.2
      }).addTo(this.map);

      // Center map on the new location
      this.map.setView([latitude, longitude], this.map.getZoom());
    }
  }

  onRadiusChange(): void {
    const radius = this.companyBranchForm.get('radius')?.value;
    if (radius && this.companyBranchForm.value.latitude && this.companyBranchForm.value.longitude) {
      this.updateMapMarkerAndCircle();
    }
  }

  loadCountries(): void {
    this._CountryService.viewAllcountries().subscribe({
      next: (response) => {
        this.countries = response.data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  onCountryChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.companyBranchForm.patchValue({ country_id: selectedValue });
    this.loadCities(selectedValue);
  }

  loadCities(countryId: string): void {
    this._CityService.viewAllcitiesByCountry(countryId).subscribe({
      next: (response) => {
        this.cities = response.data || [];
        this.companyBranchForm.patchValue({ city_id: null });
      },
      error: (err) => {
        console.error(err);
        this.cities = [];
      }
    });
  }

  handleForm() {
    this.isSubmitted = true;

    if (this.companyBranchForm.valid) {
      this.isLoading = true;

      const formData = new FormData();
      formData.append('name', this.companyBranchForm.get('name')?.value);
      formData.append('description', this.companyBranchForm.get('description')?.value);
      formData.append('city_id', this.companyBranchForm.get('city_id')?.value);
      formData.append('address_details', this.companyBranchForm.get('address_details')?.value);
      formData.append('lat', this.companyBranchForm.get('latitude')?.value);
      formData.append('long', this.companyBranchForm.get('longitude')?.value);
      formData.append('radius_km', this.companyBranchForm.get('radius')?.value);
      this.phones.controls.forEach((element, index) => {
        formData.append(`phones[${index}][phone_name]`, element.get('phone_name')?.value || '');
        formData.append(`phones[${index}][phone]`, element.get('phone')?.value);

      });
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      const company_branch_Id = this.route.snapshot.paramMap.get('id');
      if(company_branch_Id){
      this._CompanyBranchService.updateCompanyBranch(company_branch_Id ,formData).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('Company branch added successfully');
            this.isLoading = false;
            this._Router.navigate(['/dashboard/companyBranches']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error('Error adding company branch');
          this.isLoading = false;
          this.msgError = err.error.error;
          console.log(err);
        }
      });
    }}
  }
  cancel() {
   
      this.isSubmitted = false;
      this.isLoading = false;
      this.msgError = '';
      this.companyBranchForm.reset();
      this.selectedFile = null;
      this.phones.clear();
    this._Router.navigate(['/dashboard/companyBranches']);
    }
}
