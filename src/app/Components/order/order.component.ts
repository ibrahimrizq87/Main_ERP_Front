// import { Component, OnInit } from '@angular/core';
// import { PurchasesService } from '../../shared/services/purchases.service';
// import { Router, RouterLinkActive, RouterModule } from '@angular/router';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-order',
//   standalone: true,
//   imports: [RouterLinkActive,RouterModule,CommonModule],
//   templateUrl: './order.component.html',
//   styleUrl: './order.component.css'
// })
// export class OrderComponent implements OnInit {
//   orders: any[] = [];
//   currentStatus: string = 'in-process'; // Default status

//   constructor(private _PurchasesService: PurchasesService, private router: Router) {}

//   ngOnInit(): void {
//     this.loadOrders(this.currentStatus);
//   }

//   // Load orders based on status
//   loadOrders(status: string): void {
//     this.currentStatus = status; // Update current status
//     this._PurchasesService.getOrdersByStatus(status).subscribe({
//       next: (response) => {
//         if (response) {
//           console.log(response);
//           this.orders = response.data;
//         }
//       },
//       error: (err) => {
//         console.error(err);
//       }
//     });
//   }

//   deleteOrder(orderId: number): void {
//     if (confirm('Are you sure you want to delete this order?')) {
//       this._PurchasesService.deletePurchase(orderId).subscribe({
//         next: (response) => {
//           if (response) {
//             this.loadOrders(this.currentStatus); // Reload orders for the current status
//           }
//         },
//         error: (err) => {
//           console.error(err);
//           alert('An error occurred while deleting the order.');
//         }
//       });
//     }
//   }

//   changeStatus(orderId: number): void {
//     if (confirm('Are you sure you want to Approve this order?')) {
//       this._PurchasesService.updateStatusOfOrder(orderId, "pending").subscribe({
//         next: (response) => {
//           if (response) {
//             this.loadOrders(this.currentStatus); // Reload orders for the current status
//           }
//         },
//         error: (err) => {
//           console.error(err);
//           alert('An error occurred while approving the order.');
//         }
//       });
//     }
//   }
// }
import { Component, OnInit } from '@angular/core';
import { PurchasesService } from '../../shared/services/purchases.service';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule,RouterLinkActive,RouterModule,TranslateModule,FormsModule],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  orders: any[] = [];
  currentStatus: string = 'in-process';
  searchTerm: string = '';
  // Define the status flow
  private statusFlow: string[] = ['in-process', 'pending', 'in-transit', 'completed'];

  constructor(private _PurchasesService: PurchasesService, private router: Router,
    private toastr: ToastrService 
  ) {}

  ngOnInit(): void {
    this.loadOrders(this.currentStatus);
  }

  loadOrders(status: string): void {
    this.currentStatus = status;
    this._PurchasesService.getOrdersByStatus(status).subscribe({
      next: (response) => {
        if (response) {
          this.orders = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  deleteOrder(orderId: number): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this._PurchasesService.deletePurchase(orderId).subscribe({
        next: () => {
          this.loadOrders(this.currentStatus);
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('An error occurred while deleting the order.');
          // alert('An error occurred while deleting the order.');
        }
      });
    }
  }

  changeStatus(orderId: number, currentStatus: string): void {
    const currentIndex = this.statusFlow.indexOf(currentStatus);
    const nextStatus = this.statusFlow[(currentIndex + 1) % this.statusFlow.length];

    if (confirm(`Are you sure you want to change the status to ${nextStatus}?`)) {
      this._PurchasesService.updateStatusOfOrder(orderId, nextStatus).subscribe({
        next: () => {
          this.loadOrders(this.currentStatus);
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('An error occurred while changing the status.');
          // alert(`An error occurred while changing the status to ${nextStatus}.`);
        }
      });
    }
  }
  get filteredOrders() {
    return this.orders.filter(order => {
      const orderDateMatch = order.order_date && order.order_date.toLowerCase().includes(this.searchTerm.toLowerCase());
      const arrivalDateMatch = order.arrival_date && order.arrival_date.toLowerCase().includes(this.searchTerm.toLowerCase());
      const taxTypeMatch = order.tax_type && order.tax_type.toLowerCase().includes(this.searchTerm.toLowerCase());
      return orderDateMatch || arrivalDateMatch || taxTypeMatch;
    });
  }
}
