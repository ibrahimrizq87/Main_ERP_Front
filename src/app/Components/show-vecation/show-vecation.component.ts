import { Component, OnInit } from '@angular/core';
import { VectionService } from '../../shared/services/vection.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-show-vecation',
  standalone: true,
  imports: [RouterModule,TranslateModule],
  templateUrl: './show-vecation.component.html',
  styleUrl: './show-vecation.component.css'
})
export class ShowVecationComponent implements OnInit {

  vecationData: any;

  constructor(
    private _VectionService: VectionService,

    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const vecation_id = this.route.snapshot.paramMap.get('id');
    console.log('Purchase ID:', vecation_id);
    if (vecation_id) {

      this.fetchVecationById(vecation_id);
    }
  }


  fetchVecationById(vecation_id: string): void {
    this._VectionService.showVecationById(vecation_id).subscribe({
      next: (response) => {
        console.log(response.data);
        this.vecationData = response?.data || {};
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching Vecation data:', err.message);
      }
    });
  }

}

