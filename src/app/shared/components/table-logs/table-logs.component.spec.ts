import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableLogsComponent } from './table-logs.component';

describe('TableLogsComponent', () => {
  let component: TableLogsComponent;
  let fixture: ComponentFixture<TableLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableLogsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
