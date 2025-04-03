import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerFeaturedComponent } from './banner-featured.component';

describe('BannerFeaturedComponent', () => {
  let component: BannerFeaturedComponent;
  let fixture: ComponentFixture<BannerFeaturedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BannerFeaturedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BannerFeaturedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
