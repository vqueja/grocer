import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderAssembleComponent } from './order-assemble.component';

describe('OrderAssembleComponent', () => {
  let component: OrderAssembleComponent;
  let fixture: ComponentFixture<OrderAssembleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderAssembleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderAssembleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
