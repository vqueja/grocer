import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterFacebookComponent } from './register-facebook.component';

describe('RegisterFacebookComponent', () => {
  let component: RegisterFacebookComponent;
  let fixture: ComponentFixture<RegisterFacebookComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterFacebookComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterFacebookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
