import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-request-store',
  templateUrl: './request-store.component.html',
  styleUrls: ['./request-store.component.scss']
})
export class RequestStoreComponent implements OnInit {
  @Input() partnerStore: any;
  @ViewChild('itemRequestModal') itemRequestModal;

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  openItemRequest() {
    this.itemRequestModal.open();
  }

  closeItemRequest(isRedirect = false) {
    this.itemRequestModal.close();
    if (isRedirect) {
      this.router.navigate(['/checkout/cart']);
    }
  }

}
