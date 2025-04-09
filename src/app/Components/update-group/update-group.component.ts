import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { GroupService } from '../../shared/services/group.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-update-group',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule ,TranslateModule],
  templateUrl: './update-group.component.html',
  styleUrl: './update-group.component.css'
})
export class UpdateGroupComponent implements OnInit{
  msgError: string = '';
  msgSuccess:string ='';
  isLoading: boolean = false;
  groupForm: FormGroup ;
  parent_id:number = -1;
  groups:any;
  // group:any;
    constructor(
    private _GroupService: GroupService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.groupForm = new FormGroup({
      name: new FormControl(null, [Validators.required, Validators.maxLength(255)]),
      group_id:new FormControl(null),
    });
  }
    ngOnInit(): void {
    const groupId = this.route.snapshot.paramMap.get('id'); 
    if (groupId) {
      this.fetchGroupData(groupId);
    }
    this.loadGroups();

  }


  loadGroups(): void {
    this._GroupService.groupsMain().subscribe({
      next: (response) => {
        if (response) {
          console.log(response)
          this.groups = response.data;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
    fetchGroupData(groupId: string): void {
    this._GroupService.getGroupById(groupId).subscribe({
      next: (response) => {
        if (response) {
          const group = response.data ; 
          
          console.log(group)
          this.groupForm.patchValue({
            name: group.name
          });
          
          if(group.parent){
            this.parent_id =group.parent.id;
            this.groupForm.patchValue({
              group_id: group.parent.id
            });
          }
        }
      },
      error: (err: HttpErrorResponse) => {
console.log(err);
console.log(err.message);
      }
    });
  }
   handleForm(): void {
    if (this.groupForm.valid) {
      this.isLoading = true;
  
      const groupData = new FormData();
      groupData.append('name', this.groupForm.get('name')?.value);

      if(this.groupForm.get('group_id')?.value){
        groupData.append('group_id', this.groupForm.get('group_id')?.value );

      }
      const groupId = this.route.snapshot.paramMap.get('id');
      
      if (groupId) {
        this._GroupService.updateGroup(groupId, groupData).subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response) {
              this.toastr.success('تم تعديل المجموعة بنجاح');
              this.msgSuccess = response;
              setTimeout(() => {
                this.router.navigate(['/dashboard/group']);
              }, 2000);
            }
          },
          error: (err: HttpErrorResponse) => {
            this.toastr.error('حدث خطا اثناء تعديل المجموعة');
            this.isLoading = false;
            this.msgError = err.error.error;
          }
        });
      } else {
        this.isLoading = false;
        this.msgError = 'Group ID is invalid.';
      }
    }
  } 
  onCancel(): void {
        this.groupForm.reset();
       
        this.router.navigate(['/dashboard/group']); 
      }  
}
