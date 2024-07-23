import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppModule } from '../app.module';

import { SchemaDataComponent } from './schema-data.component';

describe('SchemaDataComponent', () => {
  let component: SchemaDataComponent;
  let fixture: ComponentFixture<SchemaDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule],
      declarations: [SchemaDataComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SchemaDataComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the data of a selected data source', () => {
    spyOn(component, 'getGoldLayerColumnsData');
    fixture.detectChanges();

    let dataFields = component.getGoldLayerColumnsData;
    expect(dataFields).toHaveBeenCalled();
  })

  it('should go back to project data sources, when clicked on back button', fakeAsync(() => {
    spyOn(component, 'navigateDataSourceDashboard');
  
    let button = fixture.debugElement.nativeElement.querySelector('button');
    button.click();
  
    tick();
  
    expect(component.navigateDataSourceDashboard).toHaveBeenCalled();
  }));
});
