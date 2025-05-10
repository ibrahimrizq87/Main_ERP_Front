import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header-client',
  standalone: true,
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './header-client.component.html',
  styleUrl: './header-client.component.css'
})
export class HeaderClientComponent {

}
