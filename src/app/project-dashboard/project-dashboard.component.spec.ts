import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AppModule } from '../app.module';

import { ProjectDashboardComponent } from './project-dashboard.component';

describe('ProjectDashboardComponent', () => {
  let component: ProjectDashboardComponent;
  let fixture: ComponentFixture<ProjectDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule],
      declarations: [ProjectDashboardComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProjectDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display list of data sources present in the project', () => {
    spyOn(component, 'getDataSourcesList');
    fixture.detectChanges();

    let datasources = component.getDataSourcesList;
    expect(datasources).toHaveBeenCalled();
  })

  it('should open work-bench component', () => {
    spyOn(component, 'openWorkBench');

    component.openWorkBench();
    let button = fixture.debugElement.nativeElement.querySelector('#workBench');
    button.click();
  
    expect(component.openWorkBench).toHaveBeenCalled();
  })
});