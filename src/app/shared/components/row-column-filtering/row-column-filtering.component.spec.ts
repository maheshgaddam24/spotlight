import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RowColumnFilteringComponent } from './row-column-filtering.component';

describe('RowColumnFilteringComponent', () => {
  let component: RowColumnFilteringComponent;
  let fixture: ComponentFixture<RowColumnFilteringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RowColumnFilteringComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RowColumnFilteringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
