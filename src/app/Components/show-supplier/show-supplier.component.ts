import { Component } from '@angular/core';
import { RouterLinkActive, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-show-supplier',
  standalone: true,
  imports: [RouterModule,RouterLinkActive ,TranslateModule,CommonModule],
  templateUrl: './show-supplier.component.html',
  styleUrl: './show-supplier.component.css'
})
export class ShowSupplierComponent {

}
