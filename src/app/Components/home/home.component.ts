import { Component } from '@angular/core';
import { HeaderClientComponent } from '../header-client/header-client.component';

import { ProductBranchesClientComponent } from "../product-branches-client/product-branches-client.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderClientComponent, ProductBranchesClientComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
