import { Component } from '@angular/core';

import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GroupService } from '../../shared/services/group.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-group',
  standalone: true,
  imports: [RouterModule,FormsModule,CommonModule,ReactiveFormsModule,TranslateModule],
  templateUrl: './add-group.component.html',
  styleUrl: './add-group.component.css'
})
export class AddGroupComponent {
  msgError: string = '';
  isLoading: boolean = false;
  groups:any;
  
  constructor(private _GroupService:GroupService , private _Router: Router) {}

  groupForm: FormGroup = new FormGroup({
    name: new FormControl(null, [Validators.required,Validators.maxLength(255)]),
    group_id:new FormControl(null),
  });


  getGroups(){
    this._GroupService.groupsMain().subscribe({
      next: (response: any) => { 
        this.groups = response.data;
      },
      error: (err: any) => { 
        console.error(err);
      }
    }); 
  }
  ngOnInit(): void {
    this.getGroups();
  }

  handleForm() {
   
    if (this.groupForm.valid) {
      this.isLoading = true;

      const formData = new FormData();
      formData.append('name', this.groupForm.get('name')?.value);
      formData.append('group_id', this.groupForm.get('group_id')?.value);

      this._GroupService.addGroup(formData).subscribe({
        next: (response) => {
          console.log(response);
          if (response) {
            this.isLoading = false;
            this._Router.navigate(['/dashboard/group']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
           this.msgError = err.error.error;
          console.log(err);
        }
      });
    }
  }

}
