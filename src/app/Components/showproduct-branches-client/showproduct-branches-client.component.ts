import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-showproduct-branches-client',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './showproduct-branches-client.component.html',
  styleUrl: './showproduct-branches-client.component.css'
})
export class ShowproductBranchesClientComponent implements OnInit {
goToBranches() {
  this.router.navigate(['/']);
}

  storeData: any;

  constructor(
    private _AuthService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    console.log('product ID:', productId);
    if (productId) {

      this.fetchPurchaseData(productId);
    }
  }

 
  fetchPurchaseData(productId: string): void {
    this._AuthService.getProductBranchById(productId).subscribe({
      next: (response) => {
        console.log(response.data);
        this.storeData = response.data || {};
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching purchase data:', err.message);
      }
    });
  }
  
}
