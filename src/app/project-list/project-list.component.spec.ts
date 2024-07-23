import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AppModule } from '../app.module';

import { ProjectListComponent } from './project-list.component';

describe('ProjectListComponent', () => {
  let component: ProjectListComponent;
  let fixture: ComponentFixture<ProjectListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule],
      declarations: [ProjectListComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProjectListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display list of projects', () => {
    spyOn(component, 'projectList');
    fixture.detectChanges();

    let projects = component.projectList;
    expect(projects).toHaveBeenCalled();
  })

  it('should create a new project', () => {
    spyOn(component, 'createNewProject');

    component.createNewProject();
    let button = fixture.debugElement.query(By.css('button')).nativeElement;
    button.click();
   
    expect(component.createNewProject).toHaveBeenCalled();
  })
});
