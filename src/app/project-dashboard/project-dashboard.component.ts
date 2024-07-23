import { animate, style, transition, trigger } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import { QueryBuilderConfig } from 'angular2-query-builder';
import { EChartsOption } from 'echarts';
import { saveAs } from 'file-saver';
import { catchError, of } from 'rxjs';
import { commonConst } from '../shared/Config/common-const';
import { pastFiveDagRuns, projectDashboard } from '../shared/Config/interfaces';
import { navigationRoutes } from '../shared/Config/navigation-routes';
import { toastMessages } from '../shared/Config/toastr-messages';
import { AppObservable } from '../shared/app-observable';
import { GetDataComponent } from '../shared/components/get-data/get-data.component';
import { LogoutDialogComponent } from '../shared/components/logout-dialog/logout-dialog.component';
import { TableLogsComponent } from '../shared/components/table-logs/table-logs.component';
import { ApiService } from '../shared/services/api/api.service';
import { SchedulingBronzeComponent } from './scheduling-bronze/scheduling-bronze.component';
declare const bootstrap: any;

@Component({
  selector: 'app-project-dashboard',
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms', style({ opacity: 0 }))]),
    ]),
  ],
})
export class ProjectDashboardComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;
  @ViewChild('closeButton') closeButton!: ElementRef;
  @ViewChild('closeButtonScheduling') closeButtonScheduling!: ElementRef;
  @ViewChild('auditOffcanvas') auditOffcanvas!: ElementRef;

  checkedBronzeLayerTableName: any[] = [];
  bronzeLayerSelectedTableColumns: any;
  isRotated: boolean = false;
  selectedProjectId: any;
  dataSourceList: any;
  projectName: any;
  projectName1: any;
  projectValue: any;
  projectId: any;
  bronzeLayerTables: any;
  SilverLayerTableName: any;
  currentUrl: any;
  hideFetchingTablesText: boolean = false;
  ETL_STATUS: any[] = [];
  chartLoading: boolean;
  xData: any[] = [];
  yData: any[] = [];
  hideFetchingGraph: boolean = false;
  hideNoDataText: boolean = true;
  chartOption: EChartsOption;
  totalRecordInserted: number = 0;
  reportsCount: number = 0;
  totalReports: any;
  recordsCount: number = 0;
  queryForm: FormGroup;
  queryBuilder: boolean = false;
  logData: any;
  projectListData: any;
  dataSource_name: any;
  edit_data_source: boolean = false;
  selectedLoadType: string = 'full';
  selectedSyncType: string = 'manual';
  primaryKeyOptions: string[] = [];
  selectedBronzeLayerTableColumns: any[] = [];
  bronzeLayerTableColumns: any[] = [];
  selectedPrimaryKey: '';
  currentPage: number = 1;
  pageSize: number = 8;
  pagedDataSourceList: any[] = [];
  loading: boolean = true;
  getDataSourceStepper: boolean = true;
  getDataTablesStepper: boolean = true;
  getRowColumnFilterStepper: boolean = true;

  tableNames: string[] = ['Table1', 'Table2', 'Table3'];
  query = {
    condition: 'and',
    rules: [],
  };
  config: QueryBuilderConfig = {
    fields: {
      name: {
        name: 'Name',
        type: 'string',
        operators: ['=', '!='],
        defaultValue: '',
      },
      foo: {
        name: 'Foo',
        type: 'object',
        operators: ['between', 'less', 'bigger'],
        defaultValue: [],
      },
    },
  };
  dataSourceID: any;
  convertedArray: any;
  isDatasetsPresent: boolean = false;
  currentStep: number = 0;
  isLinear = true;
  isStep1Successful: boolean = false;
  isStep2Successful: boolean = false;
  dataBaseTablesList: any;
  rowColumFilteredTableList: any;
  pathDataSource: string;
  params_staging: string;
  screenChange: any;
  activePageNation: number;

  constructor(
    private http: HttpClient,
    public modalService: NgbModal,
    private route: ActivatedRoute,
    private service: ApiService,
    private router: Router,
    private appObservable: AppObservable,
    private toastService: HotToastService,
    private fb: FormBuilder,
    public dialog: MatDialog
  ) {
    this.queryForm = this.fb.group({
      tables: this.fb.array([]),
    });
    this.chartLoading = true;
    this.chartOption = {};
  }

  onConnectClicked() {
    this.isStep1Successful = true;
    this.getDataTablesStepper = true;
    setTimeout(() => {
      this.stepper.next();
    }, 0);
  }

  flatFileRowFilter() {
    this.isStep2Successful = true;
    this.getRowColumnFilterStepper = true;
    setTimeout(() => {
      this.stepper.next();
    }, 0);
  }

  tableListData(tableListData: any) {
    this.dataBaseTablesList = tableListData;
  }

  rowColumFilteredData(rowColumFilteredData: any) {
    this.flatFileRowFilter();
    this.rowColumFilteredTableList = rowColumFilteredData;
    setTimeout(() => {
      this.stepper.next();
    }, 0);
  }

  dataPathSource(e: any) {
    this.rowColumFilteredTableList = e;
  }

  resetStepper() {
    this.closeButton.nativeElement.click();
    this.cancelGetUpload();
    this.resetRowColumnFilter();
    this.cancelGetDatabase();
    this.cancelGetDatabase();
    this.resetDataBase();
  }

  resetDataBase() {
    this.isStep1Successful = false;
    this.getDataTablesStepper = false;
    this.isStep2Successful = false;
    this.getRowColumnFilterStepper = false;
  }

  resetGetDataBaseTables() {
    this.getDataSourceStepper = false;
    setTimeout(() => {
      this.getDataSourceStepper = true;
    }, 0);
  }
  cancelGetDatabase() {
    this.isStep1Successful = false;
    this.getDataTablesStepper = false;
  }

  cancelGetUpload() {
    this.getDataSourceStepper = false;
    setTimeout(() => {
      this.getDataSourceStepper = true;
    }, 0);
  }

  cancelRowColumnFilter() {
    this.getRowColumnFilterStepper = false;
    this.isStep2Successful = false;
  }

  resetRowColumnFilter() {
    this.resetGetDataBaseTables();
    this.getRowColumnFilterStepper = false;
    this.isStep2Successful = false;
  }

  receiveDataFromChild(data: string) {
    this.pathDataSource = data;
  }

  setPage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    const startIndex = (page - 1) * this.pageSize;
    const endIndex = Math.min(
      startIndex + this.pageSize - 1,
      this.dataSourceList.length - 1
    );
    this.pagedDataSourceList = this.dataSourceList.slice(
      startIndex,
      endIndex + 1
    );
  }

  get totalPages(): number {
    return Math.ceil(this.dataSourceList.length / this.pageSize);
  }

  get pages(): number[] {
    const totalPages = this.totalPages;
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  ngOnInit(): void {
    this.screenChange = window.matchMedia('(min-height: 1100px)');
    if (this.screenChange.matches) {
      this.pageSize = 12;
    }
    this.screenChange = window.matchMedia('(min-width: 1729px)');
    if (this.screenChange.matches) {
      this.pageSize = 11;
    }
    this.params_staging =
      this.route.snapshot.params[commonConst.params_staging];
    this.selectedProjectId = sessionStorage.getItem('project_id');
    this.projectName = sessionStorage.getItem('project_name');
    if (
      this.selectedProjectId ===
      this.route.snapshot.params[commonConst.params_id]
    ) {
      this.getDataSourcesList();
      this.pastFiveAirflowDagRuns(this.selectedProjectId);
      this.service.Refreshrequired$.subscribe((res) => {
        this.refresh();
      });
      this.appObservable.getProjectName$().subscribe((res: any) => {
        this.projectName1 = res;
      });
    } else {
      this.router.navigate([navigationRoutes.projects]);
    }
  }
  get tables() {
    return this.queryForm.get('tables') as FormArray;
  }

  isDatabaseSource(sourceSystem: string): boolean {
    return sourceSystem === 'MS SQL';
  }

  isCsvSource(sourceSystem: string): boolean {
    return sourceSystem === 'FLAT FILE';
  }

  isAmazonSource(sourceSystem: string): boolean {
    return sourceSystem === 'S3 FLAT FILE';
  }

  change(event: any) {
    this.queryBuilder = true;
  }

  addTable() {
    const tableGroup = this.fb.group({
      tableName: new FormControl(''),
      query: new FormControl(''),
    });
    this.tables.push(tableGroup);
  }

  disableButton() {
    if (this.selectedLoadType === 'incremental') {
      if (this.selectedPrimaryKey) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  refresh() {
    this.getDataSourcesList();
    this.reportsCount = 0;
    this.recordsCount = 0;
    this.totalRecordInserted = 0;
    this.pastFiveAirflowDagRuns(this.selectedProjectId);
  }

  openGetDataModal(id: any) {
    const modalRef = this.modalService.open(GetDataComponent, {
      size: commonConst.modal_size_xl,
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.data = id;
  }

  pastFiveAirflowDagRuns(projectID: any) {
    this.chartLoading = true;
    this.hideNoDataText = true;
    this.hideFetchingGraph = false;
    this.service.pastFiveDagRUns(projectID).subscribe({
      next: (res: pastFiveDagRuns) => {
        for (let i = 0; i < res['x-axis'].length; i++) {
          this.xData.push(res['x-axis'][i]);
          this.yData.push(res['row_count'][i]);
        }
        this.totalRecordInserted = res.total_records;
        this.totalReports = res.report_count;
        this.updateGrids(this.totalReports);
        if (this.totalRecordInserted == 0) {
          this.recordsCount = 0;
        } else if (this.totalRecordInserted <= 100) {
          this.updateCountGrids(this.totalRecordInserted);
          this.recordsCount = this.totalRecordInserted - 10;
        } else {
          this.updateCountGrids(this.totalRecordInserted);
          this.recordsCount = this.totalRecordInserted - 100;
        }
        this.graphData(this.xData, this.yData);
        if (this.xData.length === 0 && this.yData.length === 0) {
          this.hideNoDataText = false;
          this.chartLoading = true;
        } else {
          this.chartLoading = false;
          this.hideFetchingGraph = true;
        }
        this.xData = [];
        this.yData = [];
      },
      error: (error: any) => {
        this.toastService.error(toastMessages.HttpRequestError);
      },
    });
  }

  projectList() {
    this.service
      .getSourceList()
      .pipe(
        catchError((Error) => {
          this.toastService.error(toastMessages.HttpRequestError);
          this.hideFetchingTablesText = true;
          return Error(Error);
        })
      )
      .subscribe((res: any) => {
        this.projectListData = res.Data.map((project: any) => ({
          ...project,
        }));
      });
  }

  getDataSourcesList() {
    this.hideFetchingTablesText = false;
    this.dataSourceList = [];
    this.service
      .getDataSources(this.selectedProjectId)
      .pipe(
        catchError((Error) => {
          this.toastService.error(toastMessages.HttpRequestError);
          this.hideFetchingTablesText = true;
          return Error(Error);
        })
      )
      .subscribe({
        next: (res: projectDashboard) => {
          this.loading = false;
          this.hideFetchingTablesText = true;
          this.dataSourceList = res;
          this.projectValue = this.dataSourceList;
          this.dataSourceList = this.dataSourceList.Data;
          this.route.queryParams.subscribe((params) => {
            const isEmpty = Object.keys(params).length === 0;
            if (!isEmpty) {
              if (params.hasOwnProperty('loadDataOffCanvas')) {
                this.activePageNation = 1;
              } else {
                this.dataSourceList.forEach((job) => {
                  if (job.datasource_name === params['activeJobName']) {
                    job.isExpand = true;
                  }
                });
                const indexOfFilteredJob = this.dataSourceList.findIndex(
                  (job) => job.datasource_name === params['activeJobName']
                );
                const pageOfFilteredJob =
                  Math.floor(indexOfFilteredJob / this.pageSize) + 1;
                this.activePageNation = pageOfFilteredJob;
                this.setPage(pageOfFilteredJob);
              }
            } else if (isEmpty) {
              this.activePageNation = 1;
            }
          });
          this.setPage(this.activePageNation);
          if (this.dataSourceList.length == 0) {
            this.isDatasetsPresent = false;
            this.route.queryParams.subscribe((params) => {
              let openOffCanvas = params['loadDataOffCanvas'];
              if (openOffCanvas) {
                if (this.auditOffcanvas) {
                  const offcanvas = new bootstrap.Offcanvas(
                    this.auditOffcanvas.nativeElement
                  );
                  offcanvas.show();
                }
              }
            });
          } else {
            this.isDatasetsPresent = true;

            const isRunning = this.dataSourceList.some(
              (item) => item.status === 'Running...'
            );

            if (isRunning) {
              this.getDataSourcesList();
            } else {
              this.hideFetchingTablesText = true;
              this.appObservable.setProjectId$(`${this.projectId}`);
            }
          }
          this.projectName = sessionStorage.getItem('project_name');
          this.projectId = sessionStorage.getItem('project_id');
          this.appObservable.setProjectId$(`${this.projectId}`);
        },
        error: (error: any) => {
          this.toastService.warning(toastMessages.HttpRequestError);
        },
      });
  }

  open(url: any) {
    this.http.get(url, { responseType: 'text' }).subscribe((data) => {
      this.logData = data;
    });
  }

  downloadLogFile(url: any) {
    saveAs(url, 'save-me.log');
  }

  openBronzeTableData(e: any) {
    this.router.navigate([
      `${commonConst.params_schema_data}/` +
        `${this.params_staging}/` +
        `${this.selectedProjectId}/${e.target.outerText.toString().trim()}`,
    ]);
  }

  openWorkBench() {
    this.service
      .getBronzeLayerTables(this.selectedProjectId)
      .pipe(
        catchError((Error) => {
          this.toastService.error(toastMessages.HttpRequestError);
          return Error(Error);
        })
      )
      .subscribe((res: any) => {
        this.bronzeLayerTables = res.DATA_SOURCE;
        if (this.bronzeLayerTables.length == 0) {
          this.toastService.warning(toastMessages.noDataSource);
        } else {
          this.currentUrl = this.route.snapshot.url.join('/');
          this.appObservable.setPreviousURL(this.currentUrl);
          this.router.navigate([
            navigationRoutes.workBench + `${this.selectedProjectId}`,
          ]);
        }
      });
  }

  openQueryBuilder() {
    this.service
      .getBronzeLayerTables(this.selectedProjectId)
      .subscribe((res: any) => {
        this.bronzeLayerTables = res.DATA_SOURCE;
        if (this.bronzeLayerTables.length == 0) {
          this.toastService.warning(toastMessages.noDataSource);
        } else {
          this.router.navigate([
            navigationRoutes.queryBuilder + `${this.selectedProjectId}`,
          ]);
        }
      });
  }

  showTableLogsDialog(tableLogsDetails: string) {
    var dialogRef = this.dialog.open(TableLogsComponent, {
      height: 'fit-content',
      width: 'fit-content',
      disableClose: true,
      data: {
        projectID: tableLogsDetails['project_id'],
        dataSetName: tableLogsDetails['datasource_name'],
      },
    });
    dialogRef.afterClosed().subscribe((closeData: string) => {
      if (closeData === 'data saved') {
        this.refresh();
        this.edit_data_source = false;
      }
    });
  }

  showDeleteDataSetDialog(data: any) {
    const modalRef = this.modalService.open(LogoutDialogComponent, {
      size: 'small',
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.data = {
      action: 'delete',
      projectId: this.projectId,
      id: data.id,
      project_name: data.datasource_name,
    };
    modalRef.result
      .then((result) => {
        if (result === 'closed') {
          this.getDataSourcesList();
        }
      })
      .catch((reason) => {});
  }

  createWorkFlow() {
    this.router.navigate(
      [navigationRoutes.workflowDashboard + `${this.projectId}`],
      {
        state: {
          project_name: this.projectName,
          project_id: this.projectId,
        },
      }
    );
  }

  graphData(xData: any, yData: any) {
    this.chartOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985',
          },
        },
      },
      grid: {
        left: '1%',
        right: '10%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: this.xData,
        },
      ],
      yAxis: [
        {
          type: 'value',
        },
      ],
      series: [
        {
          name: 'Row recordsCount',
          type: 'line',
          stack: 'Total',
          areaStyle: {},
          emphasis: {
            focus: 'series',
          },
          // animationDelay:10000,
          data: this.yData,
        },
      ],
    };
  }

  reportsPage() {
    this.router.navigate([
      navigationRoutes.goldLayerDashboard + `${this.selectedProjectId}`,
    ]);
  }

  updateGrids(reports) {
    var availableStop = setInterval(() => {
      if (this.reportsCount == reports) {
        clearInterval(availableStop);
      } else {
        this.reportsCount++;
      }
    }, 50);
  }

  updateCountGrids(rowCount) {
    var stop = setInterval(() => {
      if (this.recordsCount == rowCount) {
        clearInterval(stop);
      } else {
        this.recordsCount++;
      }
    }, 20);
  }

  showConfigCard(data: any, index: number) {
    if (data.source_system === 'FLAT FILE') {
      this.toastService.warning("Flat file can't be configurable");
    } else {
      this.convertedArray = JSON.parse(data.columns).map((item) =>
        item.toUpperCase()
      );
      this.checkedBronzeLayerTable();
      this.selectedPrimaryKey = data.incremental_column;
      this.selectedLoadType = data.load_type !== null ? data.load_type : 'full';
      this.selectedSyncType =
        data.sync_type !== null ? data.sync_type : 'manual';
      this.edit_data_source = true;
      this.dataSource_name = data.datasource_name;
      this.dataSourceID = data.id;
    }
  }

  submitForm() {
    if (this.selectedSyncType == 'manual') {
      var raw = JSON.stringify({
        id: this.dataSourceID,
        load_type: this.selectedLoadType,
        incremental_column: this.selectedPrimaryKey,
        sync_type: this.selectedSyncType,
        date: '',
        day: '',
        frequency: '',
        time: '',
        datasource_name: this.dataSource_name,
      });
      this.service
        .scheduleDataSources(raw, this.projectId)
        .pipe(
          this.toastService.observe({
            loading: toastMessages.savingRule,
            success: (s) => toastMessages.savedRuleSuccessfully,
            error: (e) => toastMessages.errorSaving,
          })
        )
        .subscribe((res: any) => {
          this.closeButtonScheduling.nativeElement.click();
          this.refresh();
          this.edit_data_source = false;
        });
      return;
    } else {
      this.closeButtonScheduling.nativeElement.click();
      this.openDialog(
        this.selectedSyncType,
        this.selectedLoadType,
        this.selectedPrimaryKey,
        this.dataSource_name,
        this.dataSourceID
      );
    }
  }

  openDialog(
    synType: any,
    loadType: any,
    primaryKey: any,
    bronzeTableName: any,
    dataSourceID: any
  ): void {
    var dialogRef = this.dialog.open(SchedulingBronzeComponent, {
      height: 'fit-content',
      width: '90vw',
      disableClose: true,
      data: {
        syncType: synType,
        loadType: loadType,
        primaryKey: primaryKey,
        data_source: bronzeTableName,
        dataSourceID: dataSourceID,
      },
    });
    dialogRef.afterClosed().subscribe((closeData: string) => {
      if (closeData === 'data saved') {
        this.refresh();
        this.edit_data_source = false;
      }
    });
  }

  onLoadSelect(e: any): void {
    if (e.target.value == 'full') {
      return;
    } else {
      this.checkedBronzeLayerTable();
    }
  }

  checkedBronzeLayerTable() {
    this.getSelectedBronzeLayerTableColumnName(this.convertedArray);
  }

  getSelectedBronzeLayerTableColumnName(selectedSliverLayerTableName: any) {
    // this.selectedBronzeLayerTableColumns = selectedSliverLayerTableName;
    // this.selectedBronzeLayerTableColumns = [];
    // this.bronzeLayerTableColumns = [];
    // this.http
    //   .get(
    //     environment.ip +
    //       apiPaths.api.root +
    //       apiPaths.api.getBronzeLayerTableColumns +
    //       `${selectedSliverLayerTableName}` +
    //       '&project_id=' +
    //       `${this.projectId}`
    //   )
    //   .pipe(
    //     catchError((Error) => {
    //       this.toastService.error(toastMessages.HttpRequestError);
    //       return Error(Error);
    //     })
    //   )
    //   .subscribe((res) => {
    //     this.bronzeLayerSelectedTableColumns = res;
    //     for (let i = 0; i < this.bronzeLayerSelectedTableColumns.length; i++) {
    //       this.selectedBronzeLayerTableColumns.push(
    //         this.bronzeLayerSelectedTableColumns[i]
    //       );
    //     }
    //     this.bronzeLayerTableColumns =
    //       this.selectedBronzeLayerTableColumns.filter(
    //         (item) => !item[0].endsWith('SPOTLIGHT_HASHID')
    //       );
    //   });
    this.bronzeLayerTableColumns = selectedSliverLayerTableName;
  }

  rotateIconAndPatch(dataSource: any, index: number): void {
    if (!dataSource.isRotating && dataSource.source_system === 'MS SQL') {
      dataSource.isRotating = true;
      var raw = JSON.stringify({
        datasource_name: dataSource.datasource_name,
        project_id: dataSource.project_id,
        incremental_column: dataSource.incremental_column,
        rows_committed: dataSource.rows_committed,
        load_type: dataSource.load_type,
        source_system_info: dataSource.source_system_info,
      });
      this.service
        .syncDataSources(raw)
        .pipe(
          catchError((error) => {
            dataSource.isRotating = false;
            this.getDataSourcesList();
            return of();
          })
        )
        .subscribe(() => {
          dataSource.isRotating = false;
          this.getDataSourcesList();
        });
    } else if (dataSource.source_system === 'FLAT FILE') {
      this.toastService.warning("Flat file can't manually synchronized");
    } else if (
      !dataSource.isRotating &&
      dataSource.source_system === 'S3 FLAT FILE'
    ) {
      dataSource.isRotating = true;
      var manualSync = JSON.stringify({
        datasource_name: dataSource.datasource_name,
        project_id: dataSource.project_id,
        incremental_column: dataSource.incremental_column,
        rows_committed: dataSource.rows_committed,
        load_type: dataSource.load_type,
        source_system_info: dataSource.source_system_info,
      });
      this.service
        .s3ManualSync(manualSync)
        .pipe(
          catchError((error) => {
            dataSource.isRotating = false;
            this.getDataSourcesList();
            return of();
          })
        )
        .subscribe(() => {
          dataSource.isRotating = false;
          this.getDataSourcesList();
        });
    }
  }

  routeHome() {
    return `/projects`;
  }

  routeDataPipelines() {
    return `/project-view`;
  }
}
