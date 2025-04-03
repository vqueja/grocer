import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewItemDetailsComponent } from './review-item-details.component';

describe('ReviewItemDetailsComponent', () => {
  let component: ReviewItemDetailsComponent;
  let fixture: ComponentFixture<ReviewItemDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewItemDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewItemDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
