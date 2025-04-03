import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOneItemComponent } from './add-one-item.component';

describe('AddOneItemComponent', () => {
  let component: AddOneItemComponent;
  let fixture: ComponentFixture<AddOneItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddOneItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddOneItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
