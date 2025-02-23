import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLinkActive, RouterModule } from '@angular/router';

interface Store {
  id: number;
  name: string;
  manager_name: string;
  child?: Store[];
  showChildren?: boolean;
}

@Component({
  selector: 'app-storenode',
  standalone: true,
  imports: [CommonModule,RouterLinkActive,RouterModule],
  templateUrl: './storenode.component.html',
  styleUrls: ['./storenode.component.css']
})
export class StorenodeComponent {
  @Input() store!: Store;
 
  @Output() delete = new EventEmitter<number>();
  toggleChildren(): void {
    this.store.showChildren = !this.store.showChildren;
  }
  deleteStore(storeId: number): void {
    this.delete.emit(storeId);
  }
}
