import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Provides ngClass and other directives
import { RouterModule, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-supplier',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive, TranslateModule],
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.css'] // Ensure this is styleUrls
})
export class SupplierComponent {}
