import { Component, OnInit, OnDestroy, Output, EventEmitter, Input, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'app-add-one-item',
  templateUrl: './add-one-item.component.html',
  styleUrls: ['./add-one-item.component.scss']
})
export class AddOneItemComponent implements OnInit, OnDestroy {
  isShowDetails: boolean = false;
  isReviewDetails: boolean = false;
  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
  ) { }

  ngOnInit() {
    this.isShowDetails  = true;
  }

  toggleShowItemDetails():void {
    this.isShowDetails  = true;
    this.isReviewDetails = false;
  }

  toggleShowReview(): void {
    this.isReviewDetails = true;
    this.isShowDetails  = false;
  }

  ngOnDestroy() {

  }
}
