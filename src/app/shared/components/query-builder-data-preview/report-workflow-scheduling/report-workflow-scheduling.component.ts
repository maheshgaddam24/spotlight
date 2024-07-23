import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { constant } from 'lodash';
import { catchError } from 'rxjs';
import { apiPaths } from 'src/app/shared/Config/apiPaths';
import { commonConst } from 'src/app/shared/Config/common-const';
import { navigationRoutes } from 'src/app/shared/Config/navigation-routes';
import { toastMessages } from 'src/app/shared/Config/toastr-messages';
import { ApiService } from 'src/app/shared/services/api/api.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-report-workflow-scheduling',
  templateUrl: './report-workflow-scheduling.component.html',
  styleUrls: ['./report-workflow-scheduling.component.scss'],
})
export class ReportWorkflowSchedulingComponent implements OnInit {
  @ViewChild('ruleSelectRaw') ruleSelectRaw: MatSelect;
  @ViewChild('ruleSelectBronze') ruleSelectBronze: MatSelect;
  @ViewChild('ruleSelectSolver') ruleSelectSilver: MatSelect;

  workFlowForm: FormGroup;
  projectId: any;
  jobName: string;
  selectedSyncType: string = 'manual';
  isAutomaticSync: boolean = false;
  frequency: '';
  selectedDateTime = '';
  selectedDay = '';
  selectedTime = '';
  showDriftRangeFalse: boolean = false;
  // projectName:any;
  getReportData: any[] = [];
  userData: any;
  isLoading = false;
  DataLoadBtn: any = 'Save';
  isBronzeSilver: boolean;
  layer_table_name: string;
  Minutes: any;
  activeQueryEdit: any = '';
  activeQueryJobName: any;
  activeQueryJobId: any;

  editScheduledFrequency: any;
  constructor(
    public dialogRef: MatDialogRef<ReportWorkflowSchedulingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private toastService: HotToastService,
    public service: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.workFlowForm = this.formBuilder.group({
      jobname: [{ value: '', disabled: false }, [Validators.required]],
      syncType: [''],
    });
  }

  ngOnInit(): void {
    if (this.data.routeFrom === 'workflow_dashboard') {
      this.jobName = this.data.data.job_name;
      this.selectedSyncType = this.data.data.sync_type;
      if (this.layer_name === 'silver_layer') {
        this.isBronzeSilver = false;
      } else if (this.layer_name === 'gold_layer') {
        this.isBronzeSilver = true;
      }
    } else if (this.data.routeFrom === 'query_builder') {
      if (this.layer_name === 'bronze_layer') {
        this.isBronzeSilver = false;
        this.layer_table_name = 'silver_layer';
      } else if (this.layer_name === 'silver_layer') {
        this.isBronzeSilver = true;
        this.layer_table_name = 'gold_layer';
      }
    }

    this.route.queryParams.subscribe((params) => {
      const isEmpty = Object.keys(params).length === 0;
      if (!isEmpty) {
        this.activeQueryEdit = params['query'];
        this.activeQueryJobName = params['job_name'];
        this.activeQueryJobId = params['job_id'];
        // this.editScheduledFrequency = this.data.data.editScheduledFrequency;
      }
    });
    if (this.activeQueryEdit === 'edit') {
      this.jobName = this.activeQueryJobName;
      const jobnameControl = this.workFlowForm.get('jobname');
      jobnameControl.disable();
    }
    this.projectId = sessionStorage.getItem('project_id');
    const user = sessionStorage.getItem('userData');
    this.userData = JSON.parse(user);
  }

  get layer_name() {
    return this.data.layer_name;
  }

  submitForm() {
    if (this.data.routeFrom === 'workflow_dashboard') {
      var raw = JSON.stringify({
        id: this.data.data.id,
        job_name: this.jobName,
        sync_type: this.selectedSyncType,
        date: this.selectedDateTime,
        day: this.selectedDay,
        frequency: this.frequency,
        time: this.selectedTime,
        Minutes: this.Minutes,
        is_active: true,
      });
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      };
      this.isLoading = true;
      this.DataLoadBtn = 'Saving Changes';
      this.httpClient
        .patch(
          environment.ip +
            apiPaths.api.root +
            apiPaths.api.getWorkflowDashboardData +
            `${this.projectId}` +
            '/' +
            `${this.layer_name}`,
          raw,
          httpOptions
        )
        .pipe(
          catchError((Error) => {
            this.isLoading = false;
            this.DataLoadBtn = 'SAVE';
            this.toastService.error(Error.error.error);
            return Error(Error);
          })
        )
        .subscribe((res: any) => {
          this.dialogRef.close('update');
        });
    } else if (this.data.routeFrom === 'query_builder') {
      if (this.workFlowForm.invalid) {
        this.toastService.warning('Felids missing');
        return;
      }
      var raw = JSON.stringify({
        project: this.projectId,
        job_name: this.jobName,
        sync_type: this.selectedSyncType,
        date: this.selectedDateTime,
        day: this.selectedDay,
        frequency: this.frequency,
        time: this.selectedTime,
        Minutes: this.Minutes,
        is_active: true,
        query_desc: this.data.query,
        skip_schedule: [],
        source_table: this.data.sourceTableName,
        created_by: this.userData.username,
        traceability_query: this.data.traceabilityInfo,
        groupby_col_list: this.data.groupByColumns,
        layer_name: this.layer_table_name,
      });
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      };
      this.isLoading = true;
      var queryData =
        this.data.goldLayerTableCreate['params'] +
        '&job_name=' +
        `${this.jobName}` +
        '&layer_name=' +
        `${this.layer_table_name}`+'&updated=' +
        `${this.activeQueryEdit === 'edit' ? true : false}`;

      this.DataLoadBtn = 'Saving query';
      this.httpClient
        .post(
          environment.ip +
            apiPaths.api.root +
            apiPaths.api.creating_gold_layer_table +
            queryData,
          this.data.goldLayerTableCreate['body']
        )
        .pipe(
          catchError((Error) => {
            this.isLoading = false;
            this.DataLoadBtn = 'SAVE';
            this.toastService.error(Error.error.error);
            return Error(Error);
          })
        )
        .subscribe((res: any) => {
          this.data.query = res.query;
          const checkApplied = res.checks_applied;
          const source_system = res.source_system;
          const job_json = res.queryJson;
          var raw = {
            project: this.projectId,
            job_name: this.jobName,
            sync_type: this.selectedSyncType,
            date: this.selectedDateTime,
            day: this.selectedDay,
            frequency: this.frequency,
            time: this.selectedTime,
            Minutes: this.Minutes,
            is_active: true,
            query_desc: this.data.query,
            error_queue_qry: res.error_queue_sql,
            skip_schedule: [],
            source_table: this.data.sourceTableName,
            created_by: this.userData.username,
            traceability_query: this.data.traceabilityInfo,
            groupby_col_list: this.data.groupByColumns,
            layer_name: this.layer_table_name,
            checks_applied: checkApplied,
            source_system: source_system,
            job_json: job_json,
          };
          if (this.activeQueryEdit === 'edit') {
            raw['id'] = parseInt(this.activeQueryJobId);
          }
          // var rawString = JSON.stringify(raw);
          // console.log(rawString);

          if (this.layer_name === 'bronze_layer') {
            this.DataLoadBtn = 'Creating Silver table';
          } else if (this.layer_name === 'silver_layer') {
            this.DataLoadBtn = 'Generating report';
          }

          this.getReportData.push(this.projectId);
          this.getReportData.push(this.jobName);
          const httpMethod = this.activeQueryEdit === 'edit' ? 'PATCH' : 'POST';
          this.httpClient
            .request(
              httpMethod,
              environment.ip +
                apiPaths.api.root +
                apiPaths.api.getWorkflowDashboardData +
                `${this.projectId}` +
                '/' +
                `${this.layer_table_name}`,
              {
                body: raw,
                ...httpOptions,
              }
            )
            .pipe(
              catchError((Error) => {
                this.isLoading = false;
                this.DataLoadBtn = 'SAVE';
                this.toastService.error(Error.error.error);
                return Error(Error);
              })
            )
            .subscribe((res: any) => {
              if (this.layer_name === 'bronze_layer') {
                this.DataLoadBtn = 'Creating Silver table';
                if (this.activeQueryEdit === 'edit') {
                  if (this.layer_name === 'bronze_layer') {
                    this.router.navigate([
                      navigationRoutes.rules +
                        `${this.projectId}` +
                        '/' +
                        `${'silver_layer'}`,
                    ]);
                  } else if (this.layer_name === 'silver_layer') {
                    this.router.navigate([
                      navigationRoutes.rules +
                        `${this.projectId}` +
                        '/' +
                        `${'gold_layer'}`,
                    ]);
                  }
                } else {
                  this.router.navigate([navigationRoutes.data_lineage]);
                }
                this.dialogRef.close();
              } else if (this.layer_name === 'silver_layer') {
                this.DataLoadBtn = 'Scheduling job';
                if (this.activeQueryEdit === 'edit') {
                  if (this.layer_name === 'bronze_layer') {
                    this.router.navigate([
                      navigationRoutes.rules +
                        `${this.projectId}` +
                        '/' +
                        `${'silver_layer'}`,
                    ]);
                  } else if (this.layer_name === 'silver_layer') {
                    this.router.navigate([
                      navigationRoutes.rules +
                        `${this.projectId}` +
                        '/' +
                        `${'gold_layer'}`,
                    ]);
                  }
                  this.dialogRef.close();
                } else {
                  this.service
                    .saveGoldLayer(this.getReportData)
                    .pipe(
                      catchError((Error) => {
                        this.isLoading = false;
                        this.DataLoadBtn = 'SAVE';
                        this.toastService.error(toastMessages.errorSavingRule);
                        return Error(Error);
                      })
                    )
                    .subscribe((res: any) => {
                      this.router.navigate([
                        navigationRoutes.goldLayerDashboard +
                          `${this.projectId}`,
                      ]);
                      this.dialogRef.close();
                    });
                }
              }
            });
        });
    }
  }

  repeatMode(e: any) {
    this.frequency = e;
  }

  dayName(e: any) {
    this.selectedDay = e;
  }

  dateTime(e: any) {
    this.selectedDateTime = e;
  }

  time(e: any) {
    this.selectedTime = e;
  }
  getMin(e: any) {
    this.Minutes = e;
  }
}
