import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';


interface Account {
  id: string;
  name:string;
  type:string;
  parent_id?: string;
  child?: Account[];
  showChildren?: boolean;
}
@Component({
  selector: 'app-accountnode',
  standalone: true,
  imports: [CommonModule , RouterModule],
  templateUrl: './accountnode.component.html',
  styleUrl: './accountnode.component.css'
})
export class AccountnodeComponent {
  @Input() account!: Account;

  toggleChildren(): void {
    this.account.showChildren = !this.account.showChildren;
  }
}
