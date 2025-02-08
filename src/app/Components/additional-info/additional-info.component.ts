import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common'; // Provides ngClass and other directives

@Component({
  selector: 'app-additional-info',
  standalone: true,
  imports: [RouterModule,ReactiveFormsModule ,TranslateModule,CommonModule],
  templateUrl: './additional-info.component.html',
  styleUrl: './additional-info.component.css'
})
export class AdditionalInfoComponent {

}
