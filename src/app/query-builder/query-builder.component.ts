export interface iJoinCondition {
  firstTable?: string;
  firstAttribute?: string;
  secTable?: string;
  secAttribute?: string;
  join_con?: string;
  conditions?: any[];
}

import { Clipboard } from '@angular/cdk/clipboard';
import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-xcode';
import { IDropdownSettings } from 'ng-multiselect-dropdown/multiselect.model';
import { catchError, lastValueFrom } from 'rxjs';
import { format } from 'sql-formatter';
import { environment as env } from 'src/environments/environment';
import { CanComponentDeactivate } from '../can-deactivate.guard';
import { apiPaths } from '../shared/Config/apiPaths';
import { commonConst } from '../shared/Config/common-const';
import { navigationRoutes } from '../shared/Config/navigation-routes';
import { AppObservable } from '../shared/app-observable';
import { QueryBuilderDataPreviewComponent } from '../shared/components/query-builder-data-preview/query-builder-data-preview.component';
import { HighlightService } from '../shared/components/rules-data-view/highilight_rule.service';
import { ApiService } from '../shared/services/api/api.service';
import { AppliedDqChecksService } from '../shared/services/dq-checks-service/applied-dq-checks.service';
declare const bootstrap: any;

export const data = [
  {
    name: 'client_column',
    email: '',
    phone: '',
  },
  {
    name: 'column 2',
    email: '',
    phone: '',
  },
  {
    name: 'column 3',
    email: '',
    phone: '',
  },
];
export class DynamicGrid {
  agg_col!: string;
  agg_function!: string;
  field!: string;
  operator!: string;
  value!: string;
  condition!: string;
  case_operator!: string;
  case_field!: string;
  case_value!: string;
  then_con!: string;
  orderby_col!: string;
  orderby_operator!: string;
  groupby_col!: string;
  custom_query!: string;
  custom_col!: string;
  firstTable!: string;
  firstAttribute!: string;
  secTable!: string;
  secAttribute!: string;
  join_con!: string;
  conditions!: any[];
  operation!: string;
  derived_col!: string;
}
@Component({
  selector: 'app-query-builder',
  templateUrl: './query-builder.component.html',
  styleUrls: ['./query-builder.component.scss'],
})
export class QueryBuilderComponent
  implements OnInit, CanComponentDeactivate, AfterViewInit
{
  @ViewChild('auditOffcanvas') auditOffcanvas!: ElementRef;
  @ViewChild('editor') private editor: ElementRef<HTMLElement>;
  @ViewChild('dataPreview', { static: false })
  dataPreview: QueryBuilderDataPreviewComponent;
  @ViewChild(QueryBuilderDataPreviewComponent)
  queryBuilderComponent: QueryBuilderDataPreviewComponent;
  restrictMove: boolean = true;
  selectedDecision!: string;
  fields: any;
  creatingGoldLayerTable: {};
  tablesChecked: any[] = [];
  selectedTablesFields: any[] = [];
  columnsOfSelectedTables: any[] = [];
  tableName: any;
  selectedTabledata: any[] = [];
  sliverLayerTableNames: any[] = [];
  hideQueryBuilder: boolean = true;
  hideTextDiv: boolean = false;
  hideJoinsTab: boolean = true;
  hideGroupByTab: boolean = false;
  checkedTableNames: any[] = [];
  silverLayerTablePreviewData: any;
  error_queue_data: any;
  selectedGoldLayerTableName: any;
  selectedSilverLayerTablePreviewData: any;
  selectedProjectID: any;
  saveButtonDisabled: boolean = true;
  silverLayerData: any[] = [];
  queryData: any[] = [];
  previousTableNames: any[] = [];
  rule: any;
  selectedData: {};
  attributes: {};
  selectedDropdownColumns: any[] = [];
  selectedTableColumns: {};
  selectedGroupByColumns: any[] = [];
  silverLayerTables: any[] = [];
  selectedBronzeTables: any[] = [];
  selectedSilverTables: any[] = [];
  bronzeLayerSelectedTableColumns: any;
  checkedBronzeLayerTableName: any[] = [];
  bronzeLayerTables: any[] = [];
  finalquery: string = '';
  savedFinalQuery: string = '';
  columnNames: any;
  selectedTableNames: any[] = [];
  selectedcolumn!: any;
  activeTab = 'case';
  selectedColumns: any[] = [];
  selectedColumnsNames: any;
  ngDropdownSettings: IDropdownSettings = {
    enableCheckAll: false,
    allowSearchFilter: true,
  };
  dropdownSettings: IDropdownSettings = {
    allowSearchFilter: true,
    itemsShowLimit: 2,
  };
  selectedOption: string;
  projectId: any;
  projectName: any;
  hashIDs: any[] = [];
  copyIcon: any = 'content_copy';
  queryOptions: any[] = [];
  selectedQueryOption: any;
  isCheckboxDisabled: boolean = false;
  isColumnSelected: boolean = false;

  //Aggregate
  dynamicAggregateArray: any = [];
  aggregateParams: any = {};
  aggregateFunctions: string[] = [
    'Min',
    'Max',
    'Avg',
    'Sum',
    'Count',
    'Distinct Count',
  ];
  aggregateQuery: string = '';

  //Group By
  dynamicGroupByArray: any = [];
  groupbyParams: any = {};
  finalGroupQuery: any;
  savedFinalGroupQuery: any;

  // Having Form
  dynamicHavingArray: any = [];
  havingParams: any = {};
  havingQuery: string = '';
  havingColumns: any = [];

  //Filter Form
  dynamicQueryArray: any = [];
  queryParams: any = {};
  decisions: string[] = ['AND', 'OR'];
  conditions: string[] = ['=', '!=', '>', '<', '>=', '<=', 'In'];
  filterQuery: string = '';

  // Case Form
  dynamicCaseQueryArray: any = [];
  caseQueryParams: any = {};
  caseParams: any = {};
  caseConditions: string[] = ['=', '!=', '>', '<', '>=', '<='];
  finalcasequery: string = '';
  savedfinalcasequery: string = '';
  final_case: any[] = [];
  when_con: string = '';
  then_con: string = '';
  else_con: string = '';
  end_as_con: string = '';
  case_data = [];
  when_state = [];
  cases: any = {};
  caseStatementQuery: string = '';
  generatedColumns: any[] = [];

  //Order By
  dynamicOrderByArray: any = [];
  orderOperations: string[] = ['ASC', 'DESC'];
  orderbyParams: any = {};
  finalorderquery: any;
  saveFinalOrderQuery: any;
  orders: any = {};
  orderByQuery: string = '';
  groupByQuery: string = '';
  customQuery: string = '';
  bronzeLayerTableData: any;
  bronzeTablePreviewData: any;

  //Derived Column
  dynamicDerivedColArray: any = [];
  derivedColParams: any = {};
  derivedQuery: any;
  derivedColumns: any[] = [];

  //Custom Query
  dynamicCustomQueryArray: any = [];
  customQueryParams: any = {};
  finalCustomQuery: any;
  savedFinalCustomQuery: any;
  selectedProjectId: any;
  editQueryBuilder: any;
  url: any;

  //Joins
  dynamicJoinsArray: any = [];
  joinsParams: any = {};
  joinConditions: string[] = [
    'INNER JOIN',
    'FULL OUTER JOIN',
    'LEFT JOIN',
    'RIGHT JOIN',
  ];
  columnsData: any;
  joinsQuery: string = '';
  joinQueryForAPI: string = '';
  params: any = {};
  joinType: boolean = true;
  dynamicSelectedData: any[] = [];
  dynamicSelectedAttributes: any[] = [];
  dynamicSelectedDataForSubCon: any[] = [];
  dynamicSelectedAttributesForSubCon: any[] = [];
  leftAreaSize: any = 3;
  loading: boolean;
  errorContainer: boolean = false;
  errorData: any;
  selectedParentColumns: { [parent: string]: boolean } = {
    nullCheck: false,
    dateCheck: false,
    stringCheck: false,
    upperCaseCheck: false,
  };
  tableSearch: string = '';
  unsavedChanges: boolean = false;
  filteredBronzeLayerTables: string[];
  selectedColumnsOutput: { [parent: string]: string[] } = {};
  silverLayerTablePreviewQueryData: any;
  editableQuery: any;
  aceEditor: any;
  traceabilityInfo: any;
  groupByColumns: any;
  layerName: string;
  joiningLayerName: string;
  runTime: any;
  highlightRoute: any;
  selectedTables: any[] = [];
  selectedFilter: string = 'correct';
  isErrorQueueDisabled: boolean = true;
  buildQueryButtonDisplay: boolean = true;
  saveQueryBtnDisable: boolean = true;
  querySaveBtn: string = 'Save Query';
  initialCheck: boolean = false;
  activeQueryEdit: any;
  pastArrayTableName: string[];
  activeEditPreviewSqlQuery = false;
  editSelectColumns: any;
  editCaseStatement: any;
  edit_end_as_con: any;
  edit_else_con: any;
  editAggregate: any;
  editHaving: any;
  editOrderBy: any;
  editGroupBy: any;
  editJoins: any;
  editFilter: any;
  editSelectedTables: any;
  editAppliedChecks: any;
  editScheduledFrequency: string;
  editDerivedCol: any;
  initialColumnsFetched: any;
  resultant_records_count: any;
  error_queue_count: any;
  total_records_count: any;
  textData: string;
  schemaColumnData: any;
  sortColumnChecked: any;

  constructor(
    private httpClient: HttpClient,
    public modalService: NgbModal,
    public fb: FormBuilder,
    private appObservable: AppObservable,
    private route: ActivatedRoute,
    private router: Router,
    private service: ApiService,
    private toastService: HotToastService,
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone,
    private appliedChecksService: AppliedDqChecksService,
    private highlightService: HighlightService,
    private clipboard: Clipboard
  ) {
    this.queryOptions = [
      'Joins',
      'Aggregate',
      'Case Statement',
      'Group By',
      'Having',
      'Order By',
      'Filter',
      'Derived Columns',
      // 'Custom Query',
    ];
  }

  getDataSources() {
    this.router.navigate(
      [navigationRoutes.stagingView + `Raw Sources/${this.projectId}`],
      {
        queryParams: {
          loadDataOffCanvas: true,
        },
        queryParamsHandling: 'merge',
      }
    );
  }

  onFilterChange(filterOption: string) {
    this.triggerMethodInChildComponent(filterOption);
    this.textData = filterOption;
  }

  triggerMethodInChildComponent(filterOption: string): void {
    if (this.dataPreview) {
      this.dataPreview.methodInChildComponent(filterOption);
    }
  }
  get layer_name() {
    return this.route.snapshot.params[commonConst.params_layer_Name];
  }
  resultantInfoText() {
    if (this.textData === 'error') {
      if (this.error_queue_count > 200) {
        return true;
      } else {
        return false;
      }
    } else {
      if (this.resultant_records_count > 200) {
        return true;
      } else {
        return false;
      }
    }
  }
  textDataLabel() {
    if (this.textData === 'error') {
      return 'error queue';
    } else {
      return 'results';
    }
  }

  shouldChangeBackground(queryType: string) {
    if (
      (queryType === 'Filter' && this.filterQuery) ||
      (queryType === 'Joins' && this.joinsQuery) ||
      (queryType === 'Case Statement' && this.caseStatementQuery) ||
      (queryType === 'Group By' && this.groupByQuery) ||
      (queryType === 'Order By' && this.orderByQuery) ||
      (queryType === 'Aggregate' && this.aggregateQuery) ||
      (queryType === 'Having' && this.havingQuery) ||
      (queryType === 'Derived Columns' && this.derivedQuery)
    ) {
      return true;
    } else {
      return false;
    }
  }

  isChecked(tableName: string): boolean {
    this.pastArrayTableName =
      this.activeQueryEdit === 'edit' ? this.editSelectedTables : [];

    const isChecked = this.pastArrayTableName.includes(tableName);

    if (isChecked && !this.initialCheck) {
      this.initialCheck = true;
      this.sequentialAPICalls(this.pastArrayTableName);
    }
    return isChecked;
  }
  async sequentialAPICalls(tableNames: string[]) {
    for (let i = 0; i < tableNames.length; i++) {
      await this.onBronzeTableSelect(tableNames[i]);
    }
  }
  ngAfterViewInit(): void {
    this.route.queryParams.subscribe((params) => {
      const isEmpty = Object.keys(params).length === 0;
      if (!isEmpty) {
        this.activeQueryEdit = params['query'];

        if (this.activeQueryEdit === 'edit') {
          this.querySaveBtn = 'Update';
        } else {
          this.querySaveBtn = 'Save Query';
        }
      }
    });
  }
  editQueryData(job_id: any) {
    return this.service.getEditQueryData(job_id);
  }

  canDeactivate(): boolean {
    if (this.unsavedChangesExist()) {
      return window.confirm(
        'Are you sure you want to leave this page? Any queries you have made will not be retrieve back.'
      );
    }
    return true;
  }
  private unsavedChangesExist(): boolean {
    return this.unsavedChanges;
  }
  toggleParent(parent: string): void {
    this.selectedParentColumns[parent] = !this.selectedParentColumns[parent];

    if (!this.selectedParentColumns[parent]) {
      this.selectedColumnsOutput[parent] = [];
    }
  }

  isSelectedColumn(column: string, parent: string): boolean {
    return this.selectedColumnsOutput[parent]?.includes(column);
  }

  toggleColumn(column: string, parent: string): void {
    if (!this.selectedColumnsOutput[parent]) {
      this.selectedColumnsOutput[parent] = [];
    }

    const index = this.selectedColumnsOutput[parent].indexOf(column);
    if (index === -1) {
      this.selectedColumnsOutput[parent].push(column);
    } else {
      this.selectedColumnsOutput[parent].splice(index, 1);
    }
  }
  dynamicQueries() {
    this.dynamicAggregateArray = [];
    this.dynamicQueryArray = [];
    this.dynamicCaseQueryArray = [];
    this.dynamicOrderByArray = [];
    this.dynamicGroupByArray = [];
    this.dynamicHavingArray = [];
    this.dynamicDerivedColArray = [];
    this.dynamicCustomQueryArray = [];
    this.dynamicJoinsArray = [];

    this.customQuery = '';
    this.caseStatementQuery = '';
    this.joinsQuery = '';
    this.joinQueryForAPI = '';
    this.filterQuery = '';
    this.groupByQuery = '';
    this.orderByQuery = '';
    this.derivedQuery = '';

    this.aggregateParams = {
      agg_col: '',
      agg_function: '',
    };

    this.queryParams = {
      field: '',
      operator: '',
      value: '',
      condition: this.selectedDecision,
    };

    this.caseQueryParams = {
      case_conditions: [
        {
          case_field: '',
          case_operator: '',
          case_value: '',
          then_con: '',
        },
      ],
      else_con: '',
      end_as_con: '',
    };

    this.orderbyParams = {
      orderby_col: '',
      orderby_operator: '',
    };

    this.groupbyParams = {
      groupby_col: '',
    };

    this.havingParams = {
      field: '',
      operator: '',
      value: '',
      condition: this.selectedDecision,
    };

    this.derivedColParams = {
      operation: '',
      derived_col: '',
    };

    this.customQueryParams = {
      custom_query: '',
    };

    this.joinsParams = {
      firstTable: '',
      firstAttribute: '',
      join_con: '',
      secTable: '',
      secAttribute: '',
      conditions: [],
    };

    this.dynamicAggregateArray.push(this.aggregateParams);
    this.dynamicQueryArray.push(this.queryParams);
    this.dynamicCaseQueryArray.push(this.caseQueryParams);
    this.dynamicOrderByArray.push(this.orderbyParams);
    this.dynamicGroupByArray.push(this.groupbyParams);
    this.dynamicHavingArray.push(this.havingParams);
    this.dynamicDerivedColArray.push(this.derivedColParams);
    this.dynamicCustomQueryArray.push(this.customQueryParams);
    this.dynamicJoinsArray.push(this.joinsParams);
  }

  getTables(projectId: any, layer_name: any) {
    if (layer_name === 'bronze_layer') {
      this.service.getBronzeLayerTables(projectId).subscribe((res) => {
        this.bronzeLayerTables = res['DATA_SOURCE'];
        this.filteredBronzeLayerTables = this.bronzeLayerTables;
      });
    } else if (layer_name === 'silver_layer') {
      this.httpClient
        .get(
          env.ip +
            apiPaths.api.root +
            apiPaths.api.getSilverLayerTableNames +
            `${this.selectedProjectId}`
        )
        .pipe(
          catchError((Error) => {
            this.toastService.error(Error.error.error);
            return Error(Error);
          })
        )
        .subscribe((res) => {
          this.tableName = res;
          for (let i = 0; i < this.tableName.TABLENAME.length; i++) {
            this.sliverLayerTableNames.push(this.tableName.TABLENAME[i]);
          }
          this.filteredBronzeLayerTables = this.tableName.TABLENAME;
        });
    }
  }
  updateLeftAreaSize(newSize: number) {
    this.leftAreaSize = newSize;
    this.cdRef.detectChanges();
    this.ngZone.run(() => {
      this.leftAreaSize = newSize;
    });
  }

  getSilverLayerTableNames() {
    this.httpClient
      .get(
        env.ip +
          apiPaths.api.root +
          apiPaths.api.getSilverLayerTableNames +
          `${this.selectedProjectId}`
      )
      .pipe(
        catchError((Error) => {
          this.toastService.error(Error.error.error);
          return Error(Error);
        })
      )
      .subscribe((res) => {
        this.tableName = res;
        for (let i = 0; i < this.tableName.TABLENAME.length; i++) {
          this.sliverLayerTableNames.push(this.tableName.TABLENAME[i]);
        }
        this.silverLayerTables = this.tableName.TABLENAME;
      });
  }

  uniqueCheck(table: any) {
    // let checked: boolean = false;
    // for (let i = 0; i < this.previousTableNames.length; i++) {
    //   if (this.previousTableNames[i] === table) {
    //     return (checked = true);
    //   } else {
    //     checked = false;
    //   }
    // }
    // return;
  }

  openQueryBuilder(queryType: any) {
    this.selectedQueryOption = queryType;
  }

  hideJoin(queryType: any) {
    if (queryType == 'Joins') {
      return this.hideJoinsTab;
    }
  }

  getFields(tableName: any) {
    if (this.selectedTableNames.includes(tableName)) {
      return this.selectedTableNames;
    } else {
      this.selectedTableNames.push('SILVER_LAYER.' + tableName);
    }
    this.selectedTabledata = tableName;
    this.selectedTabledata = [];
    let columns = [];
    this.httpClient
      .get(
        env.ip +
          apiPaths.api.root +
          apiPaths.api.getSilverLayerColumns +
          `${tableName}` +
          '&project_id=' +
          `${this.projectId}`
      )
      .subscribe((res) => {
        this.fields = res;
        for (let i = 0; i < this.fields.length; i++) {
          this.selectedTabledata.push(this.fields[i][0]);
        }
        this.selectedTabledata = this.selectedTabledata.filter(
          (item: any) =>
            !item.startsWith('_AIRBYTE') &&
            !item.startsWith('SYSTEM_CREATED') &&
            !item.startsWith('SYSTEM_ID')
        );
        for (let j = 0; j < this.selectedTabledata.length; j++) {
          this.selectedTablesFields.push(
            tableName + '.' + this.selectedTabledata[j]
          );
        }
        this.hashIDs = this.selectedTablesFields.filter((item) =>
          item?.endsWith('SPOTLIGHT_HASHID')
        );
        this.selectedTablesFields = this.selectedTablesFields.filter(
          (item) => !item?.endsWith('SPOTLIGHT_HASHID')
        );
        columns = this.selectedTabledata;
        this.tablesChecked.push({ tableName, columns });
        this.tablesChecked?.filter((item) => {
          this.selectedTableColumns[item.tableName] = item.columns;
          // this.selectedGroupByColumns[item.tableName] = [];
        });
      });
  }

  deleteTableSelectedColumns(deleted: any) {
    this.selectedTabledata = this.selectedTabledata.filter(function (item) {
      return item !== deleted;
    });
    this.selectedColumns = this.selectedTabledata;
  }

  onColumnChange(e: any) {
    this.selectedcolumn = e.target.value;
  }

  // onRadioSelect(e: any) {
  //   this.dynamicQueries();
  //   this.tablesChecked = [];
  //   this.activeTab = 'case';
  //   this.hideGroupByTab = false;
  //   this.hideJoinsTab = true;
  //   this.selectedTableNames = [];
  //   this.checkedTableNames = [];
  //   this.selectedTablesFields = [];
  //   if (this.checkedTableNames.length >= 1) {
  //     this.hideQueryBuilder = false;
  //     this.hideTextDiv = true;
  //   } else {
  //     this.hideQueryBuilder = true;
  //     this.hideTextDiv = false;
  //   }
  //   if (e.target.value === 'BRONZE_LAYER') {
  //     this.selectedBronzeTables = [];
  //   } else {
  //     this.selectedSilverTables = [];
  //   }
  // }

  clearAllQueries() {
    this.caseStatementQuery = '';
    this.filterQuery = '';
    this.aggregateQuery = '';
    this.groupByQuery = '';
    this.orderByQuery = '';
    this.joinsQuery = '';
    this.customQuery = '';
    this.dynamicQueries();
  }
  rulesDataView() {
    if (this.layer_name === 'bronze_layer') {
      return 'Refined Workflows';
    } else if (this.layer_name === 'silver_layer') {
      return 'Report Workflows';
    }
  }
  rulesDataViewRoute() {
    if (this.layer_name === 'bronze_layer') {
      this.router.navigate([
        navigationRoutes.rules +
          `${this.projectId}` +
          '/' +
          `${'silver_layer'}`,
      ]);
    } else if (this.layer_name === 'silver_layer') {
      this.router.navigate([
        navigationRoutes.rules + `${this.projectId}` + '/' + `${'gold_layer'}`,
      ]);
    }
  }
  ngOnInit(): void {
    this.selectedProjectId = this.route.snapshot.params[commonConst.params_id];
    this.projectId = sessionStorage.getItem('project_id');
    this.projectName = sessionStorage.getItem('project_name');
    this.appObservable.setProjectId$(this.selectedProjectId);
    this.dynamicQueries();
    this.highlightRoute = this.highlightService.getQueryBuilderRoute();

    this.selectedData = {
      firstAttribute: '',
      firstTable: '',
      join_con: '',
      secAttribute: '',
      secTable: '',
    };
    this.dynamicSelectedData.push(this.selectedData);
    this.attributes = { firstTable: '', secTable: '' };
    this.dynamicSelectedAttributes.push(this.attributes);

    this.url = history.state.url;
    if (this.layer_name === 'bronze_layer') {
      this.route.queryParams.subscribe((params) => {
        const isEmpty = Object.keys(params).length === 0;
        if (!isEmpty) {
          this.activeQueryEdit = params['query'];
          const job_id = params['job_id'];
          if (this.activeQueryEdit === 'edit') {
            this.editQueryData(job_id).subscribe((res: any) => {
              const queryJson = res[0].job_json;
              this.editSelectColumns = queryJson.columns;
              this.editCaseStatement = queryJson.caseConditions;
              this.edit_end_as_con = queryJson.endAsCondition;
              this.edit_else_con = queryJson.elseCondition;
              this.editAggregate = queryJson.aggregateConditions;
              this.editOrderBy = queryJson.orderByConditions;
              this.editJoins = queryJson.joinConditions;
              this.editFilter = queryJson.filterConditions;
              this.editGroupBy = queryJson.groupByConditions;
              this.editHaving = queryJson.havingConditions;
              this.editDerivedCol = queryJson.derivedColConditions;
              this.editSelectedTables = queryJson.selectedTables;
              this.editAppliedChecks = queryJson.checks;
              this.editScheduledFrequency = res.sync_type;

              if (queryJson.derivedCols) {
                queryJson.derivedCols.forEach((column) => {
                  if (!this.selectedTablesFields.includes(column)) {
                    this.selectedTablesFields.push(column);
                    this.generatedColumns.push(column);
                  }
                });
              }
              if (res.agg_col) {
                res.agg_col.forEach((column) => {
                  if (!this.selectedTablesFields.includes(column)) {
                    this.selectedTablesFields.push(column);
                  }
                  if (!this.columnsOfSelectedTables.includes(column)) {
                    this.columnsOfSelectedTables.push(column);
                  }
                });
              }
              if (queryJson.case_cols) {
                queryJson.case_cols.forEach((column) => {
                  if (
                    !this.selectedTablesFields.includes(column) &&
                    column != ''
                  ) {
                    this.selectedTablesFields.push(column);
                    this.generatedColumns.push(column);
                  }
                });
              }
              this.layerName = 'Refined Datasets';
              this.getTables(this.projectId, 'bronze_layer');
            });
          }
        } else {
          this.layerName = 'Refined Datasets';
          this.getTables(this.projectId, 'bronze_layer');
        }
      });
    } else if (this.layer_name === 'silver_layer') {
      this.route.queryParams.subscribe((params) => {
        const isEmpty = Object.keys(params).length === 0;
        if (!isEmpty) {
          this.activeQueryEdit = params['query'];
          const job_id = params['job_id'];
          if (this.activeQueryEdit === 'edit') {
            this.editQueryData(job_id).subscribe((res: any) => {
              const queryJson = res[0].job_json;
              this.editSelectColumns = queryJson.columns;
              this.editCaseStatement = queryJson.caseConditions;
              this.edit_end_as_con = queryJson.endAsCondition;
              this.edit_else_con = queryJson.elseCondition;
              this.editAggregate = queryJson.aggregateConditions;
              this.editOrderBy = queryJson.orderByConditions;
              this.editJoins = queryJson.joinConditions;
              this.editFilter = queryJson.filterConditions;
              this.editGroupBy = queryJson.groupByConditions;
              this.editHaving = queryJson.havingConditions;
              this.editDerivedCol = queryJson.derivedColConditions;
              this.editSelectedTables = queryJson.selectedTables;
              this.editAppliedChecks = queryJson.checks;
              if (queryJson.derivedCols) {
                queryJson.derivedCols.forEach((column) => {
                  if (!this.selectedTablesFields.includes(column)) {
                    this.selectedTablesFields.push(column);
                    this.generatedColumns.push(column);
                  }
                });
              }
              if (res.agg_col) {
                res.agg_col.forEach((column) => {
                  if (!this.selectedTablesFields.includes(column)) {
                    this.selectedTablesFields.push(column);
                  }
                  if (!this.columnsOfSelectedTables.includes(column)) {
                    this.columnsOfSelectedTables.push(column);
                  }
                });
              }
              if (queryJson.case_cols) {
                queryJson.case_cols.forEach((column) => {
                  if (
                    !this.selectedTablesFields.includes(column) &&
                    column != ''
                  ) {
                    this.selectedTablesFields.push(column);
                    this.generatedColumns.push(column);
                  }
                });
              }

              this.layerName = 'Report Datasets';
              this.getTables(this.projectId, 'silver_layer');
              console.log(queryJson.groupByConditions);

              console.log(this.editGroupBy);
            });
          }
        } else {
          this.layerName = 'Report Datasets';
          this.getTables(this.projectId, 'silver_layer');
        }
      });
    }
    if (this.url === 'rules/' + this.selectedProjectId) {
      this.rule = history.state.rule;
      this.hideQueryBuilder = false;
      this.hideTextDiv = true;
      this.editQueryBuilder = this.rule;
      this.getSilverLayerTableNames();
      this.previousTableNames.push(this.editQueryBuilder.rules_data.table_name);
      this.getFields(this.editQueryBuilder.rules_data.table_name);
      this.caseStatementQuery = this.editQueryBuilder.rules_data.case_statment;
      this.customQuery = this.editQueryBuilder.rules_data.custom_query;
      this.filterQuery = this.editQueryBuilder.rules_data.filter_statment;
      this.groupByQuery = this.editQueryBuilder.rules_data.group_by;
      this.orderByQuery = this.editQueryBuilder.rules_data.order_by;
    } else {
    }
    window.onbeforeunload = (e) => {
      if (this.unsavedChangesExist()) {
        const confirmationMessage =
          'You have unsaved changes. Are you sure you want to leave this page?';
        (e || window.event).returnValue = confirmationMessage;
        return confirmationMessage;
      }
    };
  }

  async onBronzeTableSelect(event: any) {
    this.appliedChecksService['appliedChecks'] = {};
    this.unsavedChanges = true;
    let tableName;
    let tableNameChecked;

    if (this.activeQueryEdit === 'edit') {
      if (this.activeEditPreviewSqlQuery) {
        tableName = event.target.value;
        tableNameChecked = event.target.checked;
      } else {
        tableName = event;
        tableNameChecked = true;
      }
    } else {
      tableName = event.target.value;
      tableNameChecked = event.target.checked;
    }

    if (tableNameChecked) {
      this.isCheckboxDisabled = true;

      if (this.selectedTableNames.includes(tableName)) {
        return this.selectedTableNames;
      } else if (this.layer_name === 'bronze_layer') {
        this.selectedTableNames.push('BRONZE_LAYER.' + tableName);
      } else if (this.layer_name === 'silver_layer') {
        this.selectedTableNames.push('SILVER_LAYER.' + tableName);
      }
      let columns = [];
      this.selectedTabledata = tableName;
      this.selectedTabledata = [];
      if (this.checkedTableNames.includes(tableName)) {
        return this.checkedTableNames;
      } else {
        this.checkedTableNames.push(tableName);
        if (this.checkedTableNames.length >= 1) {
          this.saveQueryBtnDisable = false;
          this.hideQueryBuilder = false;
          this.hideTextDiv = true;
          this.selectedTableColumns = {};
          this.initialColumnsFetched = {};
          for (let i = 0; i < this.checkedTableNames.length; i++) {
            this.selectedTableColumns[this.checkedTableNames[i]] = [];
            this.initialColumnsFetched[this.checkedTableNames[i]] = [];
          }

          try {
            const res = await lastValueFrom(
              this.httpClient.get(
                env.ip +
                  apiPaths.api.root +
                  apiPaths.api.getBronzeLayerTableColumns +
                  `${tableName}` +
                  '&project_id=' +
                  `${this.projectId}` +
                  '&layer_name=' +
                  `${this.layer_name}`
              )
            );

            this.isCheckboxDisabled = false;
            this.bronzeLayerSelectedTableColumns = res;
            for (
              let i = 0;
              i < this.bronzeLayerSelectedTableColumns.length;
              i++
            ) {
              this.selectedTabledata.push(
                this.bronzeLayerSelectedTableColumns[i][0]
              );
              this.selectedTablesFields.push(
                tableName + '.' + this.bronzeLayerSelectedTableColumns[i][0]
              );
              this.columnsOfSelectedTables.push(
                this.bronzeLayerSelectedTableColumns[i][0]
              );
            }
            this.hashIDs = this.selectedTablesFields.filter((item) =>
              item?.endsWith('SPOTLIGHT_HASHID')
            );
            this.selectedTablesFields = this.selectedTablesFields.filter(
              (item) => !item?.endsWith('SPOTLIGHT_HASHID')
            );

            this.columnsOfSelectedTables = this.columnsOfSelectedTables.filter(
              (item) => !item?.endsWith('SPOTLIGHT_HASHID')
            );

            columns = this.selectedTabledata;
            this.tablesChecked.push({ tableName, columns });
            this.tablesChecked?.filter((item) => {
              this.selectedTableColumns[item.tableName] = item.columns;
              this.initialColumnsFetched[item.tableName] = item.columns;
            });
            if (this.checkedTableNames.length === 1) {
              if (this.activeQueryEdit === 'edit') {
                if (this.activeEditPreviewSqlQuery) {
                  this.previewSQLQueryData();
                }
              } else {
                this.previewSQLQueryData();
              }
            }
            if (this.checkedTableNames.length > 1) {
              if (this.activeQueryEdit !== 'edit') {
                this.selectedQueryOption = 'Joins';
                if (this.auditOffcanvas) {
                  const offcanvas = new bootstrap.Offcanvas(
                    this.auditOffcanvas.nativeElement
                  );
                  offcanvas.show();
                }
              }
            }
            if (this.activeQueryEdit === 'edit') {
              if (
                this.checkedTableNames.length === this.pastArrayTableName.length
              ) {
                this.selectedTableColumns = this.editSelectColumns;
                this.dynamicCaseQueryArray = this.editCaseStatement;
                (this.end_as_con = this.edit_end_as_con),
                  (this.else_con = this.edit_else_con);
                this.executeCase();
                this.dynamicAggregateArray = this.editAggregate;
                this.executeAggregate();
                this.dynamicHavingArray = this.editHaving;
                this.executeHavingCondition();
                this.dynamicQueryArray = this.editFilter;
                this.executeFilterCondition();
                this.dynamicGroupByArray = this.editGroupBy;
                this.executeGroupCol();
                this.dynamicOrderByArray = this.editOrderBy;
                this.executeOrder();
                this.dynamicDerivedColArray = this.editDerivedCol;
                this.executeDerivedCol();
                if (this.editSelectedTables.length > 1) {
                  this.dynamicJoinsArray = this.editJoins;
                  this.dynamicSelectedData = [];
                  this.dynamicSelectedAttributes = [];
                  for (let i = 0; i < this.dynamicJoinsArray.length; i++) {
                    this.selectedData = {
                      firstAttribute: '',
                      firstTable: '',
                      join_con: '',
                      secAttribute: '',
                      secTable: '',
                    };
                    this.dynamicSelectedData.push(this.selectedData);
                    this.attributes = { firstTable: '', secTable: '' };
                    this.dynamicSelectedAttributes.push(this.attributes);

                    this.onSelectTableName(
                      i,
                      this.dynamicJoinsArray[i]?.firstTable,
                      'firstTable'
                    );
                    this.onSelectTableName(
                      i,
                      this.dynamicJoinsArray[i]?.secTable,
                      'secTable'
                    );
                  }
                  this.executeJoin();
                }
                this.appliedChecksService.checkEdit(this.editAppliedChecks);
                this.activeEditPreviewSqlQuery = true;
                this.previewSQLQueryData();
              }
            }
          } catch (error) {
            console.error('API Error:', error);
          }
          if (this.checkedTableNames.length > 1) {
            this.activeTab = 'joins';
            this.hideJoinsTab = false;
            this.hideGroupByTab = true;
          }
        }
      }
    } else {
      this.clearAllQueries();
      this.appliedChecksService['appliedChecks'] = {};

      let table_name = event.target.value;
      this.selectedTableNames = this.selectedTableNames.filter((item) => {
        let tableName = item.split('.')[1];
        if (tableName != table_name) {
          return item;
        }
      });

      if (this.selectedTableNames.includes(table_name)) {
        return this.selectedTableNames;
      }

      this.dynamicJoinsArray = this.dynamicJoinsArray.filter(
        (item) =>
          !(item.firstTable == table_name || item.secTable == table_name)
      );

      if (this.dynamicJoinsArray.length === 0) {
        this.joinsParams = {
          firstTable: '',
          firstAttribute: '',
          join_con: '',
          secTable: '',
          secAttribute: '',
          conditions: [],
        };
        this.dynamicJoinsArray.push(this.joinsParams);
      }

      this.selectedTablesFields = this.selectedTablesFields.filter((item) => {
        let tableName = item.split('.')[0];
        if (tableName != table_name) {
          return item;
        }
      });

      this.checkedTableNames = this.checkedTableNames.filter((item) => {
        return item !== table_name;
      });

      this.selectedTableColumns = {};
      this.initialColumnsFetched = {};
      for (let i = 0; i < this.checkedTableNames.length; i++) {
        this.selectedTableColumns[this.checkedTableNames[i]] = [];
        this.initialColumnsFetched[this.checkedTableNames[i]] = [];
      }

      let columns = [];
      this.tablesChecked.forEach((element) => {
        if (element.tableName === table_name) {
          return (columns = element.columns);
        }
      });

      this.dynamicSelectedAttributes = [];
      this.dynamicSelectedAttributes.push(this.attributes);
      // this.dynamicSelectedAttributes.filter(
      //   (item) => !(item.firstTable == columns || item.secTable == columns)
      // );

      this.tablesChecked = this.tablesChecked.filter((item) => {
        return item.tableName !== table_name;
      });

      this.tablesChecked?.filter((item) => {
        this.selectedTableColumns[item.tableName] = item.columns;
        this.initialColumnsFetched[item.tableName] = item.columns;
      });

      if (this.checkedTableNames.length == 1) {
        this.hideTextDiv = false;
        this.joinsQuery = '';
        this.hideQueryBuilder = false;
        this.hideTextDiv = true;
        this.hideGroupByTab = false;
        this.hideJoinsTab = true;
        this.activeTab = 'case';
        this.previewSQLQueryData();
      } else if (this.checkedTableNames.length == 0) {
        this.saveQueryBtnDisable = true;
        this.hideQueryBuilder = true;
        this.hideTextDiv = false;
      }

      this.dynamicSelectedData = [];
      this.dynamicSelectedData.push(this.selectedData);

      if (this.tablesChecked.length == 1) {
        return;
      } else if (this.tablesChecked.length == 0) {
        this.hideQueryBuilder = true;
        this.hideTextDiv = false;
        this.silverLayerTablePreviewData = false;
      }
    }
  }

  filterTables() {
    this.filteredBronzeLayerTables = this.bronzeLayerTables.filter((table) =>
      table.toLowerCase().includes(this.tableSearch.toLowerCase())
    );
  }
  onSilverTableSelect(tableName: any) {
    if (this.checkedTableNames.includes(tableName)) {
      return this.checkedTableNames;
    } else {
      this.checkedTableNames.push(tableName);
      if (this.checkedTableNames.length >= 1) {
        this.hideQueryBuilder = false;
        this.hideTextDiv = true;
        this.selectedTableColumns = {};
        for (let i = 0; i < this.checkedTableNames.length; i++) {
          this.selectedTableColumns[this.checkedTableNames[i]] = [];
        }
        this.getFields(tableName);
        if (this.checkedTableNames.length > 1) {
          this.activeTab = 'joins';
          this.hideJoinsTab = false;
          this.hideGroupByTab = true;
        }
      }
    }
  }

  // onTableDeSelect(table: any) {
  //   this.selectedTableNames = this.selectedTableNames.filter((item) => {
  //     let tableName = item.split('.')[1];
  //     if (tableName != table) {
  //       return item;
  //     }
  //   });

  //   if (this.selectedTableNames.includes(table)) {
  //     return this.selectedTableNames;
  //   }

  //   this.dynamicJoinsArray = this.dynamicJoinsArray.filter(
  //     (item) => !(item.firstTable == table || item.secTable == table)
  //   );

  //   if (this.dynamicJoinsArray.length === 0) {
  //     this.joinsParams = {
  //       firstTable: '',
  //       firstAttribute: '',
  //       join_con: '',
  //       secTable: '',
  //       secAttribute: '',
  //       conditions: [],
  //     };
  //     this.dynamicJoinsArray.push(this.joinsParams);
  //   }

  //   this.checkedTableNames = this.checkedTableNames.filter((item) => {
  //     return item !== table;
  //   });

  //   if (this.checkedTableNames.length == 1) {
  //     this.joinsQuery = '';
  //     this.hideQueryBuilder = false;
  //     this.hideTextDiv = true;
  //     this.hideGroupByTab = false;
  //     this.hideJoinsTab = true;
  //     this.activeTab = 'case';
  //   } else if (this.checkedTableNames.length == 0) {
  //     this.hideQueryBuilder = true;
  //     this.hideTextDiv = false;
  //   }

  //   this.selectedTablesFields = this.selectedTablesFields.filter((item) => {
  //     let tableName = item.split('.')[0];
  //     if (tableName != table) {
  //       return item;
  //     }
  //   });

  //   this.selectedTableColumns = {};
  //   for (let i = 0; i < this.checkedTableNames.length; i++) {
  //     this.selectedTableColumns[this.checkedTableNames[i]] = [];
  //   }

  //   let columns = [];
  //   this.tablesChecked.forEach((element) => {
  //     if (element.tableName === table) {
  //       return (columns = element.columns);
  //     }
  //   });

  //   this.dynamicSelectedAttributes = this.dynamicSelectedAttributes.filter(
  //     (item) => !(item.firstTable == columns || item.secTable == columns)
  //   );

  //   this.tablesChecked = this.tablesChecked.filter((item) => {
  //     return item.tableName !== table;
  //   });

  //   this.tablesChecked?.filter((item) => {
  //     this.selectedTableColumns[item.tableName] = item.columns;
  //   });

  //   this.dynamicSelectedData = this.dynamicSelectedData.filter(
  //     (item) => !(item.firstTable == table || item.secTable == table)
  //   );

  //   if (this.tablesChecked.length == 1) {
  //     return;
  //   } else if (this.tablesChecked.length == 0) {
  //     this.hideQueryBuilder = true;
  //     this.hideTextDiv = false;
  //   }
  // }

  // onChange(e: any) {
  //   if (
  //     this.selectedBronzeTables.length >= 1 ||
  //     this.selectedSilverTables.length >= 1
  //   ) {
  //     this.hideQueryBuilder = false;
  //     this.hideTextDiv = true;
  //     this.getFields(e);
  //     if (this.checkedTableNames.length > 1) {
  //       this.activeTab = 'joins';
  //     }
  //   }
  // }

  // onChangeSearch(item) {
  //   console.log(item)
  //   var operators = /[+\-*/]/g;
  //   var resultString = item.replace(operators, ' ');
  //   console.log(resultString)
  //   if (this.columnsOfSelectedTables.includes(resultString)) {
  //     this.isColumnSelected = true;
  //   } else {
  //     this.isColumnSelected = false;
  //   }
  // }

  //Aggregate
  executeAggregate() {
    this.customQuery = '';
    this.aggregateQuery = '';
    if (
      this.dynamicAggregateArray[0].agg_col == '' &&
      this.dynamicAggregateArray[0].agg_function == ''
    ) {
      return;
    }

    this.dynamicAggregateArray.forEach((query: any, index: number) => {
      let column = this.generatedColumns.includes(query.agg_col)
        ? query.agg_col
        : query.agg_col.split('.')[1];
      let operation = query.agg_function.split(' ').join('_');
      let columnName = column + '_' + operation;
      let temp_data =
        index === 0
          ? '<b>' +
            query.agg_function +
            '</b>' +
            `(${column == null ? query.agg_col : column}) <b>AS</b> ${
              column == null ? query.agg_col : column
            }_${operation} `
          : ', ' +
            '<b>' +
            query.agg_function +
            '</b>' +
            `(${column}) <b>AS</b> ${column}_${operation} `;
      this.aggregateQuery = this.aggregateQuery + temp_data;

      // this.executeGroupCol();

      if (this.havingColumns.includes(columnName)) {
        return this.havingColumns;
      } else {
        this.havingColumns.push(columnName);
      }

      this.generatedColumns.includes(columnName)
        ? this.generatedColumns
        : this.generatedColumns.push(columnName);
    });
    if (this.activeQueryEdit === 'edit') {
      if (this.activeEditPreviewSqlQuery) {
        this.previewSQLQueryData();
      }
    } else {
      this.previewSQLQueryData();
    }
  }

  addAggregate() {
    this.aggregateParams = {
      agg_col: '',
      agg_function: '',
    };
    this.dynamicAggregateArray.push(this.aggregateParams);
  }

  deleteAggregate(index) {
    this.generatedColumns.splice(index, 1);
    if (this.dynamicAggregateArray.length == 1) {
      this.dynamicAggregateArray[0].agg_col = '';
      this.dynamicAggregateArray[0].agg_function = '';
      this.aggregateQuery = '';
      // this.tablesChecked?.filter((item) => {
      //   this.selectedTableColumns[item.tableName] = item.columns;
      // });
      this.previewSQLQueryData();
      return false;
    } else {
      this.dynamicAggregateArray.splice(index, 1);
      this.executeAggregate();
      return true;
    }
  }

  // Having
  addHavingRow() {
    this.havingParams = { field: '', operator: '', value: '' };
    this.dynamicHavingArray.push(this.havingParams);
  }

  deleteHavingRow(index: any) {
    if (this.dynamicHavingArray.length == 1) {
      this.dynamicHavingArray[0].field = '';
      this.dynamicHavingArray[0].operator = '';
      this.dynamicHavingArray[0].value = '';
      this.havingQuery = '';
      this.previewSQLQueryData();
      return false;
    } else {
      this.dynamicHavingArray.splice(index, 1);
      this.executeHavingCondition();
      return true;
    }
  }

  executeHavingCondition() {
    this.havingQuery = '';
    if (
      this.dynamicHavingArray[0].field == '' &&
      this.dynamicHavingArray[0].operator == '' &&
      this.dynamicHavingArray[0].value == ''
    ) {
      return;
    }

    this.dynamicHavingArray.forEach((query: any, index: number) => {
      let values = query.value
        .split(',')
        .map((word) => `'${word.trim()}'`)
        .join(',');
      let value = query.operator === 'In' ? `(${values})` : `${query.value}`;
      let temp_data =
        index === 0
          ? '<b>HAVING</b>' +
            ' ' +
            (query.field === this.dynamicHavingArray[index + 1]?.field
              ? '('
              : '') +
            query.field +
            ' ' +
            '<b>' +
            query.operator +
            '</b>' +
            ' ' +
            this.getQuotes(value)
          : ' ' +
            '<b>' +
            this.dynamicHavingArray[index - 1].condition +
            '</b>' +
            ' ' +
            (query.field !== this.dynamicHavingArray[index - 1]?.field &&
            query.field === this.dynamicHavingArray[index + 1]?.field
              ? '('
              : '') +
            query.field +
            ' ' +
            '<b>' +
            query.operator +
            '</b>' +
            ' ' +
            this.getQuotes(value) +
            (query.field === this.dynamicHavingArray[index - 1]?.field &&
            query.field !== this.dynamicHavingArray[index + 1]?.field
              ? ')'
              : '');

      this.havingQuery = this.havingQuery + temp_data;
    });
    if (this.activeQueryEdit === 'edit') {
      if (this.activeEditPreviewSqlQuery) {
        this.previewSQLQueryData();
      }
    } else {
      this.previewSQLQueryData();
    }
  }

  //Filter
  addFilterRow() {
    this.queryParams = { field: '', operator: '', value: '', condition: '' };
    this.dynamicQueryArray.push(this.queryParams);
  }

  deleteFilterRow(index: any) {
    if (this.dynamicQueryArray.length == 1) {
      this.dynamicQueryArray[0].field = '';
      this.dynamicQueryArray[0].operator = '';
      this.dynamicQueryArray[0].value = '';
      this.filterQuery = '';
      this.previewSQLQueryData();
      return false;
    } else {
      this.dynamicQueryArray.splice(index, 1);
      this.executeFilterCondition();
      return true;
    }
  }

  executeFilterCondition() {
    this.customQuery = '';
    this.filterQuery = '';
    if (
      this.dynamicQueryArray[0].field == '' &&
      this.dynamicQueryArray[0].operator == '' &&
      this.dynamicQueryArray[0].value == ''
    ) {
      return;
    }

    this.dynamicQueryArray.forEach((query: any, index: number) => {
      let values = query.value
        .split(',')
        .map((word) => `'${word.trim()}'`)
        .join(',');
      let value = query.operator === 'In' ? `(${values})` : `${query.value}`;
      let temp_data =
        index === 0
          ? '<b>WHERE</b>' +
            ' ' +
            (query.field === this.dynamicQueryArray[index + 1]?.field
              ? '('
              : '') +
            query.field +
            ' ' +
            '<b>' +
            query.operator +
            '</b>' +
            ' ' +
            this.getQuotes(value)
          : ' ' +
            '<b>' +
            this.dynamicQueryArray[index - 1].condition +
            '</b>' +
            ' ' +
            (query.field !== this.dynamicQueryArray[index - 1]?.field &&
            query.field === this.dynamicQueryArray[index + 1]?.field
              ? '('
              : '') +
            query.field +
            ' ' +
            '<b>' +
            query.operator +
            '</b>' +
            ' ' +
            this.getQuotes(value) +
            (query.field === this.dynamicQueryArray[index - 1]?.field &&
            query.field !== this.dynamicQueryArray[index + 1]?.field
              ? ')'
              : '');

      this.filterQuery = this.filterQuery + temp_data;
    });
    if (this.activeQueryEdit === 'edit') {
      if (this.activeEditPreviewSqlQuery) {
        this.previewSQLQueryData();
      }
    } else {
      this.previewSQLQueryData();
    }
  }

  //Case Statement
  addCaseQuery() {
    this.caseQueryParams = {
      case_conditions: [
        {
          case_field: '',
          case_operator: '',
          case_value: '',
          then_con: '',
        },
      ],
      else_con: '',
      end_as_con: '',
    };
    this.dynamicCaseQueryArray.push(this.caseQueryParams);
  }

  addCase(index) {
    this.caseParams = {
      case_field: '',
      case_operator: '',
      case_value: '',
      then_con: '',
    };
    this.dynamicCaseQueryArray[index].case_conditions.push(this.caseParams);
  }

  deleteCase(index: any, j) {
    if (this.dynamicCaseQueryArray[index].case_conditions.length == 1) {
      this.dynamicCaseQueryArray[index].case_conditions[0].then_con = '';
      this.dynamicCaseQueryArray[index].case_conditions[0].case_value = '';
      this.dynamicCaseQueryArray[index].case_conditions[0].case_operator = '';
      this.dynamicCaseQueryArray[index].case_conditions[0].case_field = '';
      this.dynamicCaseQueryArray[index].else_con = '';
      this.dynamicCaseQueryArray[index].end_as_con = '';
      this.caseStatementQuery = '';
      this.previewSQLQueryData();
      return false;
    } else {
      this.dynamicCaseQueryArray[index].case_conditions.splice(j, 1);
      // this.dynamicSelectedDataForSubCon.splice(j, 1);
      // this.dynamicSelectedAttributesForSubCon.splice(j, 1);
      // this.previewSQLQueryData();
      this.executeCase();
      return true;
    }
  }

  deleteCaseQuery(index) {
    if (this.dynamicCaseQueryArray.length == 1) {
      this.dynamicCaseQueryArray[index].case_conditions = [
        {
          case_field: '',
          case_operator: '',
          case_value: '',
          then_con: '',
        },
      ];
      this.dynamicCaseQueryArray[index].else_con = '';
      this.dynamicCaseQueryArray[index].end_as_con = '';
      this.caseStatementQuery = '';
      this.previewSQLQueryData();
      return false;
    } else {
      this.dynamicCaseQueryArray.splice(index, 1);
      this.executeCase();
      return true;
    }
  }

  executeCase() {
    this.customQuery = '';
    this.caseStatementQuery = '';
    this.savedfinalcasequery = '';
    if (
      this.dynamicCaseQueryArray[0]?.case_conditions[0].then_con == '' &&
      this.dynamicCaseQueryArray[0]?.case_conditions[0].case_value == '' &&
      this.dynamicCaseQueryArray[0]?.case_conditions[0].case_operator == '' &&
      this.dynamicCaseQueryArray[0]?.case_conditions[0].case_field == ''
    ) {
      return;
    }

    this.dynamicCaseQueryArray.forEach((query: any, index: number) => {
      this.savedfinalcasequery = '';
      query.case_conditions.forEach((caseCon: any) => {
        let column = this.generatedColumns.includes(caseCon.case_field)
          ? caseCon.case_field
          : caseCon.case_field.split('.')[1];
        let temp_data =
          '<b>WHEN</b>' +
          ' ' +
          column +
          ' ' +
          '<b>' +
          caseCon.case_operator +
          '</b>' +
          ' ' +
          this.getQuotes(caseCon.case_value) +
          ' ' +
          '<b>THEN</b>' +
          ' ' +
          this.getQuotes(caseCon.then_con) +
          ' ';
        this.savedfinalcasequery = this.savedfinalcasequery + temp_data;
      });

      let caseStatement =
        index === 0
          ? query.else_con === ''
            ? '<b>CASE</b>' +
              ' ' +
              this.savedfinalcasequery +
              ' ' +
              ' ' +
              '<b>END AS</b>' +
              ' ' +
              `${query.end_as_con}`
            : '<b>CASE</b>' +
              ' ' +
              this.savedfinalcasequery +
              ' ' +
              '<b>ELSE</b>' +
              ' ' +
              this.getQuotes(query.else_con) +
              ' ' +
              '<b>END AS</b>' +
              ' ' +
              `${query.end_as_con}`
          : query.else_con === ''
          ? ', <b>CASE</b>' +
            ' ' +
            this.savedfinalcasequery +
            ' ' +
            ' ' +
            '<b>END AS</b>' +
            ' ' +
            `${query.end_as_con} `
          : ', <b>CASE</b>' +
            ' ' +
            this.savedfinalcasequery +
            ' ' +
            '<b>ELSE</b>' +
            ' ' +
            this.getQuotes(query.else_con) +
            ' ' +
            '<b>END AS</b>' +
            ' ' +
            `${query.end_as_con} `;

      this.caseStatementQuery = this.caseStatementQuery + caseStatement;
      this.generatedColumns.push(query.end_as_con);
    });

    if (this.activeQueryEdit === 'edit') {
      if (this.activeEditPreviewSqlQuery) {
        this.previewSQLQueryData();
      }
    } else {
      this.previewSQLQueryData();
    }

    console.log(this.caseStatementQuery);
  }

  getQuotes(column: any) {
    var regex = /[+\-*/0-9.]/g;
    var resultString = column.replace(regex, '');
    if (this.columnsOfSelectedTables.includes(resultString || resultString)) {
      return column;
    } else {
      return `'${column}'`;
    }
  }

  openModal(data: any) {
    const modalRef = this.modalService.open(QueryBuilderDataPreviewComponent, {
      size: commonConst.modal_size_xl,
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.data = data;
    // modalRef.componentInstance.data = url;
  }

  back(): void {
    this.router.navigate([
      navigationRoutes.workBench + `${this.selectedProjectId}`,
    ]);
  }

  //Order By
  addOrder() {
    this.orderbyParams = { orderby_col: '', orderby_operator: '' };
    this.dynamicOrderByArray.push(this.orderbyParams);
  }

  executeOrder() {
    this.customQuery = '';
    this.orderByQuery = '';
    if (
      this.dynamicOrderByArray[0].orderby_col == '' &&
      this.dynamicOrderByArray[0].orderby_operator == ''
    ) {
      return;
    }

    this.dynamicOrderByArray.forEach((query: any, index: number) => {
      let temp_data =
        index === 0
          ? '<b>ORDER BY</b>' +
            ' ' +
            query.orderby_col +
            ' ' +
            query.orderby_operator +
            ' '
          : ', ' + query.orderby_col + ' ' + query.orderby_operator;

      this.orderByQuery = this.orderByQuery + temp_data;
    });
    if (this.activeQueryEdit === 'edit') {
      if (this.activeEditPreviewSqlQuery) {
        this.previewSQLQueryData();
      }
    } else {
      this.previewSQLQueryData();
    }
  }

  deleteOrder(index: any) {
    if (this.dynamicOrderByArray.length == 1) {
      this.dynamicOrderByArray[0].orderby_col = '';
      this.dynamicOrderByArray[0].orderby_operator = '';
      this.orderByQuery = '';
      this.previewSQLQueryData();
      return false;
    } else {
      this.dynamicOrderByArray.splice(index, 1);
      this.executeOrder();
      return true;
    }
  }

  //Group By
  addGroupCol() {
    this.groupbyParams = { groupby_col: '' };
    this.dynamicGroupByArray.push(this.groupbyParams);
  }

  executeGroupCol() {
    this.customQuery = '';
    this.selectedGroupByColumns = [];
    this.groupByQuery = '';

    if (this.dynamicGroupByArray[0].groupby_col == '') {
      return;
    }

    this.dynamicGroupByArray.forEach((query: any, index: number) => {
      let column = this.generatedColumns.includes(query.groupby_col)
        ? query.groupby_col
        : query.groupby_col.split('.')[1];
      let temp_data =
        index === 0 ? '<b>GROUP BY</b> ' + column + ' ' : ', ' + column;
      this.groupByQuery = this.groupByQuery + temp_data;

      if (this.selectedGroupByColumns.includes(column)) {
        return this.selectedGroupByColumns;
      } else {
        this.selectedGroupByColumns.push(column);
      }
    });
    if (this.activeQueryEdit === 'edit') {
      if (this.activeEditPreviewSqlQuery) {
        this.previewSQLQueryData();
      }
    } else {
      this.previewSQLQueryData();
    }
  }

  deleteGroupCol(index: any) {
    if (this.dynamicGroupByArray.length == 1) {
      this.dynamicGroupByArray[0].groupby_col = '';
      this.groupByQuery = '';
      // this.tablesChecked?.filter((item) => {
      //   this.selectedTableColumns[item.tableName] = item.columns;
      // });
      this.previewSQLQueryData();
      return false;
    } else {
      this.dynamicGroupByArray.splice(index, 1);
      this.executeGroupCol();
      return true;
    }
  }

  //Derived Query

  addDerivedCol() {
    this.derivedColParams = { operation: '', derived_col: '' };
    this.dynamicDerivedColArray.push(this.derivedColParams);
  }

  executeDerivedCol() {
    this.customQuery = '';
    this.derivedQuery = '';
    this.derivedColumns = [];
    if (
      this.dynamicDerivedColArray[0].operation == '' &&
      this.dynamicDerivedColArray[0].derived_col == ''
    ) {
      return;
    }

    this.dynamicDerivedColArray.forEach((query: any, index: number) => {
      let temp_data =
        index === 0
          ? query.operation + ' as ' + query.derived_col
          : ', ' + query.operation + ' as ' + query.derived_col;

      this.derivedColumns.push(query.derived_col);
      console.log(this.derivedColumns);
      this.generatedColumns.push(query.derived_col);
      this.derivedQuery = this.derivedQuery + temp_data;
    });
    if (this.activeQueryEdit === 'edit') {
      if (this.activeEditPreviewSqlQuery) {
        this.previewSQLQueryData();
      }
    } else {
      this.previewSQLQueryData();
    }
  }

  deleteDerivedCol(index) {
    if (this.dynamicDerivedColArray.length == 1) {
      this.dynamicDerivedColArray[0].operation = '';
      this.dynamicDerivedColArray[0].derived_col = '';
      this.derivedQuery = '';
      // this.tablesChecked?.filter((item) => {
      //   this.selectedTableColumns[item.tableName] = item.columns;
      // });
      this.previewSQLQueryData();
      return false;
    } else {
      this.dynamicDerivedColArray.splice(index, 1);
      return true;
    }
  }

  //custom Query
  // addCustomCol() {
  //   this.customQueryParams = { custom_query: '' };
  //   this.dynamicCustomQueryArray.push(this.customQueryParams);
  // }

  executeCustomQuery() {
    if (this.dynamicCustomQueryArray[0].custom_query == '') {
      return;
    } else {
      this.customQuery = this.editableQuery;
    }

    this.previewSQLQueryData();
  }

  deleteCustomCol(index: any) {
    if (this.dynamicCustomQueryArray.length == 1) {
      this.dynamicCustomQueryArray[0].custom_query = '';
      this.customQuery = '';
      this.previewSQLQueryData();
      return false;
    }
    // else {
    //   this.dynamicCustomQueryArray.splice(index, 1);
    //   this.previewSQLQueryData();
    //   return true;
    // }
  }

  //Case Statement
  addJoin() {
    this.joinsParams = {
      firstTable: '',
      firstAttribute: '',
      join_con: '',
      secTable: '',
      secAttribute: '',
      conditions: [],
    };
    this.dynamicJoinsArray.push(this.joinsParams);
    this.selectedData = {
      firstAttribute: '',
      firstTable: '',
      join_con: '',
      secAttribute: '',
      secTable: '',
    };
    this.dynamicSelectedData.push(this.selectedData);
    this.attributes = { firstTable: '', secTable: '' };
    this.dynamicSelectedAttributes.push(this.attributes);
  }

  addCon(index: any) {
    let con = {
      operator: this.selectedDecision,
      firstTable: '',
      firstAttribute: '',
      secTable: '',
      secAttribute: '',
    };
    this.dynamicJoinsArray[index].conditions.push(con);
    this.selectedData = {
      firstAttribute: '',
      firstTable: '',
      join_con: '',
      secAttribute: '',
      secTable: '',
    };
    this.dynamicSelectedDataForSubCon.push(this.selectedData);
    this.attributes = { firstTable: '', secTable: '' };
    this.dynamicSelectedAttributesForSubCon.push(this.attributes);
  }

  deleteJoin(index: any) {
    if (this.dynamicJoinsArray.length == 1) {
      this.dynamicJoinsArray[0].firstTable = '';
      this.dynamicJoinsArray[0].firstAttribute = '';
      this.dynamicJoinsArray[0].join_con = '';
      this.dynamicJoinsArray[0].secTable = '';
      this.dynamicJoinsArray[0].secAttribute = '';
      this.joinsQuery = '';
      this.joinQueryForAPI = '';
      this.previewSQLQueryData();
      return false;
    } else {
      this.dynamicJoinsArray.splice(index, 1);
      this.dynamicSelectedData.splice(index, 1);
      this.dynamicSelectedAttributes.splice(index, 1);
      this.previewSQLQueryData();
      return true;
    }
  }

  deleteCondition(index: any, j: any) {
    this.dynamicJoinsArray[index].conditions.splice(j, 1);
    this.dynamicSelectedDataForSubCon.splice(j, 1);
    this.dynamicSelectedAttributesForSubCon.splice(j, 1);
    this.previewSQLQueryData();
  }

  executeJoin() {
    if (
      this.dynamicJoinsArray[0].firstTable == '' &&
      this.dynamicJoinsArray[0].firstAttribute == '' &&
      this.dynamicJoinsArray[0].join_con == '' &&
      this.dynamicJoinsArray[0].secTable == '' &&
      this.dynamicJoinsArray[0].secAttribute == ''
    ) {
      return;
    }

    if (this.layer_name === 'bronze_layer') {
      this.joiningLayerName = `${this.projectName}` + '.' + 'BRONZE_LAYER';
    } else if (this.layer_name === 'silver_layer') {
      this.joiningLayerName = `${this.projectName}` + '.' + 'SILVER_LAYER';
    }

    this.joinsQuery =
      '<b>FROM</b> ' +
      `${
        this.dynamicJoinsArray[0].firstTable != ''
          ? this.dynamicJoinsArray[0].firstTable
          : this.checkedTableNames[0]
      }` +
      ' ';
    this.joinQueryForAPI =
      '<b>FROM</b> ' +
      `${this.joiningLayerName}` +
      '.' +
      `${
        this.dynamicJoinsArray[0].firstTable != ''
          ? this.dynamicJoinsArray[0].firstTable
          : this.checkedTableNames[0]
      }` +
      ' ';
    this.dynamicJoinsArray.forEach((query: iJoinCondition, index: number) => {
      let conditionQuery = '';
      if (query.conditions.length > 0) {
        for (let i = 0; i < query.conditions.length; i++) {
          conditionQuery +=
            '<b>' +
            query.conditions[i].operator +
            '</b>' +
            ' ' +
            query.conditions[i].firstTable +
            '<b>.</b>' +
            query.conditions[i].firstAttribute +
            ' <b> = </b> ' +
            query.conditions[i].secTable +
            '<b>.</b>' +
            query.conditions[i].secAttribute +
            ' ';
        }
      }
      let temp_data =
        index === 0
          ? '<b>' +
            query?.join_con +
            '</b>' +
            ' ' +
            query?.secTable +
            '<b> ON </b>' +
            query?.firstTable +
            '<b>.</b>' +
            query?.firstAttribute +
            ' <b>=</b> ' +
            query?.secTable +
            '<b>.</b>' +
            query?.secAttribute +
            ' ' +
            conditionQuery
          : ' ' +
            '<b>' +
            query?.join_con +
            '</b>' +
            ' ' +
            this.getTableArrayBasedOnExistingSelection[2](index) +
            '<b> ON </b>' +
            this.getTableArrayBasedOnExistingSelection[3](index, true) +
            '<b>.</b>' +
            this.getAttributeForSelectedTable(index, true) +
            ' <b>=</b> ' +
            this.getTableArrayBasedOnExistingSelection[3](index, false) +
            '<b>.</b>' +
            this.getAttributeForSelectedTable(index, false) +
            ' ' +
            conditionQuery;
      let dataForAPI =
        index === 0
          ? '<b>' +
            query?.join_con +
            '</b>' +
            ' ' +
            `${this.joiningLayerName}` +
            '.' +
            query?.secTable +
            '<b> ON </b>' +
            query?.firstTable +
            '<b>.</b>' +
            query?.firstAttribute +
            ' <b>=</b> ' +
            query?.secTable +
            '<b>.</b>' +
            query?.secAttribute +
            ' ' +
            conditionQuery
          : ' ' +
            '<b>' +
            query?.join_con +
            '</b>' +
            ' ' +
            `${this.joiningLayerName}` +
            '.' +
            this.getTableArrayBasedOnExistingSelection[2](index) +
            '<b> ON </b>' +
            this.getTableArrayBasedOnExistingSelection[3](index, true) +
            '<b>.</b>' +
            this.getAttributeForSelectedTable(index, true) +
            ' <b>=</b> ' +
            this.getTableArrayBasedOnExistingSelection[3](index, false) +
            '<b>.</b>' +
            this.getAttributeForSelectedTable(index, false) +
            ' ' +
            conditionQuery;

      this.joinsQuery = this.joinsQuery + temp_data;
      this.joinQueryForAPI = this.joinQueryForAPI + dataForAPI;
    });
    if (this.activeQueryEdit === 'edit') {
      if (this.activeEditPreviewSqlQuery) {
        this.previewSQLQueryData();
      }
    } else {
      this.previewSQLQueryData();
    }
  }

  executeFilterColumns() {
    this.previewSQLQueryData();
  }

  onSelectTableName(index: any, event: any, attributeName: any) {
    let tableName = '';
    if (this.activeQueryEdit === 'edit') {
      if (this.activeEditPreviewSqlQuery) {
        tableName = event?.target?.value;
      } else {
        tableName = event;
      }
    } else {
      tableName = event?.target?.value;
    }

    this.dynamicSelectedData[index]['' + attributeName] =
      tableName === '--SELECT--' ? '' : tableName;
    this.dynamicSelectedAttributes[index]['' + attributeName] =
      attributeName.includes('Table')
        ? this.tablesChecked?.filter(
            (item) =>
              item?.tableName ===
              this.dynamicSelectedData[index]['' + attributeName]
          )[0]?.columns
        : '';

    this.dynamicSelectedAttributes[index][attributeName] =
      this.dynamicSelectedAttributes[index][attributeName].filter(
        (column) => !column?.endsWith('SPOTLIGHT_HASHID')
      );
  }

  onSelectTable(index: any, event: any, attributeName: any) {
    this.dynamicSelectedDataForSubCon[index]['' + attributeName] =
      event?.target?.value === '--SELECT--' ? '' : event?.target?.value;
    this.dynamicSelectedAttributesForSubCon[index]['' + attributeName] =
      attributeName.includes('Table')
        ? this.tablesChecked?.filter(
            (item) =>
              item?.tableName ===
              this.dynamicSelectedDataForSubCon[index]['' + attributeName]
          )[0]?.columns
        : '';

    this.dynamicSelectedAttributesForSubCon[index][attributeName] =
      this.dynamicSelectedAttributesForSubCon[index][attributeName].filter(
        (column) => !column?.endsWith('SPOTLIGHT_HASHID')
      );
  }

  displayColumnData(table: any) {
    this.columnsData = this.tablesChecked?.filter(
      (item) => item?.tableName === table
    )[0]?.columns;
    this.columnsData = this.columnsData.filter(
      (item) => !item?.endsWith('SPOTLIGHT_HASHID')
    );
    // this.selectedTableColumns[table] = this.columnsData;
    // this.rowsData = this.rowsData.filter((value, index, array) => array.indexOf(value) === index);
  }

  previewSQLQueryData() {
    this.resultant_records_count = null;
    this.error_queue_count = null;
    this.total_records_count = null;
    this.loading = true;
    this.errorContainer = false;
    this.silverLayerTablePreviewData = false;
    let keys = Object.keys(this.selectedTableColumns);
    let columns = [];
    let groupByColumns = [];
    for (let i = 0; i < keys.length; i++) {
      columns.push(
        this.selectedTableColumns[keys[i]]?.map((item: any) => {
          return (item = keys[i] + '.' + item);
        })
      );
    }
    let keysInitialColumns = Object.keys(this.initialColumnsFetched);
    let columnsInitialColumns = [];
    for (let i = 0; i < keys.length; i++) {
      columnsInitialColumns.push(
        this.initialColumnsFetched[keysInitialColumns[i]]?.map((item: any) => {
          return (item = keys[i] + '.' + item);
        })
      );
    }

    // this.checkedTableNames.forEach((item) =>
    //   columns.push(
    //     `${item}` + '.' + `${item}` + `${commonConst.spotlight_hash}`
    //   )
    // );

    // if (this.groupByQuery) {
    //   let groupByKeys = Object.keys(this.selectedGroupByColumns);
    //   for (let i = 0; i < groupByKeys.length; i++) {
    //     groupByColumns.push(this.selectedGroupByColumns[groupByKeys[i]]);
    //   }
    // }

    let flattenedArr = [].concat(...columns);
    let flattenedArrInitialColumns = [].concat(...columnsInitialColumns);
    let groupByColumnsString = [].concat(...this.selectedGroupByColumns);
    // let hashIDs = '';
    // this.checkedTableNames.forEach((item) => {
    //   return (hashIDs =
    //     hashIDs + ',' +
    //     `${item}` +
    //     '.' +
    //     `${item}` +
    //     `${commonConst.spotlight_hash}`);
    // });

    // if (this.groupByQuery != '' || this.aggregateQuery != '') {
    //   flattenedArr = flattenedArr.filter(
    //     (item) => !item?.endsWith('SPOTLIGHT_HASHID')
    //   );
    // }

    this.selectedColumnsNames = this.selectedTabledata
      .toString()
      .replace(/[\[\]']+/g, '');
    const reversedFilter = this.filterQuery.replace(/<[^>^<]*>/g, '');
    const reversedOpsFilter = this.reverseOperators(reversedFilter);
    const reversedKeywordsFilter = this.reverseKeywords(reversedOpsFilter);
    const reversedHaving = this.havingQuery.replace(/<[^>^<]*>/g, '');
    const reversedOpsHaving = this.reverseOperators(reversedHaving);
    const reversedKeywordsHaving = this.reverseKeywords(reversedOpsHaving);
    if (this.appliedChecksService.getSortColumn()) {
      this.sortColumnChecked = this.appliedChecksService.getSortColumn();
      if (this.sortColumnChecked['Sort Column'] === null) {
        this.sortColumnChecked['Sort Column'] = "";
      }
      if (this.sortColumnChecked['Sort Direction'] === null) {
        this.sortColumnChecked['Sort Direction'] = "";
      }
    } else {
      this.sortColumnChecked = {
        'Sort Column': "",
        'Sort Direction': "",
      };
    }
    const body = {
      custom_stmt: this.customQuery.replace(/<[^>^<]*>/g, ''),
      checks: this.appliedChecksService['appliedChecks'],
      reversedQuery: {
        reversedFilter: reversedKeywordsFilter,
        reversedHaving: reversedKeywordsHaving,
      },
      derived_col_stmt: this.derivedQuery,
      queryJson: {
        caseConditions: this.dynamicCaseQueryArray,
        aggregateConditions: this.dynamicAggregateArray,
        joinConditions: this.dynamicJoinsArray,
        filterConditions: this.dynamicQueryArray,
        orderByConditions: this.dynamicOrderByArray,
        groupByConditions: this.dynamicGroupByArray,
        havingConditions: this.dynamicHavingArray,
        derivedColConditions: this.dynamicDerivedColArray,
        selectedTables: this.checkedTableNames,
        columns: this.selectedTableColumns,
        columns_full_list: this.initialColumnsFetched,
        checks: this.appliedChecksService['appliedChecks'],
      },
      sortColumn: this.sortColumnChecked,
    };
    const url = (
      `${this.caseStatementQuery}` +
      '&aggr_stmt=' +
      `${this.aggregateQuery}` +
      '&join_stmt=' +
      `${this.joinQueryForAPI}` +
      '&filter_stmt=' +
      `${this.filterQuery}` +
      '&order_by_stmt=' +
      `${this.orderByQuery}` +
      '&group_by_stmt=' +
      `${this.groupByQuery}` +
      '&having_stmt=' +
      `${this.havingQuery}` +
      '&tbl_name=' +
      `${this.selectedTableNames}` +
      '&derived_columns=' +
      this.derivedColumns +
      '&groupby_col_list=' +
      `${groupByColumnsString}` +
      '&col_list=' +
      `${flattenedArr}` +
      '&col_full_list=' +
      `${flattenedArrInitialColumns}`
    ).replace(/<[^>^<]*>/g, '');
    this.httpClient
      .post(
        env.ip +
          apiPaths.api.root +
          apiPaths.api.dataQualityChecks +
          url +
          '&project_id=' +
          `${this.projectId}`,
        body
      )
      .pipe(
        catchError((Error) => {
          this.errorData = Error.error.error;
          this.loading = false;
          this.silverLayerTablePreviewData = false;
          this.errorContainer = true;
          this.buildQueryButtonDisplay = true;
          return Error;
        })
      )
      .subscribe((res: any) => {
        this.loading = false;
        this.silverLayerTablePreviewData = true;
        this.errorContainer = false;
        this.silverLayerTablePreviewData = res.data;
        this.schemaColumnData = res.schema;

        this.error_queue_data = res.error_queue;
        if (this.error_queue_data.length === 0) {
          this.isErrorQueueDisabled = true;
        } else {
          this.isErrorQueueDisabled = false;
        }
        if (res.data.length === 0) {
          this.selectedFilter = 'error';
          this.buildQueryButtonDisplay = false;
        } else {
          this.selectedFilter = 'correct';
          this.buildQueryButtonDisplay = true;
        }
        this.runTime = res.runtime;
        this.silverLayerTablePreviewQueryData = res.query;
        this.traceabilityInfo = res.traceability_query;
        this.groupByColumns = res.groupby_columns;
        this.resultant_records_count = res.resultant_records_count;
        this.error_queue_count = res.error_queue_count;
        this.total_records_count = res.total_records_count;

        this.selectedTablesFields = this.selectedTablesFields.filter((column) =>
          column.includes('.')
        );

        if (res.dervied_cols) {
          res.dervied_cols.forEach((column) => {
            if (!this.selectedTablesFields.includes(column)) {
              this.selectedTablesFields.push(column);
            }
            if (!this.columnsOfSelectedTables.includes(column)) {
              this.columnsOfSelectedTables.push(column);
            }
          });
        }
        if (res.agg_col) {
          res.agg_col.forEach((column) => {
            if (!this.selectedTablesFields.includes(column)) {
              this.selectedTablesFields.push(column);
            }
            if (!this.columnsOfSelectedTables.includes(column)) {
              this.columnsOfSelectedTables.push(column);
            }
          });
        }

        if (res.case_cols) {
          res.case_cols.forEach((column) => {
            if (!this.selectedTablesFields.includes(column) && column != '') {
              this.selectedTablesFields.push(column);
            }
            if (
              !this.columnsOfSelectedTables.includes(column) &&
              column != ''
            ) {
              this.columnsOfSelectedTables.push(column);
            }
          });
        }
        body.queryJson['derivedCols'] = res.dervied_cols;
        body.queryJson['case_cols'] = res.case_cols;

        this.editableQuery = this.silverLayerTablePreviewQueryData;
        this.dynamicCustomQueryArray[0].custom_query = format(
          this.silverLayerTablePreviewQueryData,
          { language: 'snowflake', linesBetweenQueries: 1 }
        );
        // this.aceEditor.setValue(this.dynamicCustomQueryArray[0].custom_query);
        this.saveButtonDisabled = false;
        let insertGoldData =
          env.ip +
          apiPaths.api.root +
          apiPaths.api.insertGoldData +
          url +
          '&gold_table_name=';
        this.appObservable.setDataInsertUrl$(insertGoldData);
        this.queryData = [];
        this.queryData.push(
          `${this.caseStatementQuery}`,
          `${this.filterQuery}`,
          `${this.customQuery}`,
          `${this.orderByQuery}`,
          `${this.groupByQuery}`,
          `${this.havingQuery}`,
          `${this.selectedTableNames}`,
          `${this.selectedColumnsNames}`
        );
        this.creatingGoldLayerTable = {
          params: url + '&project_id=' + `${this.projectId}`,
          body,
        };
        this.loading = false;
        this.appObservable.setSaveSilveryGoldRules$(this.queryData);
        // this.openModal(this.silverLayerTablePreviewData);
      });
  }

  reverseOperators(inputString: string): string {
    const operatorMap: { [key: string]: string } = {
      '=': '!=',
      '!=': '=',
      ' In ': ' not in ',
      '>': '<=',
      '<': '>=',
      '>=': '<',
      '<=': '>',
    };

    return inputString.replace(
      /=|!=| In |>=?|<=?|>/g,
      (match) => operatorMap[match]
    );
  }

  reverseKeywords(inputString: string): string {
    return inputString.replace(/AND/g, 'OR');
  }

  openTableSelection() {
    this.selectedColumnsNames = this.selectedTabledata
      .toString()
      .replace(/[\[\]']+/g, '');
    let insertGoldData =
      env.ip +
      apiPaths.api.root +
      apiPaths.api.insertGoldData +
      `${this.caseStatementQuery}` +
      '&join_stmt=' +
      `${this.joinQueryForAPI}` +
      '&filter_stmt=' +
      `${this.filterQuery}` +
      '&custom_stmt=' +
      `${this.customQuery}` +
      '&order_by_stmt=' +
      `${this.orderByQuery}` +
      '&group_by_stmt=' +
      `${this.groupByQuery}` +
      '&having_stmt=' +
      `${this.havingQuery}` +
      '&tbl_name=' +
      `${this.selectedTableNames}` +
      '&col_list=' +
      `${this.selectedColumnsNames}` +
      '&gold_table_name=';
  }

  fullSplit(e: any) {
    if (this.leftAreaSize === 80) {
      this.leftAreaSize = 3;
    } else {
      this.leftAreaSize = 80;
    }
  }

  dragEnd(event: any) {
    if (event.sizes[0] > 6) {
      this.leftAreaSize = event.sizes[0];
    } else {
      this.leftAreaSize = 3;
    }
  }

  getTableArrayBasedOnExistingSelection = {
    1: () => {
      let temp_data_set = new Set();
      this.dynamicJoinsArray.forEach((item) => {
        temp_data_set.add(item?.firstTable);
        temp_data_set.add(item?.secTable);
      });
      let temp_data = Array.from(temp_data_set);
      return this.checkedTableNames.filter((item) =>
        temp_data.includes(item?.selectedSliverLayerTableName)
      );
    },
    2: (len) => {
      let temp_data_set = new Set();
      this.dynamicJoinsArray.forEach((item, index) => {
        if (len <= index) {
          temp_data_set.add(item?.firstTable);
          temp_data_set.add(item?.secTable);
        }
      });
      let temp_data = Array.from(temp_data_set);
      let { firstTable, secTable } = this.dynamicJoinsArray[len - 1];
      return temp_data[0] === firstTable || temp_data[0] === secTable
        ? temp_data[1]
        : temp_data[0];
    },
    3: (len, isCommon) => {
      let temp_data_set = new Set();
      this.dynamicJoinsArray.forEach((item, index) => {
        if (len <= index) {
          temp_data_set.add(item?.firstTable);
          temp_data_set.add(item?.secTable);
        }
      });
      let temp_data = Array.from(temp_data_set);
      let { firstTable, secTable } = this.dynamicJoinsArray[len];
      return isCommon
        ? temp_data.includes(firstTable)
          ? firstTable
          : secTable
        : temp_data.includes(firstTable)
        ? secTable
        : firstTable;
    },
  };

  getAttributeForSelectedTable(index, isCommon: boolean) {
    let selectedTable = this.getTableArrayBasedOnExistingSelection[3](
      index,
      isCommon
    );
    let { firstTable, firstAttribute, secAttribute } =
      this.dynamicJoinsArray[index];
    return selectedTable === firstTable ? firstAttribute : secAttribute;
  }
  triggerQueryMethod() {
    this.unsavedChanges = false;
    this.queryBuilderComponent.openTableSelectionModal();
  }

  discardChecks() {
    this.appliedChecksService['appliedChecks'] = {};
    this.previewSQLQueryData();
  }
  copyToClipboard() {
    this.clipboard.copy(this.aceEditor.getValue());
    this.copyIcon = 'done_all';
    setTimeout(() => {
      this.copyIcon = 'content_copy';
    }, 2000);
  }

  routeHome() {
    return `/projects`;
  }
  routeDataPipelines() {
    return `/project-view`;
  }
  routeWorkflow(title: string) {
    const layer = title === 'Refined Scheduler' ? 'silver_layer' : 'gold_layer';
    this.router.navigate([
      navigationRoutes.workflowDashboard +
        `${this.projectId}` +
        '/' +
        `${layer}`,
    ]);
  }
}
