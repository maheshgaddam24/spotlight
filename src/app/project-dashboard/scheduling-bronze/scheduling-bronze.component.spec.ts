import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulingBronzeComponent } from './scheduling-bronze.component';

describe('SchedulingBronzeComponent', () => {
  let component: SchedulingBronzeComponent;
  let fixture: ComponentFixture<SchedulingBronzeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SchedulingBronzeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchedulingBronzeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
