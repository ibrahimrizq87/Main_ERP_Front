import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-bank',
  standalone: true,
  imports: [TranslateModule,CommonModule],
  templateUrl: './manage-bank.component.html',
  styleUrl: './manage-bank.component.css'
})
export class ManageBankComponent {

}
