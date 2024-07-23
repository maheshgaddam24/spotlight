import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { LocationStrategy } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import { isEqual } from 'lodash';
import { environment } from 'src/environments/environment';
import { apiPaths } from '../../Config/apiPaths';
import { AppObservable } from '../../app-observable';
import { AppliedDqChecksService } from '../../services/dq-checks-service/applied-dq-checks.service';
import { DataQualityComponent } from '../data-quality/data-quality.component';
import { ReportWorkflowSchedulingComponent } from './report-workflow-scheduling/report-workflow-scheduling.component';
import { commonConst } from '../../Config/common-const';
@Component({
  selector: 'app-query-builder-data-preview',
  templateUrl: './query-builder-data-preview.component.html',
  styleUrls: ['./query-builder-data-preview.component.scss'],
  animations: [
    trigger('slideAnimation', [
      state(
        'normal',
        style({
          transform: 'translateX(0)',
        })
      ),
      state(
        'dragging',
        style({
          transform: 'translateX(0)',
        })
      ),
      transition('normal => dragging', animate('150ms ease-in-out')),
      transition('dragging => normal', animate('150ms ease-in-out')),
    ]),
    trigger('fade', [
      state('void', style({ opacity: 0 })),
      transition(':enter, :leave', [animate(200)]),
    ]),
    trigger('iconRotate', [
      transition('open => closed', [
        style({ transform: 'rotate(0deg)' }),
        animate('0.1s', style({ transform: 'rotate(180deg)' })),
      ]),
      transition('closed => open', [
        style({ transform: 'rotate(180deg)' }),
        animate('0.1s', style({ transform: 'rotate(0deg)' })),
      ]),
    ]),
  ],
})
export class QueryBuilderDataPreviewComponent implements OnInit {
  @Input() data: any;
  @Input() error_queue: any;
  @Input() tableName: any;
  @Input() runTime: any;
  @Input() editScheduledFrequency: any;
  @Input() schemaColumnsData: any;
  @Input() sourceTableNames: any;
  @Input() creatingGoldLayerTable: any;
  @Input() groupByColumns: any;
  @Input() traceabilityInfo: any;
  @Output() itemDropped: EventEmitter<void> = new EventEmitter();
  @Output() discardClick = new EventEmitter<void>();
  bronzeTablePreviewData: any;
  name: any;
  hideText: boolean = false;
  dataInsertUrl: any;
  selectedProjectId: any;
  currentUrl: any;
  hideSaveButton: boolean = true;
  saveButtonDisabled: boolean = true;
  rule: any;
  queryBuilderData: any;
  perviousRulesDataCheck: boolean = true;
  previousURL: any;
  selectedCheckNull: boolean = false;
  silverLayerTableName: any;
  checks = [
    { name: 'Null Check', type: 'null' },
    { name: 'String Check', type: 'string' },
    { name: 'Integer Check', type: 'int' },
    { name: 'Length Check', type: 'int' },
    { name: 'Alphanumeric', type: 'string' },
    { name: 'Decimal Check', type: 'string' },
    { name: 'Date Check', type: 'string' },
  ];
  correct: boolean = true;
  error: boolean = true;
  selectedFilter: string = 'correct';
  selectedCheck: any;
  dragging = false;
  isCheckListOpen = false;
  tableAcceptingDrop: boolean[] = [];
  selectedChecks: { [key: string]: string[] } = {};

  appliedChecks: { [key: string]: string[] } | { length: number } = {};
  appliedChecksColumns: any[] = [];

  showRemoveButton: boolean;
  draggedIndex: number | null = null;
  openedIndex: number | null = null;
  hoveredColumnIndex: number | null = null;
  lengthValue: any;
  errorQueue_columns: any;
  noTables: any[] = [];
  isErrorQueueDisabled = true;
  isDraggable: boolean = true;
  totalResultRecords: number;
  totalErrorQueueRecords: number;
  queryDataVisible = false;
  totalRecord: number;
  schemaWithColumnNames: { COLUMN_NAME: string; DATA_TYPE: string }[][];
  showDropdown: boolean = false;
  selectedColumnName: string = '';
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' | null = null;
  environment = environment;
  sortColumnValue: any;

  toggleQueryDataVisibility() {
    this.queryDataVisible = !this.queryDataVisible;
  }
  toggleSort(column: string, direction: 'asc' | 'desc') {
    this.sortColumnValue = this.appliedChecksService.getSortColumn();
    if (this.sortColumnValue) {
      this.sortColumn = this.sortColumnValue['Sort Column'];
      this.sortDirection = this.sortColumnValue['Sort Direction'];
    }
    if (this.sortColumn === column && this.sortDirection === direction) {
      this.sortColumn = null;
      this.sortDirection = null;
    } else {
      this.sortColumn = column;
      this.sortDirection = direction;
    }
    this.appliedChecksService.setSortColumn({
      'Sort Column': this.sortColumn,
      'Sort Direction': this.sortDirection,
    });
    this.itemDropped.emit();
  }

  constructor(
    public modalService: NgbModal,
    private appObservable: AppObservable,
    private router: Router,
    private httpClient: HttpClient,
    private route: ActivatedRoute,
    private url: LocationStrategy,
    private toastService: HotToastService,
    private appliedChecksService: AppliedDqChecksService,
    public dialog: MatDialog
  ) {}

  toggleCheckList() {
    this.isCheckListOpen = !this.isCheckListOpen;
  }
  removeCheck(columnName: string, index: number) {
    if (
      this.appliedChecks[columnName] &&
      this.appliedChecks[columnName].length > index
    ) {
      this.appliedChecks[columnName].splice(index, 1);

      if (this.appliedChecks[columnName].length === 0) {
        delete this.appliedChecks[columnName];
      }

      this.itemDropped.emit();
    }
  }
  removeCheckName(checkName: string) {
    if (checkName.includes('Check')) {
      checkName = checkName.replace(/\bCheck\b/g, '').trim();
      return checkName;
    } else {
      return checkName;
    }
  }

  loadMoreData() {
    this.onFilterChange(this.selectedFilter);
    if (this.data == '') {
      this.queryDataVisible = true;
      this.selectedFilter = 'error';
      this.onFilterChange('error');
      let silver = this.error_queue.map((key: any) => Object.keys(key));
      this.errorQueue_columns = silver[0]?.filter(
        (item) => !item.endsWith('SPOTLIGHT_HASHID')
      );
    } else {
      this.hideText = false;
      this.saveButtonDisabled = false;

      let silverLayerTableName = this.data.map((key: any) => Object.keys(key));
      let silver = this.error_queue.map((key: any) => Object.keys(key));
      this.bronzeTablePreviewData = silverLayerTableName[0].filter(
        (item) => !item.endsWith('SPOTLIGHT_HASHID')
      );
      this.errorQueue_columns = silver[0]?.filter(
        (item) => !item.endsWith('SPOTLIGHT_HASHID')
      );
    }
  }

  toggleDropdownSchema() {
    this.showDropdown = !this.showDropdown;
  }

  changeSchema(schema: any) {
    if (this.selectedColumnName) {
      const index = this.schemaWithColumnNames.findIndex(
        (item) => item[0].COLUMN_NAME === this.selectedColumnName
      );
      if (index !== -1) {
        this.schemaWithColumnNames[index][0].DATA_TYPE = schema.target.value;
      }
    }
    this.showDropdown = false;
  }

  getSchemaForColumn(columnName: string): string {
    for (const item of this.schemaWithColumnNames) {
      if (item[0].COLUMN_NAME === columnName) {
        return item[0].DATA_TYPE;
      }
    }
    return '-';
  }

  onFilterChange(filterOption: string) {
    if (filterOption === 'error') {
      this.isDraggable = false;
      this.error = true;
      this.correct = false;
      this.hideText = false;
    } else if (filterOption === 'correct') {
      this.isDraggable = true;
      this.error = false;
      this.correct = true;
      if (this.data == '') {
        this.hideText = true;
      } else {
        this.hideText = false;
      }
    }
  }
  methodInChildComponent(dataReceived: any): void {
    this.onFilterChange(dataReceived);
  }
  onDragOver(index: number) {
    event.preventDefault();
  }

  ngOnInit(): void {
    this.totalResultRecords = this.data.length;
    this.totalErrorQueueRecords = this.error_queue.length;
    this.totalRecord = this.totalResultRecords + this.totalErrorQueueRecords;
    this.runTime = this.convertDurationToMilliseconds(this.runTime);

    if (this.error_queue.length === 0) {
      this.isErrorQueueDisabled = true;
    } else {
      this.isErrorQueueDisabled = false;
    }
    this.previousURL = history.state.url;
    this.appObservable.getProjectId$().subscribe((res: any) => {
      this.selectedProjectId = res;
    });
    this.currentUrl = this.url.path();
    if (this.currentUrl.includes('rules')) {
      this.hideSaveButton = true;
    } else if (this.previousURL == 'rules/' + this.selectedProjectId) {
      this.rule = history.state.rule;
      this.hideSaveButton = false;
    } else {
      this.hideSaveButton = false;
    }
    this.loadMoreData();
    this.appliedChecks = this.appliedChecksService['appliedChecks'];

    this.appliedChecksColumns = Object.keys(this.appliedChecks);
    this.appObservable.getDataInsertUrl$().subscribe((res: any) => {
      this.dataInsertUrl = res;
    });
    this.schemaWithColumnNames = this.schemaColumnsData;
  }

  discardChecks() {
    this.appliedChecksService['appliedChecks'] = {};
    this.discardClick.emit();
  }
  getSortColumn(type: 'column' | 'sort'): string | null {
    this.sortColumnValue = this.appliedChecksService.getSortColumn();
    if (!this.sortColumnValue) {
      return null;
    }
    if (type === 'column') {
      return this.sortColumnValue['Sort Column'];
    } else if (type === 'sort') {
      return this.sortColumnValue['Sort Direction'];
    }
  }

  onDragOverTable(event: any, index: number) {
    if (this.dragging) {
      event.preventDefault();
      this.tableAcceptingDrop[index] = true;
      this.hoveredColumnIndex = index;
    }
  }

  onDragLeaveTable(index: number) {
    this.tableAcceptingDrop[index] = false;
    this.hoveredColumnIndex = null;
  }
  onDragStart(check: any, index: any) {
    this.draggedIndex = index;
    this.selectedCheck = check;
    this.selectedCheckNull = this.selectedCheck.name === 'Null Check';

    this.dragging = true;
  }
  toggleDropdown(index: number) {
    if (this.openedIndex === index) {
      this.openedIndex = null;
    } else {
      this.openedIndex = index;
    }
  }

  isAppliedCheckObject(check: any): boolean {
    return typeof check === 'object';
  }
  isAppliedCheckString(check: any): boolean {
    return typeof check === 'string';
  }
  getFirstObjectKey(obj: any): string | undefined {
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          return key;
        }
      }
    }

    return undefined;
  }
  getFirstObjectKeyValue(obj: any): { key: string; value: any } | undefined {
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          return obj[key];
        }
      }
    }
    return undefined;
  }
  dateCheckDisplay(dateRegExp: any) {
    return dateRegExp;
  }

  onDragEnd() {
    this.dragging = false;
    this.draggedIndex = null;
  }
  onDrop(event: any, columnName: string, tableIndex: number) {
    event.preventDefault();
    if (this.selectedCheck) {
      if (this.selectedCheck.name === 'Length Check') {
        const appliedChecks = this.appliedChecksService.getAppliedChecks();
        let keyExists = appliedChecks[columnName]?.some((obj) => {
          if (typeof obj === 'string') {
            return false;
          }
          return obj.hasOwnProperty('length');
        });
        if (keyExists) {
          this.toastService.warning(
            `Check "Length" is already applied to column "${columnName}".`
          );
        } else {
          const checkName = this.selectedCheck.name;
          this.openDataQuality(checkName, columnName, () => {
            if (this.lengthValue !== null) {
              const lengthCheck = this.lengthValue;
              const appliedChecks =
                this.appliedChecksService.getAppliedChecks();
              if (!appliedChecks[columnName]) {
                appliedChecks[columnName] = [];
              }
              appliedChecks[columnName].push(lengthCheck);
              this.appliedChecksService.setAppliedChecks(appliedChecks);
              this.itemDropped.emit();
            }
          });
        }
      } else if (this.selectedCheck.name === 'Decimal Check') {
        const checkName = this.selectedCheck.name;
        this.openDataQuality(checkName, columnName, () => {
          if (this.lengthValue !== null) {
            const lengthCheck = this.lengthValue;
            const appliedChecks = this.appliedChecksService.getAppliedChecks();
            if (!appliedChecks[columnName]) {
              appliedChecks[columnName] = [];
            }
            appliedChecks[columnName].push(lengthCheck);
            this.appliedChecksService.setAppliedChecks(appliedChecks);
            this.itemDropped.emit();
          }
        });
      } else if (this.selectedCheck.name === 'Date Check') {
        const checkName = this.selectedCheck.name;
        this.openDataQuality(checkName, columnName, () => {
          if (this.lengthValue !== null) {
            const lengthCheck = this.lengthValue;
            const appliedChecks = this.appliedChecksService.getAppliedChecks();
            if (!appliedChecks[columnName]) {
              appliedChecks[columnName] = [];
            }
            appliedChecks[columnName].push(lengthCheck);
            this.appliedChecksService.setAppliedChecks(appliedChecks);
            this.itemDropped.emit();
          }
        });
      } else {
        const checkName = this.selectedCheck.name;
        const appliedChecks = this.appliedChecksService.getAppliedChecks();

        if (!appliedChecks[columnName]) {
          appliedChecks[columnName] = [];
        }

        if (!appliedChecks[columnName].includes(checkName)) {
          appliedChecks[columnName].push(checkName);
          this.appliedChecksService.setAppliedChecks(appliedChecks);
          this.itemDropped.emit();
        } else {
          this.toastService.warning(
            `Check "${checkName}" is already applied to column "${columnName}".`
          );
        }
      }
    }
    this.tableAcceptingDrop.fill(false);
  }
  onDropHeader(event: any, columnIndex: number) {
    event.preventDefault();
    if (this.selectedCheck) {
      const checkName = this.selectedCheck.name;
      const columnName = this.bronzeTablePreviewData[columnIndex];

      if (!this.appliedChecks[columnName]) {
        this.appliedChecks[columnName] = [];
      }

      if (!this.appliedChecks[columnName].includes(checkName)) {
        this.appliedChecks[columnName].push(checkName);
      } else {
        this.toastService.warning(
          `Check "${checkName}" is already applied to column "${columnName}".`
        );
      }
    }
    this.tableAcceptingDrop.fill(false);
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    const windowHeight =
      'innerHeight' in window
        ? window.innerHeight
        : document.documentElement.offsetHeight;
    const body = document.body;
    const html = document.documentElement;
    const docHeight = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );
    const windowBottom = windowHeight + window.pageYOffset;
    if (windowBottom >= docHeight) {
      this.loadMoreData();
    }
  }

  openTableSelection() {
    if (this.previousURL == 'rules/' + this.selectedProjectId) {
      this.appObservable.getSaveSilveryGoldRules$().subscribe((res: any) => {
        this.queryBuilderData = res;
      });
      let data = {
        rule_data: {
          case_statment: `${this.queryBuilderData[0]}`,
          filter_statment: `${this.queryBuilderData[1]}`,
          custom_query: `${this.queryBuilderData[2]}`,
          order_by: `${this.queryBuilderData[3]}`,
          group_by: `${this.queryBuilderData[4]}`,
          table_name: `${this.queryBuilderData[5]}`,
          columns: `${this.queryBuilderData[6]}`,
        },
      };
      this.perviousRulesDataCheck = isEqual(
        data.rule_data,
        this.rule.rules_data
      );
      if (this.perviousRulesDataCheck) {
        this.modalService.dismissAll();
        this.router.navigate(['/rules/' + `${this.selectedProjectId}`]);
      } else {
        let raw = {
          is_active: false,
        };
        this.httpClient
          .patch(
            environment.ip +
              apiPaths.api.root +
              apiPaths.api.saveRule +
              `${this.rule.id}`,
            raw
          )
          .subscribe((res: any) => {});
        this.openTableSelectionModal();
      }
    } else {
      this.openTableSelectionModal();
    }
  }
  get layer_name() {
    return this.route.snapshot.params[commonConst.params_layer_Name];
  }
  openTableSelectionModal() {
    this.dialog.open(ReportWorkflowSchedulingComponent, {
      height: 'fit-content',
      width: '90vw',
      disableClose: true,
      data: {
        routeFrom: 'query_builder',
        sourceTableName: `${this.sourceTableNames}`,
        goldLayerTableCreate: this.creatingGoldLayerTable,
        traceabilityInfo: this.traceabilityInfo,
        groupByColumns: this.groupByColumns,
        layer_name: this.layer_name,
        editScheduledFrequency: this.editScheduledFrequency,
      },
    });
  }

  openDataQuality(check: any, columnName: any, callback: () => void): void {
    const dialogRef = this.dialog.open(DataQualityComponent, {
      height: 'fit-content',
      width: 'fit-content',
      disableClose: true,
      data: {
        check: check,
        columnName: columnName,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.lengthValue = result;
        callback();
      }
    });
  }

  convertDurationToMilliseconds(durationString: string) {
    const timeStamp = durationString.replace('.', ':');

    const parts = timeStamp.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseFloat(parts[2]);
    const milliseconds = parseInt(parts[3].split(' ')[0], 10);
    const totalMilliseconds =
      hours * 3600000 + minutes * 60000 + seconds * 1000 + milliseconds;
    return totalMilliseconds;
  }
}
