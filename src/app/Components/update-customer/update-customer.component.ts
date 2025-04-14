import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-update-customer',
  standalone: true,
  imports: [CommonModule,FormsModule ,TranslateModule],
  templateUrl: './update-customer.component.html',
  styleUrl: './update-customer.component.css'
})
export class UpdateCustomerComponent {
  phoneNumbers: string[] = [''];

  addPhoneNumber() {
    this.phoneNumbers.push(''); 
  }

  removePhoneNumber(index: number) {
    if (this.phoneNumbers.length > 1) {
      this.phoneNumbers.splice(index, 1); 
    }
  }
  onCancel() {
  }
}
