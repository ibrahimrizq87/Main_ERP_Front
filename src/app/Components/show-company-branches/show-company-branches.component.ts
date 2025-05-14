import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CompanyBranchService } from '../../shared/services/company-branch.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-show-company-branches',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './show-company-branches.component.html',
  styleUrls: ['./show-company-branches.component.css']
})
export class ShowCompanyBranchesComponent implements OnInit, AfterViewInit {
  companyBranchData: any;
  private map!: L.Map;
  private marker!: L.Marker;
  private circle!: L.Circle;

  constructor(
    private _CompanyBranchService: CompanyBranchService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const companyBranchId = this.route.snapshot.paramMap.get('id'); 
    if (companyBranchId) {
      this.fetchCompanyBranchId(companyBranchId);
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    // Create map with default center (will be updated when data loads)
    this.map = L.map('branchMap').setView([24.7136, 46.6753], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }

  private updateMap(): void {
    if (!this.companyBranchData) return;

    const lat = parseFloat(this.companyBranchData.lat);
    const lng = parseFloat(this.companyBranchData.long);
    const radius = parseFloat(this.companyBranchData.radius_km)

    // Clear existing layers
    if (this.marker) this.map.removeLayer(this.marker);
    if (this.circle) this.map.removeLayer(this.circle);

    // Add new marker and circle
    this.marker = L.marker([lat, lng]).addTo(this.map);
    this.circle = L.circle([lat, lng], {
      radius: radius,
      color: '#3388ff',
      fillColor: '#3388ff',
      fillOpacity: 0.2
    }).addTo(this.map);

    // Center map on the branch location
    this.map.setView([lat, lng], 14);
  }

  fetchCompanyBranchId(companyBranchId: string): void {
    this._CompanyBranchService.getCompanyBranchById(companyBranchId).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.companyBranchData = response.data;
          this.updateMap();
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard/companyBranches']);
  }
}