import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportWorkflowSchedulingComponent } from './report-workflow-scheduling.component';

describe('ReportWorkflowSchedulingComponent', () => {
  let component: ReportWorkflowSchedulingComponent;
  let fixture: ComponentFixture<ReportWorkflowSchedulingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportWorkflowSchedulingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportWorkflowSchedulingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
