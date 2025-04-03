import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDeliverComponent } from './order-deliver.component';

describe('OrderDeliverComponent', () => {
  let component: OrderDeliverComponent;
  let fixture: ComponentFixture<OrderDeliverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderDeliverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderDeliverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
