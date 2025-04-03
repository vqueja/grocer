import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemListEntryComponent } from './item-list-entry.component';

describe('ItemListEntryComponent', () => {
  let component: ItemListEntryComponent;
  let fixture: ComponentFixture<ItemListEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemListEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemListEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
