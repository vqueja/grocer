import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetBannerComponent } from './set-banner.component';

describe('SetBannerComponent', () => {
  let component: SetBannerComponent;
  let fixture: ComponentFixture<SetBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
