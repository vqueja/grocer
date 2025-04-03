import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-list-entry',
  templateUrl: './list-entry.component.html',
  styleUrls: ['./list-entry.component.scss']
})
export class ListEntryComponent implements OnInit {
  @Input() userList: any;

  constructor() { }

  ngOnInit() {
  }

}
