import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { EChartsOption } from 'echarts';
import { DataZoomComponentOption } from 'echarts/types/dist/echarts';
import { catchError, of } from 'rxjs';
import { environment as env } from 'src/environments/environment';
import { apiPaths } from '../../Config/apiPaths';
import { navigationRoutes } from '../../Config/navigation-routes';
import { toastMessages } from '../../Config/toastr-messages';
import { ApiService } from '../../services/api/api.service';
import { AppObservable } from '../../app-observable';
import { DatePipe } from '@angular/common';
import { HighlightService } from '../rules-data-view/highilight_rule.service';
import { ReportWorkflowSchedulingComponent } from '../query-builder-data-preview/report-workflow-scheduling/report-workflow-scheduling.component';
import { MatDialog } from '@angular/material/dialog';
import { commonConst } from '../../Config/common-const';
import { DateAdapter } from '@angular/material/core';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-workflow-dashboard',
  templateUrl: './workflow-dashboard.component.html',
  styleUrls: ['./workflow-dashboard.component.scss'],
  animations: [
    trigger('fullScreenTransition', [
      state(
        'false',
        style({
          height: '*', // Define initial styles when not in full-screen
          overflow: 'auto',
        })
      ),
      state(
        'true',
        style({
          height: '100vh', // Define styles for full-screen mode
          overflow: 'hidden',
        })
      ),
      transition('* => true', animate('300ms ease-in-out')), // Entering full-screen
      transition('true => false', animate('300ms ease-in-out')), // Exiting full-screen
    ]),
  ],
})
export class WorkflowDashboardComponent {
  @ViewChild('closeButton') closeButton!: ElementRef;
  fullScreen: any = 'fullscreen';
  projectName: any;
  projectId: any;
  workflowData: any[] = [];
  workflowDataPervious: any[] = [];

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
  chartOption: EChartsOption;
  url: any;
  isRowActive: boolean = false;
  object = {};
  skipDate = {};
  calender: boolean = false;
  saveChangesWorkflow: any[] = [];
  navigateUrl: string = '';
  loading: boolean = true;
  noWorkflows: boolean = true;
  bronzeLayerTables: any;
  currentUrl: any;
  STATUS: 'Success';
  isFullScreen = false;
  currentPage: number = 1;
  pageSize: number = 8;
  pagedWorkflowData: any[] = [];
  rules_header: string = '';
  layer_switch: string = '';
  succesCount: string;
  errorCount: string;
  skipCount: string;
  selectedDates: Date[] = [];
  skipDateTableName: string = '';
  minDate = new Date();
  pastDates: any;
  selectedIndexSkipDates: any;
  activePageNation:number

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
    private dateAdapter: DateAdapter<Date>
  ) {
    this.chartLoading = true;
    this.chartOption = {};
    this.dateAdapter.setLocale('en');
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
  }

  toggleRow(index: number): void {
    this.workflowData[index].expanded = !this.workflowData[index].expanded;
    this.workflowData[index].expandedState = this.workflowData[index].expanded
      ? 'expanded'
      : 'collapsed';
  }

  convertToString(array: any) {
    return array.join(',').replace(/\[|\]/g, '');
  }
  selectDate(event: any): void {
    const date = event.value;
    const index = this.selectedDates.findIndex((selectedDate) =>
      this.dateAdapter.compareDate(selectedDate, date)
    );

    if (index === -1) {
      this.selectedDates.push(date);
    } else {
      this.selectedDates.splice(index, 1);
    }
  }

  dateClass() {
    return (date: Date): string => {
      const selected = this.selectedDates.find((selectedDate) =>
        this.dateAdapter.compareDate(selectedDate, date)
      );

      return selected ? 'selected-date' : '';
    };
  }
  getWorkFlowChartDataSet(data: any) {
    this.isRowActive = true;
    this.workFlowName = data.job_name;
    this.lastRun = data.last_run;
    this.scheduledRun = data.next_schedule_run;
    this.succesCount = data.success_count;
    this.errorCount = data.failure_count;
    this.skipCount = data.skipped_count;
    this.chartLoading = true;
    this.hideFetchingTablesText = false;
    this.noData = true;
    this.service
      .workFlowChartDataSet(`${data.job_name}`)
      .pipe(
        catchError((Error) => {
          this.toastService.error(toastMessages.HttpRequestError);
          this.hideFetchingTablesText = true;
          return Error(Error);
        })
      )
      .subscribe((res: any) => {
        this.hideFetchingTablesText = true;
        for (let i = 0; i < res.gold.length; i++) {
          this.ySilver = res.silver;
          this.yGold = res.gold;
          this.xData = res['x-axis'];
          this.xData = this.xData.map((dateString) =>
            this.datePipe.transform(dateString, 'medium')
          );
          this.yBronze = res.bronze;
        }
        if (this.yGold.length == 0) {
          this.noData = false;
          this.chartLoading = true;
        } else {
          this.workFlowGraphData(
            this.xData,
            this.yGold,
            this.yBronze,
            this.ySilver
          );
          this.noData = true;
          this.chartLoading = false;
          this.xData = [];
          this.yBronze = [];
          this.yGold = [];
          this.ySilver = [];
          // this.chartOption={}
        }
      });
  }

  getSaveDates(index: any) {
    this.selectedIndexSkipDates = index;
    this.daysSelected = [];
    this.daysSelected = this.workflowData[index]['skip_schedule'];
    this.skipDateTableName = this.workflowData[index]['job_name'];
    // this.isSelected(event)
    this.calender = false;
    setTimeout(() => {
      this.calender = true;
    }, 1);
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
        env.ip +
          apiPaths.api.root +
          apiPaths.api.getWorkflowDashboardData +
          `${this.projectId}` +
          '/' +
          `${this.layer_name}`
      )
      .subscribe((res: any) => {
        this.loading = false;
        if (res.length == 0) {
          this.noWorkflows = false;
        } else {this.route.queryParams.subscribe((params) => {
          const isEmpty = Object.keys(params).length === 0;
          if (!isEmpty) {
            const filteredJobs = res.filter(
              (job) => job.job_name === params['activeJobName']
            );
            const indexOfFilteredJob  = res.findIndex(job => job.job_name === params['activeJobName']);
            const pageOfFilteredJob = Math.floor(indexOfFilteredJob / this.pageSize) + 1;
            this.activePageNation=pageOfFilteredJob
            this.getWorkFlowChartDataSet(filteredJobs[0]);
          } else if (isEmpty) {
            this.activePageNation=1
            this.getWorkFlowChartDataSet(res[0]);
          }
        });
          this.workflowData = res;
          this.setPage(this.activePageNation);
          this.getSaveDates(0);
        }
      });

    this.httpClient
      .get(
        env.ip +
          apiPaths.api.root +
          apiPaths.api.getWorkflowDashboardData +
          `${this.projectId}` +
          '/' +
          `${this.layer_name}`
      )
      .subscribe((res: any) => {
        this.workflowDataPervious = res;
      });
  }
  closeOffcanvas() {
    // Trigger the click event on the close button
    if (this.closeButton && this.closeButton.nativeElement) {
      this.closeButton.nativeElement.click();
    }
  }
  closeOff() {
    this.workflowData[this.selectedIndexSkipDates]['skip_schedule'] =[]
    const previousSkipSchedule = [...this.workflowDataPervious[this.selectedIndexSkipDates]['skip_schedule']];
     this.workflowData[this.selectedIndexSkipDates]['skip_schedule'] =previousSkipSchedule
  }
  navigateToRulesDataView(index: any) {
    this.router.navigate([
      navigationRoutes.rules + this.projectId + '/' + `${this.layer_name}`,
    ]);
    this.highlightService.setHighlightedColumn(index);
    this.highlightService.setHighlightedRoute(true);
  }

  createNewWorkflow() {
    this.highlightService.setQueryBuilderRoute(true, this.rules_header);
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

  workFlowGraphData(
    xData: any,
    yGoldData: any,
    yBronzeData: any,
    ySilverData: any
  ) {
    this.chartOption = {
      xAxis: [
        {
          type: 'category',
          data: xData,
        },
      ],
      yAxis: {
        type: 'value',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985',
          },
        },
        formatter: function (value) {
          let time = value[0].name;
          let index = xData.indexOf(time);

          let output = `<b><span style="font-size: 22px; color: #5470c6"></span>Duration(HH:MM:SS:MS):</b><br/>`;

          if (yGoldData[3].duration && yGoldData[3].duration[index]) {
            output +=
              `<b><span style="font-size: 22px; color: #5470c6">&#x2022;</span></b>` +
              yGoldData[3].duration[index] +
              '<br/>';
          }
          output += `<b><span style="font-size: 22px; color: #5470c6"></span>Rows Inserted:</b><br/>`;

          if (value[0] && value[0].value) {
            output +=
              `<b><span style="font-size: 22px; color: #5470c6">&#x2022;</span></b>` +
              value[0].value +
              '<br>';
          }
          return output;
        },
      },
      series: [
        {
          name: 'silver-gold',
          type: 'bar',
          data: yGoldData[0]['row_count'],
          barWidth: '35%',
          itemStyle: {
            color: '#5470c6',
            borderWidth: 1,
            borderColor: '#fff',
          },
        },
      ],
      dataZoom: [
        {
          show: true,
          type: 'slider',
          height: 15,
        },
        {
          type: 'inside',
          zoomLock: true,
        },
      ],
      animationEasing: 'elasticOut',
      animationDelayUpdate: (idx) => idx * 5,
    };
  }

  // @HostListener('window:keyup', ['$event'])
  // keUp() {
  //   const dataZoom = this.chartOption.dataZoom as DataZoomComponentOption[];
  //   if (dataZoom[1]?.zoomLock === true ?? false) {
  //     return;
  //   }
  //   this.chartOption = {
  //     ...this.chartOption,
  //     dataZoom: [dataZoom[0], { ...dataZoom[1], zoomLock: true }],
  //   };
  // }

  // @HostListener('window:keydown', ['$event'])
  // keyDown(event: KeyboardEvent) {
  //   const dataZoom = this.chartOption.dataZoom as DataZoomComponentOption[];
  //   if (dataZoom[1]?.zoomLock === false ?? false) {
  //     return;
  //   }
  //   if (event.ctrlKey || event.altKey || event.shiftKey) {
  //     this.chartOption = {
  //       ...this.chartOption,
  //       dataZoom: [dataZoom[0], { ...dataZoom[1], zoomLock: false }],
  //     };
  //   }
  // }

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

  select(event: any, calendar: any) {
    const date =
      event.getFullYear() +
      '-' +
      ('00' + (event.getMonth() + 1)).slice(-2) +
      '-' +
      ('00' + event.getDate()).slice(-2);
    const index = this.daysSelected.findIndex((x) => x == date);
    if (index < 0) {
      this.daysSelected.push(date);
    } else {
      this.daysSelected.splice(index, 1);
    }
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
        this.closeOffcanvas();
        this.getWorkflowDashboardData(false)
      });
  }
  getBronzeLayerTables(projectID: any) {
    return this.httpClient.get(
      env.ip +
        apiPaths.api.root +
        apiPaths.api.getBronzeLayerTables +
        `${projectID}`
    );
  }

  openWorkBench() {
    this.service
      .getBronzeLayerTables(this.projectId)
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
            navigationRoutes.workBench + `${this.projectId}`,
          ]);
        }
      });
  }
  get layer_name() {
    return this.route.snapshot.params[commonConst.params_layer_Name];
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
    dialogRef.afterClosed().subscribe((save) => {
      if (save == 'update') {
        this.getWorkflowDashboardData(true);
      }
    });
  }
}
