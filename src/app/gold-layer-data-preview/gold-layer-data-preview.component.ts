import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { saveAs } from 'file-saver';
import { commonConst } from '../shared/Config/common-const';
import { GoldLayerDataPreview } from '../shared/Config/interfaces';
import { navigationRoutes } from '../shared/Config/navigation-routes';
import { toastMessages } from '../shared/Config/toastr-messages';
import { ApiService } from '../shared/services/api/api.service';

@Component({
  selector: 'app-gold-layer-data-preview',
  templateUrl: './gold-layer-data-preview.component.html',
  styleUrls: ['./gold-layer-data-preview.component.scss'],
})
export class GoldLayerDataPreviewComponent implements OnInit {
  goldLayerTableColumnsData = new MatTableDataSource();
  selectedGoldLayerTableName: any;
  selectedGoldLayerTableName_title: any;
  selectedGoldLayerTableColumnsData: any;
  selectedProjectID: any;
  projectId: any;
  exportSelectionColumns: any;
  columnsOfTable: any;
  selectedArray: any[] = [];
  excludedColumn: string;
  projectName: string;
  dataPreview: string;
  activeErrorQueueData: number;
  activePageNation: number;
  redirectLayerName: any;
  silverLayerData: any;
  dataDisplayingTable: string = 'result_data';
  errorCount: any=0;
  resultantCount: any=0;

  constructor(
    private toastService: HotToastService,
    public service: ApiService,
    public router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.dataPreview =
      this.route.snapshot.params[commonConst.params_tablename_to_preview];

    if (this.dataPreview === 'resultData') {
      this.route.queryParams.subscribe((params) => {
        this.activeErrorQueueData = params['ActiveIndex'];
        this.activePageNation = params['ActivePageNation'];
      });
      (this.excludedColumn = `${commonConst.spotlight_hash}`),
        (this.selectedProjectID = this.route.snapshot.params['id']);
      this.projectId = sessionStorage.getItem('project_id');
      this.selectedGoldLayerTableName =
        this.route.snapshot.params[commonConst.params_tablename_instance];
      this.selectedGoldLayerTableName_title =
        this.route.snapshot.params[commonConst.params_tablename];
      this.getGoldLayerTableColumnsData('resultData');
      this.projectName = sessionStorage.getItem('project_name');
      this.redirectLayerName = 'Report Layer';
    } else if (this.dataPreview === 'eliminatedData') {
      this.route.queryParams.subscribe((params) => {
        this.activeErrorQueueData = params['ActiveIndex'];
        this.activePageNation = params['ActivePageNation'];
      });
      (this.excludedColumn = `${commonConst.spotlight_hash}`),
        (this.selectedProjectID = this.route.snapshot.params['id']);
      this.projectId = sessionStorage.getItem('project_id');
      this.selectedGoldLayerTableName =
        this.route.snapshot.params[commonConst.params_tablename_instance];
      this.selectedGoldLayerTableName_title =
        this.route.snapshot.params[commonConst.params_tablename];
      this.projectName = sessionStorage.getItem('project_name');
      this.getGoldLayerTableColumnsData('error_queue');
      this.redirectLayerName = 'Report Layer';
    } else if (this.dataPreview === 'silverLayerData' || 'dataPreview') {
      this.projectId = sessionStorage.getItem('project_id');
      this.projectName = sessionStorage.getItem('project_name');
      this.selectedGoldLayerTableName =
        this.route.snapshot.params[commonConst.params_tablename_instance];
      this.selectedGoldLayerTableName_title =
        this.route.snapshot.params[commonConst.params_tablename];
      this.route.queryParams.subscribe((params) => {
        const layer_name = params['layer_name'];
        if (layer_name === 'silver_layer') {
          this.redirectLayerName = 'Refined Workflows';
        } else if(layer_name === 'gold_layer') {
          this.redirectLayerName = 'Report Workflows';
        }else{
          this.redirectLayerName = 'Report Workflows';
        }
        this.getSilverLayerTableColumnsData(layer_name, 'result_data');
      });
    }
  }

  getGoldLayerTableColumnsData(dataSetType: string) {
    this.service
      .getGoldLayerTablePreview(
        this.selectedGoldLayerTableName,
        this.projectId,
        dataSetType
      )
      .subscribe({
        next: (data: GoldLayerDataPreview) => {
          this.exportSelectionColumns = new SelectionModel(true, []);
          this.goldLayerTableColumnsData.data = data['queryData'];
          this.selectedGoldLayerTableColumnsData = data['columns'];
          this.columnsOfTable = this.selectedGoldLayerTableColumnsData.filter(
            (item: any) => !item.includes('checkbox')
          );
        },
        error: (error: any) => {
          console.error('Error in API call:', error);
        },
      });
  }
  getSilverLayerTableColumnsData(dataSetType: string, dataPreview: string) {
    this.service
      .getSilverLayerTablePreview(
        this.selectedGoldLayerTableName_title,
        this.projectId,
        dataSetType
      )
      .subscribe({
        next: (data: GoldLayerDataPreview) => {
          this.silverLayerData = data;
          this.resultantCount=this.silverLayerData.result_data.length
          this.errorCount=this.silverLayerData.error_data.length
          this.displaySilverLayerData(this.silverLayerData, dataPreview);
        },
        error: (error: any) => {
          console.error('Error in API call:', error);
        },
      });
  }
  displaySilverLayerData(data: any, dataPreview: any) {
    this.exportSelectionColumns = new SelectionModel(true, []);
    this.goldLayerTableColumnsData.data = data[`${dataPreview}`];
    this.selectedGoldLayerTableColumnsData = data['columns'];
    this.columnsOfTable = this.selectedGoldLayerTableColumnsData.filter(
      (item: any) => !item.includes('checkbox')
    );
  }
  openGoldLayerTableDashboard() {
    this.router.navigate([
      navigationRoutes.goldLayerDashboard + `${this.selectedProjectID}`,
    ]);
  }
  toggleErrorQueueRecords(event) {
    if (event === 'error_data') {
      this.displaySilverLayerData(this.silverLayerData, 'error_data');
      this.dataDisplayingTable = 'error_data';
    } else {
      this.displaySilverLayerData(this.silverLayerData, 'result_data');
      this.dataDisplayingTable = 'result_data';
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement)?.value;
    this.goldLayerTableColumnsData.filter = filterValue?.trim().toLowerCase();
  }

  isAllSelected() {
    const numSelected = this.exportSelectionColumns?.selected.length;
    const numRows = this.goldLayerTableColumnsData.data.length;
    return numSelected == numRows;
  }

  toggleAllRows() {
    this.isAllSelected()
      ? this.exportSelectionColumns.clear()
      : this.goldLayerTableColumnsData.data.forEach((row) =>
          this.exportSelectionColumns?.select(row)
        );
  }

  isSomeSelected() {
    return this.exportSelectionColumns.selected.length > 0;
  }

  exportToCSV() {
    this.selectedArray = [];
    this.exportSelectionColumns?.selected.forEach((row) => {
      return this.selectedArray.push(row);
    });
    const data = this.selectedArray;
    if (this.selectedArray.length > 0) {
      const headers = data.length > 0 ? Object.keys(data[0]) : [];
      const csvData = [headers.join(',')];

      data.forEach((item) => {
        const values = headers.map((header) => item[header]);
        csvData.push(values.join(','));
      });
      const blob = new Blob([csvData.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.projectName;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      this.toastService.warning('Select the desired rows to export in csv');
    }
  }

  export() {
    this.selectedArray = [];
    this.exportSelectionColumns?.selected.forEach((row) => {
      return this.selectedArray.push(row);
    });
    this.generateReport();
  }
  generateReport() {
    if (this.selectedArray.length > 0) {
      let job_name = this.selectedGoldLayerTableName_title.trim();
      let data = {
        selected_columns: [],
        selected_rows: this.selectedArray,
        report_name: `${job_name}`,
        db_table_name:`${this.selectedGoldLayerTableName}`
      };
      this.service
        .queryInsightReport(data, this.projectId)
        .pipe(
          this.toastService.observe({
            loading: toastMessages.generatingReport,
            success: (s) => toastMessages.generatedReportSuccessfully,
            error: (e) => e,
          })
        )
        .subscribe((res: any) => {
          if (Object.keys(res).length === 0) {
            this.toastService.warning('No Files Found To Generate');
          } else {
            Object.keys(res).forEach((key) => {
              const value = res[key];
              saveAs(value, `${key}` + '.csv');
            });
          }
        });
    } else {
      this.toastService.warning(toastMessages.warningTOSelectRows);
    }
  }

  routeHome() {
    return `/projects`;
  }
  routeDataPipelines() {
    this.router.navigate([navigationRoutes.data_lineage]);
  }
  routeGoldLayer() {
    if (this.dataPreview === 'silverLayerData') {
      this.router.navigate([`/rules/`, `${this.projectId}`, 'silver_layer']);
    } else if(this.dataPreview === 'goldLayerData'){
      this.router.navigate([`/rules/`, `${this.projectId}`, 'gold_layer']);
    }else{
      this.router.navigate(
        [`/goldlayer-dashboard/`, `${this.selectedProjectID}`],
        {
          queryParams: {
            ActiveIndex: this.activeErrorQueueData,
            ActivePageNation: this.activePageNation,
          },
          queryParamsHandling: 'merge',
        }
      );
    }
  }
  routeLayerName() {}
}
