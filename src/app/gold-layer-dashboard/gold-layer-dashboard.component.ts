import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, map } from 'rxjs/operators';
import { commonConst } from '../shared/Config/common-const';
import { GoldLayerTable } from '../shared/Config/interfaces';
import { navigationRoutes } from '../shared/Config/navigation-routes';
import { ReportGenerationComponent } from '../shared/components/report-generation/report-generation.component';
import { ApiService } from '../shared/services/api/api.service';

@Component({
  selector: 'app-gold-layer-dashboard',
  templateUrl: './gold-layer-dashboard.component.html',
  styleUrls: ['./gold-layer-dashboard.component.scss'],
})
export class GoldLayerDashboardComponent implements OnInit {
  goldLayerTablesDataList: any;
  selectedProjectId: any;
  sortColumn: string = '';
  sortOrder: number = 1;
  projectName: any;
  loading: boolean = true;
  noReports: boolean = false;
  currentPage: number = 1;
  pageSize: number = 9;
  pagedGoldLayerTablesDataList: any[] = [];
  screenChange: any;
  activeTableIndex: number;
  activeTabErrorQueue: number = 0;
  total_records_inserted: any;
  records_eliminated: any;
  total_reports: any;

  constructor(
    public modalService: NgbModal,
    private service: ApiService,
    public router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog
  ) {
    this.pagedGoldLayerTablesDataList = [];
  }

  ngOnInit(): void {
    this.projectName = sessionStorage.getItem('project_name');
    this.selectedProjectId = this.route.snapshot.params[commonConst.params_id];
    this.getGoldLayerTablesDataList(this.selectedProjectId);
    this.screenChange = window.matchMedia('(max-width: 1535px)');
    if (this.screenChange.matches) {
      this.pageSize = 8;
    }
    this.screenChange = window.matchMedia('(min-width: 1537px)');
    if (this.screenChange.matches) {
      this.pageSize = 13;
    }
  }
  toggleAccordion(index: number): void {
    this.activeTableIndex = this.activeTableIndex === index ? -1 : index;
    this.activeTabErrorQueue = this.activeTabErrorQueue === index ? -1 : index;

  }

  getColumnCount(): number {
    return 6;
  }

  isActive(index: number): boolean {
    return this.activeTableIndex === index;
  }

  isActiveDataSetTab(index: number): boolean {
    return this.activeTabErrorQueue === index;
  }

  getGoldLayerTablesDataList(id: any) {
    this.service
      .goldLayerTablesList(id)
      .pipe(
        map((res: any) => {
          return res.map((item: any) => ({
            TABLE_NAME: item.table_name,
            ROW_COUNT: item.row_count,
            FILE_GENERATED_LINK: item.file_generated_link,
            CREATED_AT: item.created_at,
            DB_TABLE_NAME: item.db_table_name,
            ELIMINATED_RECORDS: item.eliminated_records,
            SOURCE_SYSTEM: item.source_system,
            ERROR_QUEUE_INFO: item.error_queue_info ? JSON.parse(item.error_queue_info) : null,
          })) as GoldLayerTable[];
        }),
        catchError((error: any) => {
          this.loading = false;
          return error('Failed to map API response');
        })
      )
      .subscribe({
        next: (data: GoldLayerTable[]) => {
          this.loading = false;
          this.goldLayerTablesDataList = data;
          this.total_reports = data.length
          if (this.goldLayerTablesDataList.length === 0) {
            this.noReports = true;
          }
          this.setPage(1);
          this.getTableInfo(0, this.goldLayerTablesDataList[0]);
          this.route.queryParams.subscribe((params) => {
            const isEmpty = Object.keys(params).length === 0;
            if (!isEmpty) {
              this.activeTabErrorQueue = params['ActiveIndex'];
              this.activeTableIndex = params['ActiveIndex'];
              this.currentPage = params['ActivePageNation'];
              this.setPage(+this.currentPage);
              this.toggleAccordion(+this.activeTabErrorQueue);
            }
          });
          this.getTableInfo(
            this.activeTableIndex,
            this.pagedGoldLayerTablesDataList[this.activeTableIndex]
          );
        },
        error: (error: any) => {
          console.error('Error in API call:', error);
        },
      });
  }
  displayNoErrorQueue(errorQueueInfo: string) {
    if (errorQueueInfo === null) {
      return true
    } else {
      return false
    }
  }

  getTableInfo(index: number, tableData: any) {
    this.activeTableIndex = index;
    this.total_records_inserted = tableData.ROW_COUNT;
    this.records_eliminated = tableData.ELIMINATED_RECORDS;
  }

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortOrder *= -1;
    } else {
      this.sortColumn = column;
      this.sortOrder = 1;
    }
    this.goldLayerTablesDataList.sort((a, b) => {
      const dateA = new Date(a[this.sortColumn]);
      const dateB = new Date(b[this.sortColumn]);

      return (dateA > dateB ? 1 : -1) * this.sortOrder;
    });
  }

  createNewWorkflow() {
    // this.navigateUrl = navigationRoutes.workflow + `${this.projectId}`;

    this.router.navigate(
      [navigationRoutes.queryBuilder + `${this.selectedProjectId}`],
      {
        state: {
          project_name: this.projectName,
          project_id: this.selectedProjectId,
        },
      }
    );
  }
  openGoldTableColumnsData(e: any, data: string) {
    if (data == 'eliminatedData') {
      this.router.navigate(
        [
          navigationRoutes.goldLayerTableColumnsData,
          `${this.selectedProjectId}`,
          `${e.error_table}`,
          `${e.dataset}`,
          `${data}`,
        ],
        {
          queryParams: {
            ActiveIndex: this.activeTabErrorQueue,
            ActivePageNation: this.currentPage,
          },
          queryParamsHandling: 'merge',
        }
      );
    } else {
      this.router.navigate(
        [
          navigationRoutes.goldLayerTableColumnsData,
          `${this.selectedProjectId}`,
          `${e.DB_TABLE_NAME}`,
          `${e.TABLE_NAME}`,
          `${data}`,
        ],
        {
          queryParams: {
            ActiveIndex: this.activeTabErrorQueue,
            ActivePageNation: this.currentPage,
          },
          queryParamsHandling: 'merge',
        }
      );
    }
  }

  projectDashboard() {
    this.router.navigate([
      navigationRoutes.projectDashboard + `${this.selectedProjectId}`,
    ]);
  }

  projectList() {
    this.router.navigate([navigationRoutes.projects]);
  }

  openDialog(table_name: any): void {
    this.dialog.open(ReportGenerationComponent, {
      width: '520px',
      disableClose: true,
      data: { tableName: table_name },
    });
  }

  setPage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    const startIndex = (page - 1) * this.pageSize;
    const endIndex = Math.min(
      startIndex + this.pageSize - 1,
      this.goldLayerTablesDataList.length - 1
    );
    this.pagedGoldLayerTablesDataList = this.goldLayerTablesDataList.slice(
      startIndex,
      endIndex + 1
    );
    this.getTableInfo(0, this.pagedGoldLayerTablesDataList[0]);
  }

  get totalPages(): number {
    return Math.ceil(this.goldLayerTablesDataList.length / this.pageSize);
  }

  get pages(): number[] {
    const totalPages = this.totalPages;
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  routeHome() {
    return `/projects`;
  }
  routeDataPipelines() {
    this.router.navigate([navigationRoutes.data_lineage]);
  }
}