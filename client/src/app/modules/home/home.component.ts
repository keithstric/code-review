import { Component, OnInit } from '@angular/core';
import {UiService} from 'src/app/core/services/ui/ui.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private _uiService: UiService
  ) { }

  ngOnInit(): void {
    this._uiService.notifyUser('Welcome to code-review');
  }

}
