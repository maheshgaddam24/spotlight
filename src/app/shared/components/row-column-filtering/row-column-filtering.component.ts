import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { HotToastService } from '@ngneat/hot-toast';
import { FieldMap, QueryBuilderConfig } from 'angular2-query-builder';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { catchError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { toastMessages } from '../../Config/toastr-messages';
import { ApiService } from '../../services/api/api.service';
import { PopupDataService } from '../../services/popup-data/popup-data-service.service';
import { DataLoadComponent } from '../data-load/data-load.component';
// import { QueryBuilderField } from 'angular2-query-builder';
import { lastValueFrom } from 'rxjs';
import { apiPaths } from '../../Config/apiPaths';
import { lowerFirst } from 'lodash';

@Component({
  selector: 'app-row-column-filtering',
  templateUrl: './row-column-filtering.component.html',
  styleUrls: ['./row-column-filtering.component.scss'],
})
export class RowColumnFilteringComponent implements OnInit {
  @Input() data: any;
  @Input() isGetDatabaseTablesComponent: any;
  @Output() triggerResetMethod: EventEmitter<any> = new EventEmitter<any>();
  @Output() triggerRowColumnFilterMethod: EventEmitter<any> =
    new EventEmitter<any>();
  @Output() cancelRowFilterTab: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('tabGroup') tabGroup: MatTabGroup;
  formGroup: FormGroup;
  projectId: any;
  responses: { [key: string]: string[] } = {};
  responsesLoaded = false;
  queryForm: FormGroup;
  queryBuilder: boolean = false;
  tableNames: string[];
  selectedOptions: string[];
  query = {
    condition: 'and',
    rules: [],
  };
  isLoading = false;
  arrayOfElements: any;
  selectedTableColumns: any[] = [];
  innerObject: {};
  parentDropdownOptions: any[] = [];
  childDropdownOptions: any[] = [];
  parentControl = new FormControl();
  childControl = new FormControl();
  finalSqlQuery: {};
  config: QueryBuilderConfig[] = [];
  sqlQuery: string = '';
  tableColumns: { [key: string]: string[] } = {};
  configTable: { [key: string]: {} } = {};
  sqlQueries: string[] = [];
  dataForRules: any[] = [];
  DataLoadBtn: any = 'Load Data';
  dataArray: string[] = [];
  transferredData: any;
  randomIvEncryptedData: any;
  requestedBody: {};
  url: string;
  filename: any;
  response: string[];
  activeTab: string = 'columnFiltering';
  nextFilterEnabled: boolean = false;
  dropdownSettings: IDropdownSettings = {
    itemsShowLimit: 3,
  };

  constructor(
    private toastService: HotToastService,
    private httpClient: HttpClient,
    private service: ApiService,
    private popupDataService: PopupDataService,
    public dialogRef: MatDialogRef<RowColumnFilteringComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public dialog: MatDialog
  ) {
    this.queryForm = this.fb.group({
      tableName: new FormControl(''),
      tables: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.projectId = sessionStorage.getItem('project_id');

    if (this.isGetDatabaseTablesComponent === 'database') {
      this.transferredData = this.popupDataService.getIvEncryptedDataData();
      this.randomIvEncryptedData = JSON.parse(this.transferredData);
      this.sendMultipleRequests(this.data);
      this.tableNames = this.data;
      this.formGroup = this.createFormGroup(this.data);
    } else if (this.isGetDatabaseTablesComponent === 'flat file') {
      this.filename = this.data[0];
      this.sendMultipleRequests(this.data);
      this.formGroup = this.createFormGroup(this.data);
      this.tableNames = this.data;
    } else if (this.isGetDatabaseTablesComponent === 'Amazon S3') {
      this.transferredData = this.popupDataService.getIvEncryptedDataData();
      this.randomIvEncryptedData = JSON.parse(this.transferredData);
      this.tableNames = Object.keys(this.data);
      this.formGroup = this.createFormGroup(Object.keys(this.data));
      this.sendMultipleRequests(Object.keys(this.data));
    }
  }
  activateTab() {
    this.selectedTableColumns = this.formGroup.value;
    this.activeTab = 'rowFiltering';
    this.nextFilterEnabled = true;
  }

  async sendMultipleRequests(array: any) {
    let responsesReceived = 0;
    for (const element of array) {
      try {
        if (this.isGetDatabaseTablesComponent === 'database') {
          const config = {
            RandomIV: this.randomIvEncryptedData.conf.RandomIV,
            encrypted_url: this.randomIvEncryptedData.conf.databaseCredentials,
            project_id: this.projectId,
            table_name: element,
          };
          this.requestedBody = config;
          this.url =
            environment.ip +
            apiPaths.dataload.root +
            apiPaths.dataload.getFiltrationTableColumns;
          const headers = new HttpHeaders().set(
            'Content-Type',
            'application/json'
          );
          this.response = await lastValueFrom(
            this.httpClient.post<string[]>(this.url, this.requestedBody, {
              headers,
            })
          );
        } else if (this.isGetDatabaseTablesComponent === 'flat file') {
          this.url =
            environment.ip +
            apiPaths.dataload.root +
            apiPaths.dataload.getCsvTableColumns;
          const result = element.split('.')[0];
          let raw = JSON.stringify({
            conf: {
              project_id: this.projectId,
              filename: result,
            },
          });
          this.requestedBody = raw;
          const headers = new HttpHeaders().set(
            'Content-Type',
            'application/json'
          );
          this.response = await lastValueFrom(
            this.httpClient.post<string[]>(this.url, this.requestedBody, {
              headers,
            })
          );
        } else if (this.isGetDatabaseTablesComponent === 'Amazon S3') {
          this.response = this.data[element];
        }

        this.formGroup.get(element)?.setValue(this.response);
        this.responses[element] = this.response;
        this.arrayOfElements = this.response.flatMap(
          (innerArray) => innerArray
        );
        this.tableColumns[element] = this.arrayOfElements;

        const objects = this.responses[element].map((key) => {
          return {
            key: key,
            name: key,
            type: 'string',
            operators: ['=', '!=', '>', '<', '>=', '<='],
            defaultValue: '',
          };
        });
        if (this.isGetDatabaseTablesComponent === 'database') {
          const formattedObject = objects.reduce((acc, curr) => {
            acc[curr.key[0]] = {
              name: curr.name[0],
              type: curr.type,
              ...(curr.operators && { operators: curr.operators }),
              ...(curr.defaultValue && { defaultValue: curr.defaultValue }),
            };
            return acc;
          }, {});

          this.config.push({ fields: formattedObject });
        } else if (this.isGetDatabaseTablesComponent === 'flat file') {
          const formattedObject = objects.reduce((acc, curr) => {
            acc[curr.key] = {
              name: curr.name,
              type: curr.type,
              ...(curr.operators && { operators: curr.operators }),
              ...(curr.defaultValue && { defaultValue: curr.defaultValue }),
            };
            return acc;
          }, {});

          this.config.push({ fields: formattedObject });
        }

        this.responsesLoaded = true;
        responsesReceived++;

        if (responsesReceived === array.length) {
          this.responsesLoaded = true;
          for (const element of this.data) {
            this.formGroup.get(element)?.setValue(this.responses[element]);
          }
        }
      } catch (error) {}
    }
    const key = this.data[0];
    const value = this.responses[key];
    this.formGroup.controls[key]?.setValue(value);
  }

  loadData() {
    this.isLoading = true;
    this.DataLoadBtn = 'Loading Data';
    this.sqlQueries = [];
    this.sqlQuery = this.convertToSqlQuery(this.queryForm.value);
    this.dataArray = this.sqlQuery.split(';');
    if (this.isGetDatabaseTablesComponent === 'database') {
      setTimeout(() => {
      this.triggerResetMethod.emit();
      }, 5000);
      setTimeout(() => {
        this.service._refreshrequired$.next();
      }, 6000);

      this.finalSqlQuery = {
        tablesSelected: this.data,
        columnsFilter: this.selectedTableColumns,
        rowFilter: this.dataArray,
        RandomIV: this.randomIvEncryptedData.conf.RandomIV,
        encrypted_url: this.randomIvEncryptedData.conf.databaseCredentials,
      };
      this.service
        .postSelectedTablesSDB(this.projectId, this.finalSqlQuery)
        .pipe(
          catchError((Error) => {
            this.isLoading = false;
            this.DataLoadBtn = 'Load Data';
            return Error(Error);
          })
        )
        .subscribe((res: any) => {
          this.isLoading = false;
          this.DataLoadBtn = 'Load Data';
          this.toastService.success(toastMessages.successSavingTablesSDB);
        });
    } else if (this.isGetDatabaseTablesComponent === 'flat file') {
     

      setTimeout(() => {
         this.triggerResetMethod.emit();
        this.triggerRowColumnFilterMethod.emit();
      }, 5000);
      const arrayOfArrays = Object.values(this.selectedTableColumns).flatMap(
        (value) => value.map((item) => [item])
      );
      const table = this.data[0];
      this.finalSqlQuery = {
        tablesSelected: this.data,
        columnsFilter: {},
        rowFilter: this.dataArray,
      };
      this.finalSqlQuery['columnsFilter'][table] = arrayOfArrays;
      setTimeout(() => {
        this.service._refreshrequired$.next();
      }, 6000);
      this.service
        .csvDataLoad(this.projectId, this.finalSqlQuery)
        .pipe(
          catchError((Error) => {
            this.isLoading = false;
            this.DataLoadBtn = 'Load Data';
            return Error(Error);
          })
        )
        .subscribe((res: any) => {
          this.isLoading = false;
          this.DataLoadBtn = 'Load Data';
          this.dialogRef.close();
          this.toastService.success(toastMessages.successSavingTablesSDB);
        });
    } else if (this.isGetDatabaseTablesComponent === 'Amazon S3') {
      setTimeout(() => {
        this.triggerResetMethod.emit();
      }, 5000);
      this.finalSqlQuery = {
        tablesSelected: this.tableNames,
        columnsFilter: {},
        rowFilter: this.dataArray,
        url: this.randomIvEncryptedData.data.url,
        format: this.randomIvEncryptedData.data.format,
        access_key: this.randomIvEncryptedData.data.access_key,
        access_id: this.randomIvEncryptedData.data.access_id,
        storage_account: this.randomIvEncryptedData.data.storage_account,
        access_id_randomIV: this.randomIvEncryptedData.data.access_id_randomIV,
        access_key_randomIV:
          this.randomIvEncryptedData.data.access_key_randomIV,
      };
      const arrayOfArrays = Object.values(this.selectedTableColumns).flatMap(
        (value) => value.map((item) => [item])
      );
      const table = this.tableNames[0];
      this.finalSqlQuery['columnsFilter'][table] = arrayOfArrays;
      setTimeout(() => {
        this.service._refreshrequired$.next();
      }, 6000);
      this.service
        .amazonS3DataLoad(this.projectId, this.finalSqlQuery)
        .pipe(
          catchError((Error) => {
            this.isLoading = false;
            this.DataLoadBtn = 'Load Data';
            return Error(Error);
          })
        )
        .subscribe((res: any) => {
          this.isLoading = false;
          this.DataLoadBtn = 'Load Data';
          this.dialogRef.close();
          this.toastService.success(toastMessages.successSavingTablesSDB);
        });
    }
  }
  cancelRowFilter() {
    this.cancelRowFilterTab.emit();
  }
  get tables(): FormArray {
    return this.queryForm.get('tables') as FormArray;
  }

  removeElement(index: number) {
    this.tables.removeAt(index);
    this.dataArray.splice(index, 1);
  }
  change(event: any, index: number) {
    const selectedTableName = event.value;

    const selectedColumns = this.tableColumns[selectedTableName];

    if (selectedColumns) {
      const fields: FieldMap = {};

      for (const columnName of selectedColumns) {
        fields[columnName] = {
          name: columnName,
          type: 'string',
          operators: ['=', '!=', '>', '<', '>=', '<=', 'between'],
          defaultValue: '',
        };
      }

      const config: QueryBuilderConfig = {
        fields,
        getOperators: () => ['=', '!=', '>', '<', '>=', '<=', 'between'],
      };
      this.config[index] = config;
    } else {
      this.config[index] = null;
    }
  }

  addTable() {
    const tableGroup = this.fb.group({
      tableName: new FormControl(''),
      query: new FormControl(''),
    });
    this.tables.push(tableGroup);
  }

  onQueryBuilderChange($event) {}

  createFormGroup(tableNames: any) {
    const formControlsConfig = {};
    for (const element of tableNames) {
      formControlsConfig[element] = new FormControl([]);
    }
    return new FormGroup(formControlsConfig);
  }

  onSubmit() {
    this.selectedTableColumns = this.formGroup.value;
  }

  convertToSqlQuery(data: any): string {
    for (const table of data.tables) {
      const tableName = table.tableName;
      const query = table.query;

      if (query) {
        const tableQuery = this.buildQuery(query);
        const value1 = this.selectedTableColumns[`${table.tableName}`];

        const sqlQuery = `SELECT ${value1} FROM ${tableName} WHERE ${tableQuery}`;
        this.sqlQueries.push(sqlQuery);
      }
    }
    return this.sqlQueries.join(';');
  }

  buildQuery(query: any): string {
    const condition = query.condition.toUpperCase();
    let queryStr = '';

    for (const rule of query.rules) {
      if (rule.condition) {
        const subQuery = this.buildQuery(rule);
        queryStr += `(${subQuery}) ${condition} `;
      } else {
        const field = rule.field;
        const operator = this.getOperatorSymbol(rule.operator);
        const value = rule.value.includes(',')
          ? rule.value
              .split(',')
              .map((val) => `'${val.trim()}'`)
              .join(` ${condition} `)
          : `'${rule.value}'`;

        queryStr += `${field} ${operator} ${value} ${condition} `;
      }
    }

    queryStr = queryStr.trimEnd();
    queryStr = queryStr.substring(0, queryStr.length - condition.length);

    return queryStr;
  }

  getOperatorSymbol(operator: string): string {
    switch (operator) {
      case '=':
        return '=';
      case '!=':
        return '<>';
      case '>':
        return '>';
      case '<':
        return '<';
      case '<=':
        return '>=';
      case '<=':
        return '<=';
      default:
        return operator;
    }
  }

  openDataLoad(data: any, tableNames: any): void {
    this.dialog.open(DataLoadComponent, {
      height: 'fit-content',
      width: 'fit-content',
      disableClose: true,
      data: { query: data, table_names: tableNames },
    });
  }
}
function parse(transferredData: any) {
  throw new Error('Function not implemented.');
}
