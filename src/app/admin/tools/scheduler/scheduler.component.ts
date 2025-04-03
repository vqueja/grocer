import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription'
import { AdminService } from './../../services/admin.service';


@Component({
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.scss']
})
export class SchedulerComponent implements OnInit {
  scheduler$: Subscription;
  eventDetails: any;
  constructor() { }

  ngOnInit() {
  }

}
