import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageSettingsDetailsComponent } from './page-settings-details.component';

describe('PageSettingsDetailsComponent', () => {
  let component: PageSettingsDetailsComponent;
  let fixture: ComponentFixture<PageSettingsDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageSettingsDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageSettingsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
