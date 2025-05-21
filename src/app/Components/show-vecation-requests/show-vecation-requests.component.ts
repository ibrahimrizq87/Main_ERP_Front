import { Component, OnInit } from '@angular/core';
import { VectionService } from '../../shared/services/vection.service';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-show-vecation-requests',
  standalone: true,
  imports: [RouterLink, RouterModule, FormsModule, CommonModule],
  templateUrl: './show-vecation-requests.component.html',
  styleUrls: ['./show-vecation-requests.component.css']
})
export class ShowVecationRequestsComponent implements OnInit {
  vecationData: any;
  isLoading: boolean = false;

  constructor(
    private _VectionService: VectionService,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    const vecationRequest_id = this.route.snapshot.paramMap.get('id');
    if (vecationRequest_id) {
      this.fetchVecationRequestById(vecationRequest_id);
    }
  }

  fetchVecationRequestById(vecationRequest_id: string): void {
    this.isLoading = true;
    this._VectionService.getVecationRequestById(vecationRequest_id).subscribe({
      next: (response) => {
        this.vecationData = response?.data || {};
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching Vecation data:', err.message);
        this.isLoading = false;
        this.toastr.error('Failed to load vacation request details');
      }
    });
  }

  updateStatus(newStatus: string): void {
    if (!this.vecationData?.id) return;
    
    this.isLoading = true;
    this._VectionService.updateRequestApproval(this.vecationData.id, newStatus).subscribe({
      next: (response) => {
        this.toastr.success(`Status updated to ${newStatus}`);
        this.fetchVecationRequestById(this.vecationData.id);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error updating status:', err.message);
        this.isLoading = false;
        this.toastr.error('Failed to update status');
      }
    });
  }

  getAvailableStatusActions(): {status: string, label: string, class: string}[] {
    if (!this.vecationData?.status) return [];
    
    const currentStatus = this.vecationData.status;
    const actions = [];

    if (currentStatus === 'pending') {
      actions.push(
        { status: 'approved', label: 'Approve', class: 'btn-success' },
        { status: 'rejected', label: 'Reject', class: 'btn-danger' }
      );
    } else if (currentStatus === 'approved') {
      actions.push(
        { status: 'pending', label: 'Mark as Pending', class: 'btn-warning' },
        { status: 'rejected', label: 'Reject', class: 'btn-danger' }
      );
    } else if (currentStatus === 'rejected') {
      actions.push(
        { status: 'pending', label: 'Mark as Pending', class: 'btn-warning' },
        { status: 'approved', label: 'Approve', class: 'btn-success' }
      );
    }

    return actions;
  }
}