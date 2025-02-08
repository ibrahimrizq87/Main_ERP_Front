// import { Component, OnInit } from '@angular/core';
// import { Router, RouterLinkActive, RouterModule } from '@angular/router';
// import { StoreService } from '../../shared/services/store.service';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-stores',
//   standalone: true,
//   imports: [ RouterLinkActive,RouterModule,CommonModule],
//   templateUrl: './stores.component.html',
//   styleUrl: './stores.component.css'
// })
// export class StoresComponent implements OnInit {

//   stores: any[] = []; 

//   constructor(private _StoreService: StoreService, private router: Router) {}

//   ngOnInit(): void {
//     this.loadStores(); 
//   }

//   loadStores(): void {
//     this._StoreService.getAllStores().subscribe({
//       next: (response) => {
//         if (response) {
//           console.log(response);
//           this.stores = response.data; 
//         }
//       },
//       error: (err) => {
//         console.error(err);
//       }
//     });
//   }
//   deleteStore(store_id: number): void {
//     if (confirm('Are you sure you want to delete this Store ?')) {
//       this._StoreService.deleteStore(store_id).subscribe({
//         next: (response) => {
//           if (response) {
//             this.router.navigate(['/dashboard/city']);
//             this.loadStores();
//           }
//         },
//         error: (err) => {
//           console.error(err);
//           alert('An error occurred while deleting the Store.');
//         }
//       });
//     }
//   }
// }

// import { Component, OnInit } from '@angular/core';
// import { Router, RouterLinkActive, RouterModule } from '@angular/router';
// import { StoreService } from '../../shared/services/store.service';
// import { CommonModule } from '@angular/common';
// import { StorenodeComponent } from '../storenode/storenode.component';

// @Component({
//   selector: 'app-stores',
//   standalone: true,
//   imports: [ RouterLinkActive,RouterModule,CommonModule,StorenodeComponent],
//   templateUrl: './stores.component.html',
//   styleUrl: './stores.component.css'
// })
// export class StoresComponent implements OnInit {

//   stores: any[] = []; 
//   parentAccounts: any[] = []; 
//   hierarchicalAccounts: any[] = []; 
//   constructor(private _StoreService: StoreService, private router: Router) {}

//   ngOnInit(): void {
//     this.loadStores(); 
//   }

//   loadStores(): void {
//     this._StoreService.getAllStores().subscribe({
//       next: (response) => {
//         if (response) {
//           console.log(response);
//           this.stores = response.data; 
//         }
//       },
//       error: (err) => {
//         console.error(err);
//       }
//     });
//   }
//   buildAccountHierarchy(stores: any[]): any[] {
//     return stores.map(store => ({
//       ...store,
//       showChildren: false, 
//       child: store.child ? this.buildAccountHierarchy(store.child) : []
//     }));
//   }
//   deleteStore(store_id: number): void {
//     if (confirm('Are you sure you want to delete this Store ?')) {
//       this._StoreService.deleteStore(store_id).subscribe({
//         next: (response) => {
//           if (response) {
//             this.router.navigate(['/dashboard/stores']);
//             this.loadStores();
//           }
//         },
//         error: (err) => {
//           console.error(err);
//           alert('An error occurred while deleting the Store.');
//         }
//       });
//     }
//   }
// }
import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { StoreService } from '../../shared/services/store.service';
import { CommonModule } from '@angular/common';
import { StorenodeComponent } from '../storenode/storenode.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-stores',
  standalone: true,
  imports: [RouterLinkActive, RouterModule, CommonModule, StorenodeComponent,TranslateModule],
  templateUrl: './stores.component.html',
  styleUrls: ['./stores.component.css']
})
export class StoresComponent implements OnInit {

  stores: any[] = [];
  hierarchicalAccounts: any[] = [];

  constructor(private _StoreService: StoreService, private router: Router) {}

  ngOnInit(): void {
    this.loadStores();
  }

  loadStores(): void {
    this._StoreService.getAllStores().subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          this.stores = response.data; 
          // Build hierarchy after data is loaded
          this.hierarchicalAccounts = this.buildAccountHierarchy(this.stores);
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  buildAccountHierarchy(stores: any[]): any[] {
    return stores.map(store => ({
      ...store,
      showChildren: false,
      child: store.child ? this.buildAccountHierarchy(store.child) : []
    }));
  }

  deleteStore(store_id: number): void {
    if (confirm('Are you sure you want to delete this Store ?')) {
      this._StoreService.deleteStore(store_id).subscribe({
        next: (response) => {
          if (response) {
            this.loadStores(); // Reloads the data after deletion
          }
        },
        error: (err) => {
          console.error(err);
          alert('An error occurred while deleting the Store.');
        }
      });
    }
  }
}

