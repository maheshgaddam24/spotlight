import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import { isEqual } from 'lodash';
import { AppObservable } from 'src/app/shared/app-observable';
import { syncDatabase } from 'src/app/shared/headers';
import { ApiService } from 'src/app/shared/services/api/api.service';
import { environment as env } from 'src/environments/environment';
import { apiPaths } from '../../Config/apiPaths';
import { toastMessages } from '../../Config/toastr-messages';

@Component({
  selector: 'app-get-database-tables',
  templateUrl: './get-database-tables.component.html',
  styleUrls: ['./get-database-tables.component.scss'],
})
export class GetDatabaseTablesComponent implements OnInit {
  @Input() data: any;
  @Output() rowColumFilteredData: EventEmitter<any> = new EventEmitter<any>();
  @Output() cancelGetDatabaseSelect: EventEmitter<any> = new EventEmitter<any>();

  selectedDatabaseTableNames: any;
  checkedDataBaseTables: any[] = [];
  selectedProjectId: any;
  databaseConnectionId: any;
  hideFetchingTablesText: boolean = true;
  hideHeaderText: boolean = true;
  isChecked: boolean = false;
  selectedTables: any;
  uniqueArray: any[] = [];
  updateSourceTables: any;
  dataForRules: any[] = [];
  previousSelectedTables: any[] = [];
  isEqual: boolean = true;
  perviousTablesCheck: boolean = true;
  isConfirmDisabled: boolean = false;
  rules_data: any;
  dataBaseSourceId: any;
  matchingIndices: any[] = [];
  schema: any[] = [];
  selectAll: boolean = false;
  projectId: number;

  constructor(
    private appObservable: AppObservable,
    private httpClient: HttpClient,
    public modalService: NgbModal,
    private service: ApiService,
    private toastService: HotToastService,
    private router: Router,
    public modal: NgbActiveModal,
    public route: ActivatedRoute,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    const id = sessionStorage.getItem('project_id');
    this.projectId = parseInt(id);
    if (this.router.url.includes('rules')) {
      this.appObservable.setChangesDetection$('change');
      this.httpClient
        .get(
          env.ip +
          apiPaths.dataload.root +
          apiPaths.dataload.getRunDagID +
          this.data.project_id
        )
        .subscribe((res: any) => {
          let body = {
            dag_run_id: res[0].SOURCE_DAG_RUN_ID,
          };
          this.rules_data = {
            connection_id: res[0].CONNECTION_ID,
            source_id: res[0].SOURCE_ID,
          };
          // this.appObservable.setDataBase_source_Id$(res[0].SOURCE_ID);
          this.appObservable.setDagRunId(res[0].SOURCE_DAG_RUN_ID);
          // this.appObservable.setDataBase_connection_Id$(res[0].CONNECTION_ID);
          this.appObservable.setProjectName$(res[0].PROJECT_NAME);
          this.appObservable.setProjectId$(res[0].PROJECT_ID);
          this.hideFetchingTablesText = false;
          this.httpClient
            .post(
              env.ip +
              apiPaths.dataload.root +
              apiPaths.dataload.getDatabaseTablesList,
              body,
              { headers: syncDatabase }
            )
            .subscribe((res: any) => {
              this.hideFetchingTablesText = true;
              this.selectedDatabaseTableNames = res.value;
              this.selectedDatabaseTableNames =
                this.selectedDatabaseTableNames.replace(/['"]+/g, '');
              this.selectedDatabaseTableNames =
                this.selectedDatabaseTableNames.replace(/[\[\] ]+/g, '');
              this.selectedDatabaseTableNames =
                this.selectedDatabaseTableNames.split(',');
              this.selectedTables = this.data.source_table.split(',');
              this.previousSelectedTables = this.data.source_table.split(',');
            });
        });
    } else {
      this.hideHeaderText = false;
      this.hideFetchingTablesText = true;
      this.selectedDatabaseTableNames = this.data;
      // const { beforeDot, afterDot } = this.splitArrayByDot(this.data);
      // this.selectedDatabaseTableNames=afterDot;
      // this.schema=beforeDot
    }
  }

  toggleSelectAll() {
    for (const item of this.selectedDatabaseTableNames) {
      item.selected = this.selectAll;
    }
  }

  cancelGetDatabaseTableSelect() {
    this.cancelGetDatabaseSelect.emit()
  }

  uniqueCheck(table: any) {
    if (this.router.url.includes('rules')) {
      this.appObservable.getChangesDetection$().subscribe((res: any) => {
        if (res == 'change') {
          this.checkedDataBaseTables = this.selectedTables;
        }
      });
      let checked: boolean = false;
      for (let i = 0; i < this.selectedTables.length; i++) {
        if (this.selectedTables[i] === table) {
          return (checked = true);
        } else {
          checked = false;
        }
      }
      return;
    } else {
      return;
    }
  }

  onSelect(e: any) {
    this.appObservable.setChangesDetection$('change detected');
    if (e.target.checked) {
      this.checkedDataBaseTables.push(e.target.value);
    } else if (!e.target.checked) {
      this.checkedDataBaseTables = this.checkedDataBaseTables.filter(function (
        item
      ) {
        return item !== e.target.value;
      });
    }
  }

  sendSelectedTables() {
    this.data.forEach((element, index) => {
      if (this.checkedDataBaseTables.indexOf(element) !== -1) {
        this.matchingIndices.push(index);
      }
    });
    if (this.checkedDataBaseTables.length == 0) {
      this.toastService.warning(toastMessages.pleaseSelectTable);
    } else {
      this.isConfirmDisabled = true;
      this.appObservable.setDataBaseSelectedTables$(this.checkedDataBaseTables);
      if (this.router.url.includes('rules')) {
        this.appObservable.getProjectId$().subscribe((res: any) => {
          this.selectedProjectId = res;
        });
        this.updateSourceTables = this.checkedDataBaseTables.toString();
        this.updateSourceTables = this.updateSourceTables.replace(/['"]+/g, '');
        this.updateSourceTables = this.updateSourceTables.replace(
          /[\[\] ]+/g,
          ''
        );
        this.perviousTablesCheck = isEqual(
          this.previousSelectedTables,
          this.checkedDataBaseTables
        );
        if (this.perviousTablesCheck) {
          this.modalService.dismissAll();
        } else {
          let raw = {
            is_active: false,
          };
        }
      } else {
        this.openRowColumnFiltering(this.checkedDataBaseTables);
        this.service
          .postSelectedTablesSDB(this.projectId, this.checkedDataBaseTables)
          .pipe(
            this.toastService.observe({
              loading: toastMessages.savingTablesSDB,
              success: (s) => toastMessages.successSavingTablesSDB,
              error: (e) => toastMessages.errorSavingTablesSDB,
            })
          );
      }
    }
  }

  splitArrayByDot(inputArray: string[]): {
    beforeDot: string[];
    afterDot: string[];
  } {
    return inputArray.reduce(
      (result, current) => {
        if (current.includes('.')) {
          const dotIndex = current.indexOf('.');
          const stringBeforeDot = current.substring(0, dotIndex);
          const stringAfterDot = current.substring(dotIndex + 1);

          result.beforeDot.push(stringBeforeDot);
          result.afterDot.push(stringAfterDot);
        } else {
          result.beforeDot.push(current);
        }

        return result;
      },
      { beforeDot: [], afterDot: [] }
    );
  }
  // openRowColumnFiltering(data:any){
  //   const modalRef = this.modalService.open(RowColumnFilteringComponent, {
  //     size:"xl",
  //     backdrop: 'static',
  //     centered: true,
  //   });
  //   modalRef.componentInstance.data = data;
  // }

  openRowColumnFiltering(data: any): void {
    // this.closeCreateProjectModal()
    //  const dialogRef= this.dialog.open(RowColumnFilteringComponent, {
    //     height: '80%',
    //     width: '80%',
    //     disableClose: true,
    //     data:data ,
    //   });
    //   dialogRef.componentInstance.isGetDatabaseTablesComponent = "database";
    this.rowColumFilteredData.emit(data);
  }
}