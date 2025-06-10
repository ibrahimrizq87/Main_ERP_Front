import { Component, OnInit } from '@angular/core';
import { StoreService } from '../../shared/services/store.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

interface StoreData {
  id: number;               
  manager_name: string;  
  address_description: string;       
  name: string;            
  name_en: string;         
  note: string;            
  phone: string;    
  store_id: number | null; 
   city:{name:string,country:{name:string}};        
  updated_at?: string;   
  created_at?: string; 
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
  productBranchStores: any;
  constructor(
    private _StoreService: StoreService,
    private route: ActivatedRoute
  ) {}
  storeData: StoreData | undefined;
  ngOnInit(): void {
    const storeId = this.route.snapshot.paramMap.get('id'); 
    if (storeId) {
      this.fetchAccountData(storeId);
      this.fetchProductBranchStoreByStoreId(storeId);
    }
  }

  fetchAccountData(storeId: string): void {
    this._StoreService.showStoreById(storeId).subscribe({
      next: (response) => {
        if (response && response.data) {
          // console.log(response)
          this.storeData = response.data;
          console.log("store data",this.storeData);
        }
      },
      error: (err: HttpErrorResponse) => {
         console.log(err);
      }
    });
  }
 
  fetchProductBranchStoreByStoreId(storeId: string): void {
    this._StoreService.getProductBranchStoreByStoreId(storeId).subscribe({
      next: (response) => {
        if (response && response.data) {
          // console.log(response)
          this.productBranchStores = response.data.products;
          console.log("Product Branch store data",this.productBranchStores);
        }
      },
      error: (err: HttpErrorResponse) => {
         console.log(err);
      }
    });
  }
}
