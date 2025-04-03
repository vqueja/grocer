import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestStoreComponent } from './request-store.component';

describe('RequestStoreComponent', () => {
  let component: RequestStoreComponent;
  let fixture: ComponentFixture<RequestStoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestStoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
