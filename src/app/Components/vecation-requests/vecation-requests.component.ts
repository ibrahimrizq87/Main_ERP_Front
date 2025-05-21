import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {  VectionService } from '../../shared/services/vection.service';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { ToastrModule, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-vecation-requests',
  standalone: true,
  imports: [CommonModule, TranslateModule,RouterLink,RouterModule,RouterLinkActive],
  templateUrl: './vecation-requests.component.html',
  styleUrls: ['./vecation-requests.component.css']
})
export class VecationRequestsComponent {

  activeMainTab: 'old' | 'new' | null = null; 
  activeSubTab: 'pending' | 'approved' | 'rejected' = 'pending';
  requests: any[] = [];
  isLoading: boolean = false;
  showSubTabs: boolean = false;

  constructor(private _VectionService: VectionService,private toastr:ToastrService) {}

  changeMainTab(tab: 'old' | 'new'): void {
    this.activeMainTab = tab;
    this.showSubTabs = true;
    this.activeSubTab = 'pending';
    this.loadRequests();
  }

  changeSubTab(tab: 'pending' | 'approved' | 'rejected'): void {
    this.activeSubTab = tab;
    this.loadRequests();
  }

  loadRequests(): void {
    if (!this.activeMainTab) return;
    
    this.isLoading = true;
    this._VectionService.getByStatus(this.activeSubTab, this.activeMainTab).subscribe({
      next: (response) => {
        this.requests = response.data;
        console.log(this.requests);
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  deleteVecationRequest(vecation_request_id: number): void {
    if (confirm('Are you sure you want to delete this Vecation Request?')) {
      this._VectionService.deleteVecationRequest(vecation_request_id).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف Vecation Requestبنجاح');
            // this.router.navigate(['/dashboard/vecations']);
            this.loadRequests();
          }
        },
        error: (err) => {
          this.toastr.error(' Vecation Request حدث خطا اثناء حذف ');
          console.error(err);
        }
      });
    }
  }
}