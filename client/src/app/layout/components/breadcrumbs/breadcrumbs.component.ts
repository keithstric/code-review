import { Component, OnInit } from '@angular/core';
import {Subscription} from 'rxjs';
import {Breadcrumb} from 'src/app/layout/interfaces/breadcrumb.interface';
import {BreadcrumbService} from 'src/app/layout/services/breadcrumb/breadcrumb.service';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit {
  breadcrumbs: Breadcrumb[] = [];
  breadcumbsSub: Subscription;

  constructor(
    private _breadcrumbs: BreadcrumbService
  ) { }

  ngOnInit(): void {
    this.listenToBreadcrumbs();
  }

  listenToBreadcrumbs() {
    this.breadcumbsSub = this._breadcrumbs.breadcrumbsSub.subscribe((breadcrumbs) => {
      this.breadcrumbs = breadcrumbs;
    });
  }

}
