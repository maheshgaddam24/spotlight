import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import { SchemaDataComponent } from 'src/app/schema-data/schema-data.component';
import { environment as env } from 'src/environments/environment';
import { apiPaths } from '../../Config/apiPaths';
import { commonConst } from '../../Config/common-const';
import { navigationRoutes } from '../../Config/navigation-routes';
import { AppObservable } from '../../app-observable';
import { ApiService } from '../../services/api/api.service';
import { GetDatabaseTablesComponent } from '../get-database-tables/get-database-tables.component';
import { QueryBuilderDataPreviewComponent } from '../query-builder-data-preview/query-builder-data-preview.component';
import { MatDialog } from '@angular/material/dialog';
import { QueryDisplayComponent } from './query-display/query-display.component';
import { HighlightService } from './highilight_rule.service';

@Component({
  selector: 'app-rules-data-view',
  templateUrl: './rules-data-view.component.html',
  styleUrls: ['./rules-data-view.component.scss'],
})
export class RulesDataViewComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  hideText: boolean = false;
  selectedProjectId: any;
  rules: any;
  activeTab = '1';
  selectedTab = '1';
  hideTable: boolean = true;
  currentUrl: any;
  hideDescription: boolean = true;
  hidePreviewDataButton: boolean = true;
  goldLayerTableColumnsData: any;
  selectedGoldLayerTableColumnsData: any;
  silverLayerTableColumnsData: any;
  sourceTables: any[] = [];
  tables: any[] = [];
  projectId: any;
  searchText: string;
  projectName: string;
  workflowData: any[] = [];
  loaderWorkflow: boolean = false;
  isSearchEnable: boolean = false;
  noRulesCreated: boolean = false;
  loading: boolean = true;
  highlightedColumn: string;
  scrollInit: boolean;
  rules_header: string = '';
  layer_switch: string = '';
  workflowRoute: boolean = false;
  checksApplied: any[];
  constructor(
    public modalService: NgbModal,
    private appObservable: AppObservable,
    private router: Router,
    public service: ApiService,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private toastService: HotToastService,
    public dialog: MatDialog,
    private highlightService: HighlightService,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.projectName = sessionStorage.getItem('project_name');
    this.selectedProjectId = sessionStorage.getItem('project_id');
    this.projectId = sessionStorage.getItem('project_id');

    this.highlightedColumn = this.highlightService.getHighlightedColumn();
    this.workflowRoute = this.highlightService.getHighlightedRoute();
    this.getWorkflowDashboardData();
    if (this.layer_name === 'silver_layer') {
      this.rules_header = 'Refined Workflows';
      this.layer_switch = 'bronze_layer';
    } else if (this.layer_name === 'gold_layer') {
      this.rules_header = 'Report Workflows ';
      this.layer_switch = 'silver_layer';
    }
    this.appObservable.listen().subscribe((res: any) => {});
    this.currentUrl = this.route.snapshot.url.join('/');
  }
  ngOnDestroy(): void {
    this.highlightService.setHighlightedColumn(null);
  }

  ngAfterViewInit() {
    if (this.highlightedColumn) {
      this.getWorkflowDashboardData().then((viewColumn) => {
        if (viewColumn) {
          document.getElementById(this.highlightedColumn).scrollIntoView({
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest',
          });
        }
      });
    }
  }

  checkAppliedDataList(checkAppliedData: any) {
   return checkAppliedData.length > 0 ? checkAppliedData.join(', ') : '';
  }
  get layer_name() {
    return this.route.snapshot.params[commonConst.params_layer_Name];
  }
  getWorkflowDashboardData() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.loaderWorkflow = false;
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
          resolve(true);
          this.loading = false;
          this.loaderWorkflow = true;
          if (res.length == 0) {
            this.noRulesCreated = true;
            this.isSearchEnable = false;
          } else {
            this.isSearchEnable = true;
            this.workflowData = res;
            this.tables = [];
            for (let i = 0; i < this.workflowData.length; i++) {
              let sourceTables = this.workflowData[i].source_table.split(',');
              sourceTables = sourceTables.map((item) => {
                return item.split('.')[1];
              });
              this.tables.push(sourceTables);
            }
          }
        });
    });
  }
  checksAppliedData(checks_applied:any){
    if(checks_applied.length >1 ){
       const parsedArray = checks_applied;
    const resultString = parsedArray.join(', ');
    return resultString
    }else {
      return '-'
    }
   
  }

  // loadRules(e: any) {
  //   this.loading=true
  //   if (e === '1') {
  //     this.service
  //       .getProjectRulesData(this.selectedProjectId, '1')
  //       .subscribe((res) => {
  //         this.rules = res;
  //         if (this.rules.length == 0) {
  //           this.hideTable = true;
  //           this.noRulesCreated=false
  //         } else {
  //           this.tables = [];
  //           for (let i = 0; i < this.rules.length; i++) {
  //             this.sourceTables = this.rules[i].source_table.split(",");
  //             this.tables.push(this.sourceTables);
  //           }
  //           this.hideTable = false;
  //         }
  //       });
  //   } else {
  //     this.service
  //       .getProjectRulesData(
  //         this.selectedProjectId,
  //         e.target.attributes.value.value
  //       )
  //       .subscribe((res) => {
  //         this.loading=false;
  //         this.rules = res;
  //         if (this.rules.length == 0) {
  //           this.hideTable = true;
  //           this.noRulesCreated=false
  //         } else {
  //           this.tables = [];
  //           for (let i = 0; i < this.rules.length; i++) {
  //             this.sourceTables = this.rules[i].source_table.split(",");
  //             this.sourceTables = this.trimArraySpaces(this.sourceTables);
  //             this.tables.push(this.sourceTables);
  //           }
  //           this.hideTable = false;
  //         }
  //       });
  //   }
  //   if (this.activeTab == '1') {
  //     this.hideDescription = true;
  //     this.hidePreviewDataButton = true;
  //   } else {
  //     this.hideDescription = false;
  //     this.hidePreviewDataButton = false;
  //   }
  // }

  trimArraySpaces(arr: any) {
    return arr.map(function (item: any) {
      return item.trim();
    });
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  ruleActiveState(i: any, e: any) {
    let raw = {
      is_active: this.rules[i].is_active,
    };
    this.httpClient
      .patch(
        env.ip + apiPaths.api.root + apiPaths.api.saveRule + this.rules[i].id,
        raw
      )
      .subscribe();
  }

  queryInsights(role: any) {
    this.router.navigate([navigationRoutes.querInsight], {
      state: { rule: role },
    });
  }

  openGetDataBaseTable(rule: any) {
    if (rule.layer == '1') {
      this.openGetData(rule);
    } else if (rule.layer == '2') {
      //   this.appObservable.setBronzeSilver$(rule);
      this.appObservable.setPreviousURL(this.currentUrl);
      this.router.navigate([navigationRoutes.workBench + rule.project_id], {
        state: { rule: rule },
      });
    } else if (rule.layer == '3') {
      //   this.appObservable.setEditQueryBuilder$(rule);
      this.appObservable.setPreviousURL(this.currentUrl);
      this.router.navigate([navigationRoutes.queryBuilder + rule.project_id], {
        state: { rule: rule, url: this.currentUrl },
      });
    }
  }

  openGetData(data: any) {
    const modalRef = this.modalService.open(GetDatabaseTablesComponent, {
      size: 'l',
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.data = data;
  }

  getGoldLayerTableColumnsData(tableName: any) {
    if (tableName.layer === '2') {
      this.httpClient
        .get(
          env.ip +
            apiPaths.api.root +
            apiPaths.api.getSilverLayerTableData +
            `${tableName.target_table}` +
            '?project_id=' +
            `${this.projectId}`
        )
        .subscribe((res: any) => {
          this.silverLayerTableColumnsData = res;
          this.openDataPreviewModal(
            tableName.target_table,
            this.silverLayerTableColumnsData
          );
          // let goldLayerTableColumns = this.goldLayerTableColumnsData.map(
          //   (key: any) => Object.keys(key)
          // );
          // this.selectedGoldLayerTableColumnsData = goldLayerTableColumns[0];
        });
    } else if (tableName.layer === '3') {
      this.service
        .getGoldLayerTablePreview(
          tableName.target_table,
          this.projectId,
          'resultData'
        )
        .subscribe((res: any) => {
          this.goldLayerTableColumnsData = res;
          let goldLayerTableColumns = this.goldLayerTableColumnsData.map(
            (key: any) => Object.keys(key)
          );
          this.selectedGoldLayerTableColumnsData = goldLayerTableColumns[0];
          this.openDataPreviewModal(
            tableName.target_table,
            this.goldLayerTableColumnsData
          );
        });
    }
  }
  // getSilverTableColumnsData(tableName: any) {
  //   this.httpClient
  //     .get(env.getGoldLayerTableData + `${tableName}`)
  //     .subscribe((res: any) => {
  //       this.goldLayerTableColumnsData = res;
  //       let goldLayerTableColumns = this.goldLayerTableColumnsData.map(
  //         (key: any) => Object.keys(key)
  //       );
  //       this.selectedGoldLayerTableColumnsData = goldLayerTableColumns[0];
  //       this.openDataPreviewModal(this.goldLayerTableColumnsData);
  //     });
  // }

  displayTableData(e: any, rule: any) {
    if (rule.layer === '3') {
      this.httpClient
        .get(
          env.ip +
            apiPaths.api.root +
            apiPaths.api.getSilverLayerTableData +
            `${rule.source_table}` +
            '?project_id=' +
            `${this.projectId}`
        )
        .subscribe((res: any) => {
          this.silverLayerTableColumnsData = res;
          this.openDataPreviewModal(
            rule.source_table,
            this.silverLayerTableColumnsData
          );
        });
    } else {
      this.openDataSourceDataPreviewModal(e.target.value);
    }
  }

  openDataSourceDataPreviewModal(data: any) {
    const modalRef = this.modalService.open(SchemaDataComponent, {
      size: commonConst.modal_size_xl,
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.data = data;
  }

  openDataPreviewModal(tableName: any, data: any) {
    const modalRef = this.modalService.open(QueryBuilderDataPreviewComponent, {
      size: commonConst.modal_size_xl,
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.tableName = tableName;
    modalRef.componentInstance.data = data;
    // modalRef.componentInstance.data = url;
  }

  projectList() {
    this.router.navigate([navigationRoutes.projects]);
  }

  openDialog(Query: any): void {
    this.dialog.open(QueryDisplayComponent, {
      width: 'fit-content',
      height: 'fit-content',
      disableClose: true,
      data: { query: Query },
    });
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

  routeHome() {
    return `/projects`;
  }
  routeDataPipelines() {
    return `/project-view`;
  }
  routeWorkflows() {
    this.router.navigate([
      navigationRoutes.workflowDashboard +
        `${this.projectId}` +
        '/' +
        `${this.layer_name}`,
    ]);
  }
  workflowTitle() {
    if (this.layer_name === 'silver_layer') {
      return 'Refined Scheduler';
    } else {
      return 'Report Scheduler';
    }
  }

  viewData(data: any) {
    this.router.navigate(
      [
        navigationRoutes.goldLayerTableColumnsData,
        `${this.selectedProjectId}`,
        `${data.job_name}`,
        `${data.job_name}`,
        `${this.layer_name === 'silver_layer' ? 'silverLayerData' : 'goldLayerData' }`,
      ],
      {
        queryParams: {
          redirectPage: 'rules_page',
          layer_name: this.layer_name,
        },
        queryParamsHandling: 'merge',
      }
    );
  }

  editRule(data: any) {
    this.router.navigate(
      [
        navigationRoutes.queryBuilder,
        `${this.selectedProjectId}`,
        `${this.layer_switch}`,
      ],
      {
        queryParams: {
          job_name: data.job_name,
          job_id: data.id,
          query: 'edit',
        },
        queryParamsHandling: 'merge',
      }
    );
  }
}
