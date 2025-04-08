import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { GroupService } from '../../shared/services/group.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-group',
  standalone: true,
  imports: [RouterModule, RouterLinkActive, CommonModule ,TranslateModule,FormsModule],
  templateUrl: './group.component.html',
  styleUrl: './group.component.css'
})
export class GroupComponent implements OnInit {
  Groups: any[] = [];
  filteredGroups: any[] = []; // For displaying filtered groups
  searchTerm: string = ''; 
  constructor(private _GroupService: GroupService, private router: Router,private toastr:ToastrService) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  // loadGroups(): void {
  //   this._GroupService.groupsMain().subscribe({
  //     next: (response) => {
  //       if (response) {
  //         console.log(response)
  //         this.Groups = response.data;
  //       }
  //     },
  //     error: (err) => {
  //       console.error(err);
  //     }
  //   });
  // }
  loadGroups(): void {
    this._GroupService.groupsMain().subscribe({
      next: (response) => {
        if (response) {
          this.Groups = response.data;
          this.filteredGroups = response.data; // Initialize with all groups
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  filterGroups(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredGroups = this.Groups.filter(group => 
      group.name.toLowerCase().includes(term)
    );
  }
  // viewChild(id:string){
  //   this._GroupService.getGroupsById(id).subscribe({
  //     next: (response) => {
  //       if (response) {
  //         console.log(response)
  //         this.Groups = response.data;
  //       }
  //     },
  //     error: (err) => {
  //       console.error(err);
  //     }
  //   });
  // }
  viewChild(id: string): void {
    this._GroupService.getGroupsById(id).subscribe({
      next: (response) => {
        if (response) {
          this.Groups = response.data;
          this.filteredGroups = response.data; // Update filtered list
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  deleteGroup(groupId: number): void {
    if (confirm('Are you sure you want to delete this Group?')) {
      this._GroupService.deleteGroup(groupId).subscribe({
        next: (response) => {
          if (response) {
            this.router.navigate(['/dashboard/group']);
            this.loadGroups();
            this.toastr.success('تم حذف المجموعة بنجاح');
          }
        },
        error: (err:HttpErrorResponse) => {
          if (err.status == 403){
            // alert('can not delete this group it has some groups in it');
            this.toastr.error('لا يمكن حذف هذه المجموعة لأنها تحتوي على مجموعات فرعية');
          }else{
            // alert('An error occurred while deleting the group.');
            this.toastr.error('حدث خطا اثناء حذف المجموعة');
          }
          
          // console.log('Status Code:', );

          // // Extract the error message from the response body, if available
          // const errorMessage = err.error.message || 'An unexpected error occurred.';
          // console.log('Error Message:', errorMessage);

        }
      });
    }
  }
}
