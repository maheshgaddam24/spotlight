import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { Subscription, catchError, interval, of } from 'rxjs';
import { apiPaths } from 'src/app/shared/Config/apiPaths';
import { commonConst } from 'src/app/shared/Config/common-const';
import { navigationRoutes } from 'src/app/shared/Config/navigation-routes';
import { toastMessages } from 'src/app/shared/Config/toastr-messages';
import { AppObservable } from 'src/app/shared/app-observable';
import { ReportWorkflowSchedulingComponent } from 'src/app/shared/components/query-builder-data-preview/report-workflow-scheduling/report-workflow-scheduling.component';
import { HighlightService } from 'src/app/shared/components/rules-data-view/highilight_rule.service';
import { QueryDisplayComponent } from 'src/app/shared/components/rules-data-view/query-display/query-display.component';
import { ApiService } from 'src/app/shared/services/api/api.service';
import { ProjectViewActiveTabService } from 'src/app/shared/services/project-view-active-tab/project-view-active-tab.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-data-lineage',
  templateUrl: './data-lineage.component.html',
  styleUrls: ['./data-lineage.component.scss'],
})
export class DataLineageComponent implements OnInit {
  autoRefreshInterval: Subscription;
  autoRefreshEnabled = false;
  fullScreen: any = 'fullscreen';
  projectName: any;
  projectId: any;
  workflowData: any[] = [];
  xData: any[] = [];
  yBronze: any[] = [];
  ySilver: any[] = [];
  yGold: any[] = [];
  daysSelected: any[] = [];
  event: any;
  chartLoading: boolean;
  hideFetchingTablesText: boolean = true;
  workFlowName: any;
  lastRun: any;
  scheduledRun: any;
  successedWorkflows: number;
  failedWorkflows: number;
  skippedWorkflows: number;
  noData: boolean = true;
  url: any;
  isRowActive: boolean = false;
  object = {};
  skipDate = {};
  saveChangesWorkflow: any[] = [];
  saveChanges: boolean = false;
  navigateUrl: string = '';
  loading: boolean = true;
  noWorkflows: boolean = false;
  bronzeLayerTables: any;
  currentUrl: any;
  STATUS: 'Success';
  isFullScreen = false;
  currentPage: number = 1;
  pageSize: number = 9;
  pagedWorkflowData: any[] = [];
  rules_header: string = '';
  layer_switch: string = '';
  succesCount: string;
  errorCount: string;
  skipCount: string;
  workflowInsights: any[] = [];
  screenChange: any;
  dataJourney: boolean = false;
  workFlowData: any[] = [];
  disableButton: boolean;

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    public service: ApiService,
    private route: ActivatedRoute,
    private toastService: HotToastService,
    private appObservable: AppObservable,
    public dialog: MatDialog,
    private datePipe: DatePipe,
    private highlightService: HighlightService,
    public activeTabService: ProjectViewActiveTabService
  ) {
    this.chartLoading = true;
    this.disableButton = environment.production;
  }

  ngOnInit(): void {
    this.projectName = sessionStorage.getItem('project_name');
    this.projectId = sessionStorage.getItem('project_id');
    this.url = this.route.snapshot.url.join('/');
    if (this.layer_name === 'silver_layer') {
      this.rules_header = 'Refined Scheduler';
      this.layer_switch = 'bronze_layer';
    } else if (this.layer_name === 'gold_layer') {
      this.layer_switch = 'silver_layer';

      this.rules_header = 'Report Scheduler ';
    }
    this.getWorkflowDashboardData(true);
    this.screenChange = window.matchMedia('(min-width: 1537px)');
    if (this.screenChange.matches) {
      this.pageSize = 11;
    }
    this.screenChange = window.matchMedia('(min-height: 1100px)');
    if (this.screenChange.matches) {
      this.pageSize = 13;
    }
    this.screenChange = window.matchMedia('(max-width: 1535px)');
    if (this.screenChange.matches) {
      this.pageSize = 7;
    }
  }
  startAutoRefresh() {
    this.autoRefreshInterval = interval(10000).subscribe(() => {
      this.getWorkflowDashboardData(true);
    });
  }
  dataJourneyChange() {
    if (!this.disableButton) {
      this.dataJourney = !this.dataJourney;
    }
  }
  stopAutoRefresh() {
    if (this.autoRefreshInterval) {
      this.autoRefreshInterval.unsubscribe();
    }
  }

  tableButtonShowClick(): void {
    this.dataJourneyChange();
  }
  toggleAutoRefresh(event) {
    this.autoRefreshEnabled = event.checked;

    if (this.autoRefreshEnabled) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }
  openGoldTableColumnsData(e: any) {
    this.router.navigate([
      navigationRoutes.goldLayerDashboard + `${this.projectId}`,
    ]);
  }

  refreshData() {
    this.getWorkflowDashboardData(true);
  }

  ngOnDestroy() {
    this.stopAutoRefresh();
  }
  toggleRow(index: number): void {
    this.workflowData[index].expanded = !this.workflowData[index].expanded;
    this.workflowData[index].expandedState = this.workflowData[index].expanded
      ? 'expanded'
      : 'collapsed';
  }
  syncType(syncText: any) {
    if (syncText === 'event_based_trigger') {
      return 'Event';
    } else if (syncText === 'automatic') {
      return 'Auto';
    } else if (syncText === 'manual') {
      return 'Manual';
    }
  }

  convertToString(array: any) {
    return array.join(',').replace(/\[|\]/g, '');
  }
  getWorkFlowChartDataSet(data: any) {
    this.workflowInsights = [];
    this.workflowInsights.push(data);
    this.isRowActive = true;
    this.workFlowName = data.job_name;
  }

  getSaveDates(index: any) {
    this.daysSelected = [];
    this.daysSelected = this.workflowData[index]['skip_schedule'];
    // this.isSelected(event)
  }

  queryInsights(workFlowId: any) {
    this.router.navigate([navigationRoutes.querInsight], {
      state: { rule: workFlowId, url: this.url },
    });
  }

  toggleSyncRotation(data: any) {
    data.isSyncing = true;

    const body = {
      job_name: data.job_name,
    };

    this.service
      .jobManualSync(body)
      .pipe(
        catchError((error) => {
          console.error('An error occurred:', error);
          data.isSyncing = false;
          return of();
        })
      )
      .subscribe(() => {
        data.isSyncing = false;
        this.getWorkFlowChartDataSet(data);
      });
  }

  getWorkflowDashboardData(spinner: boolean) {
    this.loading = spinner;
    this.httpClient
      .get(
        environment.ip +
          apiPaths.api.root +
          apiPaths.api.execution_statics +
          `${this.projectId}`
      )
      .subscribe((res: any) => {
        this.loading = false;
        if (res.length == 0) {
          this.noWorkflows = true;
        } else {
          this.getWorkFlowChartDataSet(res[0]);
          this.workflowData = res;
          this.setPage(1);
          this.getSaveDates(0);
        }
      });
  }

  navigateToRulesDataView(index: any) {
    this.router.navigate([
      navigationRoutes.rules + this.projectId + '/' + `${this.layer_name}`,
    ]);
    this.highlightService.setHighlightedColumn(index);
  }

  createNewWorkflow() {
    this.router.navigate(
      [
        navigationRoutes.queryBuilder +
          `${this.projectId}` +
          '/' +
          `${this.layer_switch}`,
      ],
      {
        state: { project_name: this.projectName, project_id: this.projectId },
      }
    );
  }

  setPage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    const startIndex = (page - 1) * this.pageSize;
    const endIndex = Math.min(
      startIndex + this.pageSize - 1,
      this.workflowData.length - 1
    );
    this.pagedWorkflowData = this.workflowData.slice(startIndex, endIndex + 1);
  }

  get totalPages(): number {
    return Math.ceil(this.workflowData.length / this.pageSize);
  }

  get pages(): number[] {
    const totalPages = this.totalPages;
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  backProjectDashboard() {
    this.router.navigate(
      [navigationRoutes.projectDashboard + `${this.projectId}`],
      {
        state: { project_name: this.projectName, project_id: this.projectId },
      }
    );
  }
  toggleFullScreen() {
    this.isFullScreen = !this.isFullScreen;
    if (this.isFullScreen) {
      this.fullScreen = 'fullscreen_exit';
    } else {
      this.fullScreen = 'fullscreen';
    }
  }

  isSelected = (event: any) => {
    const date =
      event.getFullYear() +
      '-' +
      ('00' + (event.getMonth() + 1)).slice(-2) +
      '-' +
      ('00' + event.getDate()).slice(-2);
    return this.change(date);
  };

  change(date: any) {
    return this.daysSelected.find((x) => x == date) ? 'selected' : null;
  }

  select(event: any, calendar: any, d: any) {
    this.saveChanges = true;
    const date =
      event.getFullYear() +
      '-' +
      ('00' + (event.getMonth() + 1)).slice(-2) +
      '-' +
      ('00' + event.getDate()).slice(-2);
    const index = this.daysSelected.findIndex((x) => x == date);
    if (index < 0) this.daysSelected.push(date);
    else this.daysSelected.splice(index, 1);
    calendar.updateTodaysDate();
  }

  saveSkipDateChanges() {
    for (let i = 0; i < this.workflowData.length; i++) {
      let id = this.workflowData[i].id;
      let skip_date = this.workflowData[i]['skip_schedule'];
      let project_id = this.workflowData[i]['project'];
      this.saveChangesWorkflow.push({
        id: `${id}`,
        skip_schedule: `${skip_date}`,
        project_id: `${project_id}`,
      });
    }
    this.service
      .workFlowSkipDates(this.saveChangesWorkflow)
      .pipe(
        this.toastService.observe({
          loading: toastMessages.savingFields,
          success: (s) => toastMessages.savingSuccess,
          error: (e) => toastMessages.errorSaving,
        })
      )
      .subscribe((res: any) => {
        this.saveChanges = false;
      });
  }
  getBronzeLayerTables(projectID: any) {
    return this.httpClient.get(
      environment.ip +
        apiPaths.api.root +
        apiPaths.api.getBronzeLayerTables +
        `${projectID}`
    );
  }

  get layer_name() {
    return this.route.snapshot.params[commonConst.params_layer_Name];
  }
  openDialog(query: any) {
    this.openDialogQuery(query);
  }

  openQueryBuilder() {
    this.service.getBronzeLayerTables(this.projectId).subscribe((res: any) => {
      this.bronzeLayerTables = res.DATA_SOURCE;
      if (this.bronzeLayerTables.length == 0) {
        this.toastService.warning(toastMessages.noDataSource);
      } else {
        this.router.navigate([
          navigationRoutes.queryBuilder + `${this.projectId}`,
        ]);
      }
    });
  }
  routeHome() {
    return `/projects`;
  }
  routeDataPipelines() {
    return `/project-view`;
  }
  openTableSelectionModal(columnData: any) {
    var dialogRef = this.dialog.open(ReportWorkflowSchedulingComponent, {
      height: 'fit-content',
      width: '90vw',
      disableClose: true,
      data: {
        routeFrom: 'workflow_dashboard',
        data: columnData,
        layer_name: this.layer_name,
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.getWorkflowDashboardData(true);
    });
  }
  openDialogQuery(Query: any): void {
    this.dialog.open(QueryDisplayComponent, {
      width: 'fit-content',
      height: 'fit-content',
      disableClose: true,
      data: { query: Query },
    });
  }
}
