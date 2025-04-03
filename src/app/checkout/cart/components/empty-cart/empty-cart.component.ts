import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-empty-cart',
  templateUrl: './empty-cart.component.html',
  styleUrls: ['./empty-cart.component.scss']
})
export class EmptyCartComponent implements OnInit {
  @Input() isAuthenticated: boolean;
  @Input() returnUrl: string;

  constructor() { }

  ngOnInit() {
  }

}
