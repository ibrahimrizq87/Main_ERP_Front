import { Component } from '@angular/core';
import { CheckService } from '../../shared/services/check.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common'; // Provides ngClass and other directives

@Component({
  selector: 'app-view-check',
  standalone: true,
  imports: [TranslateModule,CommonModule],
  templateUrl: './view-check.component.html',
  styleUrl: './view-check.component.css'
})
export class ViewCheckComponent {
  checkDocuments:any;
  check: any;
  checkId :string | null = null;
  constructor(
    private _CheckServic: CheckService,
    private route: ActivatedRoute,
    private _Router: Router,
  ) { }


  ngOnInit(): void {
    this.getParams();
  }


  back() {
    this._Router.navigate([`/dashboard/check_list/${this.check?.status}`]);
  }
  

  getParams() {
    this.route.paramMap.subscribe(params => {
      this.checkId = params.get('id');
    });
    this.getCheck(this.checkId|| '');
  }
  getCheck(id:string) {
    this._CheckServic.getCheckById(id).subscribe({
      next: (response) => {
        if (response) {
          this.check = response.data;
          this.checkDocuments = response.data;
          console.log(response);
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }


  getStatusClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'pending':
        return 'status-pending';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  }
  
}

