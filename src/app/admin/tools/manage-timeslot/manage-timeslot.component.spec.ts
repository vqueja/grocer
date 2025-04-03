import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTimeslotComponent } from './manage-timeslot.component';

describe('ManageTimeslotComponent', () => {
  let component: ManageTimeslotComponent;
  let fixture: ComponentFixture<ManageTimeslotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageTimeslotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageTimeslotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
