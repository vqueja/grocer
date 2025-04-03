import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderAssemblyComponent } from './orders-assembly.component';

describe('OrderAssemblyComponent', () => {
  let component: OrderAssemblyComponent;
  let fixture: ComponentFixture<OrderAssemblyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderAssemblyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderAssemblyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
