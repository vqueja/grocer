import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EodReportsComponent } from './eod-reports.component';

describe('EodReportsComponent', () => {
  let component: EodReportsComponent;
  let fixture: ComponentFixture<EodReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EodReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EodReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
