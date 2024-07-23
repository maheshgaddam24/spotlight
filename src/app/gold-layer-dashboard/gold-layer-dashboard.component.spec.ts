import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppModule } from '../app.module';

import { GoldLayerDashboardComponent } from './gold-layer-dashboard.component';
import { ApiService } from '../shared/services/api/api.service';
import { of, throwError } from 'rxjs';
import { navigationRoutes } from '../shared/Config/navigation-routes';

describe('GoldLayerDashboardComponent', () => {
  let component: GoldLayerDashboardComponent;
  let fixture: ComponentFixture<GoldLayerDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule],
      declarations: [GoldLayerDashboardComponent],
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoldLayerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Tests that the api call is successfully 
  it('tests api call', () => {
    const mockApiService = fixture.debugElement.injector.get(ApiService);

    spyOn(mockApiService, 'goldLayerTablesList').and.returnValue(of([]));
    component.getGoldLayerTablesDataList(1);
    expect(mockApiService.goldLayerTablesList).toHaveBeenCalledWith(1);
  });

  // Tests that the method called successfully and maps the data to the goldLayerTablesDataList
  it('map api response to goldLayerTablesDataList', () => {
    const mockResponse = [{
      TABLE_NAME: 'Table 1',
      ROW_COUNT: 10,
      FILE_GENERATED_LINK: 'link1',
      CREATED_AT: '2023-07-25'
    }];
    const expectedData = [{
      TABLE_NAME: 'Table 1',
      ROW_COUNT: 10,
      FILE_GENERATED_LINK: 'link1',
      CREATED_AT: '2023-07-25'
    }];

    const mockApiService = fixture.debugElement.injector.get(ApiService);

    spyOn(mockApiService, 'goldLayerTablesList').and.returnValue(of(mockResponse));
    component.getGoldLayerTablesDataList(1);

    expect(component.goldLayerTablesDataList).toEqual(expectedData);
  });

  // Tests that the method handles errors from the map operator
  it('api mapping error handling', () => {
    const mockError = 'Failed to map API response';
    const mockApiService = fixture.debugElement.injector.get(ApiService);

    spyOn(mockApiService, 'goldLayerTablesList').and.returnValue(throwError(mockError));
    spyOn(console, 'error');
    component.getGoldLayerTablesDataList(1);
    expect(console.error).toHaveBeenCalledWith('An error occurred:', mockError);
  });

  // Tests that the method handles an error from the API call
  it('api error handling', () => {
    const mockError = 'Error in API call';
    const mockApiService = fixture.debugElement.injector.get(ApiService);

    spyOn(mockApiService, 'goldLayerTablesList').and.returnValue(throwError(mockError));
    spyOn(console, 'error');
    component.getGoldLayerTablesDataList(1);
    expect(console.error).toHaveBeenCalledWith('An error occurred:', mockError);
  });

  // Tests that the method navigates to the 'goldlayer-preview' page with the selected project id and table name as parameters
  it('navigate to goldlayer-preview page with the selected project id and table name', () => {
    const routerSpy = spyOn(component.router, 'navigate');
    const e = { target: { textContent: 'table_name' } };
    component.selectedProjectId = 'project_id';
    component.openGoldTableColumnsData(e);
    expect(routerSpy).toHaveBeenCalledWith([
      navigationRoutes.goldLayerTableColumnsData +
      `${component.selectedProjectId}` + '/' + `${e.target.textContent}`,]);
  });

  // Tests that the method navigates to the 'project-dashboard' page with the selected project ID
  it('navigates to project-dashboard page with selected project ID', () => {
    const routerSpy = spyOn(component.router, 'navigate');
    component.selectedProjectId = 1;
    component.projectDashboard();
    expect(routerSpy).toHaveBeenCalledWith([
      navigationRoutes.projectDashboard + `${component.selectedProjectId}`]);
  });

  // Tests that the method navigates to the 'projects' page successfully
  it('navigate to projects page', () => {
    const routerSpy = spyOn(component.router, 'navigate');
    component.projectList();
    expect(routerSpy).toHaveBeenCalledWith([navigationRoutes.projects]);
  });

  // Tests that the dialog is opened when method is called
  it('tests dialog opened', () => {
    spyOn(component.dialog, 'open');
    component.openDialog('table_name');
    expect(component.dialog.open).toHaveBeenCalled();
  });
});
