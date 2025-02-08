import { Component } from '@angular/core';
import { RouterLinkActive, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-show-customer',
  standalone: true,
  imports: [RouterLinkActive,RouterModule,TranslateModule ,CommonModule],
  templateUrl: './show-customer.component.html',
  styleUrl: './show-customer.component.css'
})
export class ShowCustomerComponent {

}
