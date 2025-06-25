import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../shared/services/client.service';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { PermissionService } from '../../shared/services/permission.service';
import { Subject, debounceTime } from 'rxjs';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [RouterLinkActive, RouterModule, CommonModule, TranslateModule, FormsModule, NgxPaginationModule],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css'
})
export class ClientsComponent implements OnInit {
  clients: any[] = [];
  onSearchChange() {
    this.searchSubject.next(this.searchQuery);
  }


  private searchSubject = new Subject<string>();
  searchQuery: string = '';
  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

  constructor(
    private _ClientService: ClientService, 
    private router: Router, 
    private toastr: ToastrService,
    public _PermissionService: PermissionService) {
    
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(query => {
      this.loadClients();
    });
    }

  ngOnInit(): void {
    this.loadClients(); 
  }

  loadClients(): void {
    this._ClientService.getAllClients(
      this.searchQuery,
      this.currentPage,
      this.itemsPerPage
    ).subscribe({
      next: (response) => {
        if (response) {
          this.clients = response.data.clients;

          this.totalItems = response.data.meta.total;
          console.log(response);
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  // filteredClients(): any[] {
  //   if (!this.searchTerm) {
  //     this.totalItems = this.clients.length;
  //     return this.clients;
  //   }

  //   const lowerTerm = this.searchTerm.toLowerCase();
  //   return this.clients.filter((client) => {
  //     return (
  //       (client.name?.toLowerCase() || '').includes(lowerTerm) ||
  //       (client.account_category?.toLowerCase() || '').includes(lowerTerm) ||
  //       (client.delegate?.toLowerCase() || '').includes(lowerTerm) ||
  //       (client.price_category?.toLowerCase() || '').includes(lowerTerm) ||
  //       (client.is_suspended?.toString().toLowerCase() || '').includes(lowerTerm)
  //     );
  //   });
  // }

  // updatePagination(): void {
  //   this.totalItems = this.filteredClients().length;
  // }

  // onSearchChange(): void {
  //   this.currentPage = 1;
  //   this.updatePagination();

  // }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
    // this.updatePagination();
  }

  deleteClient(clientId: number): void {
    if (confirm('Are you sure you want to delete this client?')) {
      this._ClientService.deleteClient(clientId).subscribe({
        next: (response) => {
          if (response) {
            this.toastr.success('تم حذف العميل بنجاح');
            this.loadClients();
          }
        },
        error: (err) => {
          this.toastr.error('حدث خطا اثناء حذف العميل');
          console.error(err);
        }
      });
    }
  }
}