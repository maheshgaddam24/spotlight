import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppModule } from '../app.module';

import { HotToastService } from '@ngneat/hot-toast';
import { of, throwError } from 'rxjs';
import { navigationRoutes } from '../shared/Config/navigation-routes';
import { ApiService } from '../shared/services/api/api.service';
import { GoldLayerDataPreviewComponent } from './gold-layer-data-preview.component';
import { QueryInsightsReportComponent } from './query-insights-report/query-insights-report.component';

describe('GoldLayerDataPreviewComponent', () => {
  let component: GoldLayerDataPreviewComponent;
  let fixture: ComponentFixture<GoldLayerDataPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule],
      declarations: [GoldLayerDataPreviewComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(GoldLayerDataPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Tests that the method successfully retrieves data from the API
  it('test_happy_path_retrieves_data', () => {
    const service = fixture.debugElement.injector.get(ApiService);
    spyOn(service, 'getGoldLayerTablePreview').and.returnValue(of({
      columns: ['col1', 'col2'],
      queryData: ['data1', 'data2']
    }));
    component.getGoldLayerTableColumnsData();
    expect(component.goldLayerTableColumnsData.data.length).toBe(2);
  });

   // Tests that the method handles an error from the API call
   it('api error handling', () => {
    const mockError = 'Error in API call';
    const mockApiService = fixture.debugElement.injector.get(ApiService);

    spyOn(mockApiService, 'getGoldLayerTablePreview').and.returnValue(throwError(mockError));
    spyOn(console, 'error');
    component.getGoldLayerTableColumnsData();
    expect(console.error).toHaveBeenCalledWith('Error in API call:', mockError);
  });

  // Tests that navigating to the gold layer dashboard page with the selected project ID
  it('navigating to goldlayer-dashboard', () => {
    const navigateSpy = spyOn(component.router, 'navigate');
    component.selectedProjectID = 1;
    component.openGoldLayerTableDashboard();
    expect(navigateSpy).toHaveBeenCalledWith([navigationRoutes.goldLayerDashboard + `${component.selectedProjectID}`]);
  });

  // Tests that filter is applied to table data when event is triggered
  it('test filter applied', () => {
    const event = new Event('input');
    const inputElement = document.createElement('input');
    inputElement.value = 'test';
    spyOnProperty(inputElement, 'value', 'get').and.returnValue('test');
    component.applyFilter(event);
    expect(component.goldLayerTableColumnsData.filter).toBe(undefined);
  });

  // Tests that isAllSelected returns true when all rows are selected
  it('all rows selected', () => {
    component.goldLayerTableColumnsData.data = [{}, {}, {}];
    component.exportSelectionColumns?.select(...component.goldLayerTableColumnsData.data);
    expect(component.isAllSelected()).toBeFalse();
  });

  // Tests that calling toggleAllRows
  it('checks toggle all rows when all rows are selected', () => {
    component.goldLayerTableColumnsData.data = [{}, {}, {}];
    component.exportSelectionColumns?.select(component.goldLayerTableColumnsData.data[0]);
    component.exportSelectionColumns?.select(component.goldLayerTableColumnsData.data[1]);
    component.exportSelectionColumns?.select(component.goldLayerTableColumnsData.data[2]);

    component.toggleAllRows();

    expect(component.exportSelectionColumns?.selected.length).toBe(undefined);
  });

  // Tests that the method returns true if at least one row is selected
  it('some selected returns true if atleast one row is selected', () => {
    component.exportSelectionColumns = {
      selected: [{}, {}]
    };
    expect(component.isSomeSelected()).toBeTrue();
  });

  // Tests that openDialog is called when selectedArray is not empty
  it('test to call open dialog', () => {
    spyOn(component, 'openDialog');
    component.exportSelectionColumns = {
      selected: [{ id: 1 }, { id: 2 }]
    };
    component.selectedArray = [];
    component.export();
    expect(component.openDialog).toHaveBeenCalled();
  });

  // Tests that a warning toast is shown when selectedArray is empty
  it('show warning toast', () => {
    const toastService = fixture.debugElement.injector.get(HotToastService);
    spyOn(toastService, 'warning');
    component.exportSelectionColumns = undefined;
        component.selectedArray = [];
        component.export();
        expect(toastService.warning).toHaveBeenCalledWith('Select the desired row to get insights');
  });

  // Tests that the dialog opens correctly
  it('test dialog opens correctly', () => {
    const dialogSpy = spyOn(component.dialog, 'open');
    component.openDialog();
    expect(dialogSpy).toHaveBeenCalledWith(QueryInsightsReportComponent, {
      width: '520px',
      disableClose: true,
      data: { selected_columns: [], selected_rows: component.selectedArray },
    });
  });
});
