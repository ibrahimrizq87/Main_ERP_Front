import { Component, OnInit } from '@angular/core';
import { StoreService } from '../../shared/services/store.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

interface StoreData {
  id: number;               
  manager: string;         
  name: string;            
  name_en: string;         
  note: string;            
  phone_number: string;    
  store_id: number | null; 
  type: string;            
  last_update?: string;   
  last_update_creator?: string; 
  child?: StoreData[];
}
@Component({
  selector: 'app-show-store',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,RouterModule ,TranslateModule],
  templateUrl: './show-store.component.html',
  styleUrl: './show-store.component.css'
})
export class ShowStoreComponent implements OnInit{
  constructor(
    private _StoreService: StoreService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  storeData: StoreData | undefined;
  ngOnInit(): void {
    const accountId = this.route.snapshot.paramMap.get('id'); 
    if (accountId) {
      this.fetchAccountData(accountId);
    }
  }

  fetchAccountData(storeId: string): void {
    this._StoreService.showStoreById(storeId).subscribe({
      next: (response) => {
        if (response && response.data) {
          console.log(response)
          this.storeData = response.data;
        }
      },
      error: (err: HttpErrorResponse) => {
         console.log(err);
      }
    });
  }

}
