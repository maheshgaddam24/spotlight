import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import { AES, enc, mode, pad } from 'crypto-js';
import { Subject, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment as env } from 'src/environments/environment';
import { apiPaths } from '../../Config/apiPaths';
import { navigationRoutes } from '../../Config/navigation-routes';
import { toastMessages } from '../../Config/toastr-messages';
import { AppObservable } from '../../app-observable';
import { syncDatabase } from '../../headers';
import { ApiService } from '../../services/api/api.service';
import { PopupDataService } from '../../services/popup-data/popup-data-service.service';
import { GetDatabaseTablesComponent } from '../get-database-tables/get-database-tables.component';
import { RowColumnFilteringComponent } from '../row-column-filtering/row-column-filtering.component';

@Component({
  selector: 'app-get-data',
  templateUrl: './get-data.component.html',
  styleUrls: ['./get-data.component.scss'],
})
export class GetDataComponent implements OnInit {
  @Output() connectClicked: EventEmitter<void> = new EventEmitter<void>();
  @Output() flatFileRowFilter: EventEmitter<void> = new EventEmitter<void>();
  @Output() dataToEmit = new EventEmitter<string>();
  @Output() tableListData: EventEmitter<any> = new EventEmitter<any>();
  @Output() resetDataBase: EventEmitter<any> = new EventEmitter<any>();
  @Output() resetUpload: EventEmitter<any> = new EventEmitter<any>();


  @Output() rowColumFilteredData: EventEmitter<any> = new EventEmitter<any>();
  @Input() data: any;
  databaseDiv: boolean = false;
  apiDiv: boolean = false;
  fileDiv: boolean = true;
  isDatabaseFormOpen: boolean = false;
  isApiFormOpen: boolean = false;
  databaseForm: FormGroup;
  apiForm: FormGroup;
  isFileLoaded: boolean = false;
  filePath!: String;
  fileName!: string;
  fileSize: any;
  uploadedFileData: any;
  runDagId: any;
  connectButtonDisabled: boolean = true;
  hideTestingText: boolean = true;
  hideTestConnectionText: boolean = false;
  hideTestConnectionBtn: boolean = false;
  invalidFields: any[] = [];
  projectId: any;
  projectName: any;
  chips: string[] = [];
  isLoading: boolean = false;
  DataLoadBtn: string = 'Connect';
  databases: any[] = [
    'Microsoft SQL',
    'MySQL',
    'BlgQuery',
    'Postgres',
    'Redis',
    'Oracle DB',
    'Vertica',
    'Cloud Datastore',
    'Presto',
  ];
  apis: any[] = [
    'REST API',
    'Amazon S3',
    'Slack',
    'Front',
    'Onesignal',
    'Jira',
    'Datadog',
    'BigID',
    'OpenAPI',
  ];
  generatedIV: any;
  activeItem: number;
  options: string[] = ['File upload', 'Database', 'API'];
  selectedOption: string = "File upload";
  showSecondDropdown: boolean = false;

  ngOnInit(): void {
    this.projectId = this.data;
  }

  constructor(
    public modalService: NgbModal,
    public service: ApiService,
    private toastService: HotToastService,
    private httpClient: HttpClient,
    private appObservable: AppObservable,
    private router: Router,
    public formBuilder: FormBuilder,
    private popupDataService: PopupDataService,
    private dialog: MatDialog
  ) {
    this.projectName = sessionStorage.getItem('project_name');
    this.databaseForm = this.formBuilder.group({
      host: ['', [Validators.required]],
      port: ['', [Validators.required]],
      dbname: ['', [Validators.required]],
      dbUsername: ['', [Validators.required]],
      dbPassword: ['', [Validators.required]],
      Schema: [[]],
      project_name: this.projectName,
    });
    this.apiForm = new FormGroup({
      url: new FormControl(),
      format: new FormControl('CSV'),
      access_id: new FormControl(),
      access_key: new FormControl(),
      storage_account: new FormControl(),
    });
  }
  private _refreshrequired$ = new Subject<void>();
  get Refreshrequired$() {
    return this._refreshrequired$;
  }

  addChip(chipInput: HTMLInputElement): void {
    const value = chipInput.value.trim();
    if (value !== '') {
      this.chips.push(value);
      chipInput.value = '';
    }
  }

  removeChip(chip: string): void {
    const index = this.chips.indexOf(chip);
    if (index !== -1) {
      this.chips.splice(index, 1);
    }
  }

  generateRandomBytes(length: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
    return randomString;
  }

  encryptPassword(password: string): string {
    const key = enc.Utf8.parse('spotlight@123456');
    this.generatedIV = this.generateRandomBytes(16);
    const encrypted = AES.encrypt(password, key, {
      iv: enc.Utf8.parse(this.generatedIV),
      mode: mode.CBC,
      padding: pad.Pkcs7,
    });
    return encrypted.toString();
  }

  openDatabseTablesModal(id: any) {
    // this.closeGetDataModal();
    // const modalRef = this.modalService.open(GetDatabaseTablesComponent, {
    //   size: 'l',
    //   backdrop: 'static',
    //   centered: true,
    // });
    // modalRef.componentInstance.data = this.runDagId;
    this.connectClicked.emit();
    this.tableListData.emit(this.runDagId);
    this.dataToEmit.emit('database');

  }

  closeGetDataModal() {
    this.modalService.dismissAll();
  }

  onSourceChange() {
    this.isDatabaseFormOpen = false;
    this.isApiFormOpen = false;

    if (this.selectedOption === 'Database' || this.selectedOption === 'API') {
      this.showSecondDropdown = true;
      this.fileDiv = false;
    } else {
      this.fileDiv = true;
      this.showSecondDropdown = false;
    }
  }

  // openFileModal() {
  //   this.isDatabaseFormOpen = false;
  //   this.isApiFormOpen = false;
  //   this.databaseDiv = false;
  //   this.apiDiv = false;
  //   this.fileDiv = true;
  // }

  // openDatabaseModal() {
  //   this.isApiFormOpen = false;
  //   this.databaseDiv = true;
  //   this.apiDiv = false;
  //   this.fileDiv = false;
  //   this.activeItem = -1;
  // }

  // openApiModal() {
  //   this.activeItem = -1;
  //   this.isDatabaseFormOpen = false;
  //   this.databaseDiv = false;
  //   this.apiDiv = true;
  //   this.fileDiv = false;
  // }

  openDatabaseForm() {
    this.isDatabaseFormOpen = true;
    this.isApiFormOpen = false;
  }

  openApiForm() {
    this.isApiFormOpen = true;
    this.isDatabaseFormOpen = false;
  }

  submitAPIForm() {
    // this.appObservable.setRestApiFrom$(this.apiForm.value);
    // this.service.connectingBlobStorageAPI();
    this.apiForm.value['access_key'] = this.encryptPassword(
      this.apiForm.value.access_key
    );
    this.apiForm.value['access_key_randomIV'] = this.generatedIV;
    this.apiForm.value['access_id'] = this.encryptPassword(
      this.apiForm.value.access_id
    );
    this.apiForm.value['access_id_randomIV'] = this.generatedIV;
    this.isLoading = true;
    var raw = JSON.stringify({
      data: this.apiForm.value,
    });
    this.DataLoadBtn = 'Fetching Table';
    this.httpClient
      .post(
        env.ip + apiPaths.dataload.root + apiPaths.dataload.s3RestApi,
        raw,
        { headers: syncDatabase }
      )
      .pipe(
        catchError((errorResponse: any) => {
          this.DataLoadBtn = 'Connect';
          this.isLoading = false;
          this.toastService.error(errorResponse.error.error);
          return throwError('Something went wrong');
        })
      )
      .subscribe((res: any) => {
        this.isLoading = false;
        this.popupDataService.setIvEncryptedData(raw);

        this.closeGetDataModal();
        this.openRowColumnFiltering(res, 'Amazon S3');
      });
  }

  submitDatabaseForm(event: KeyboardEvent) {
    this.resetDataBase.emit()
    // event.preventDefault();
    if (this.databaseForm.invalid) {
      const controls = this.databaseForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          this.invalidFields.push(name);
        }
      }
      this.toastService.warning(
        `${this.invalidFields}` + ' ' + toastMessages.fieldsMissing
      );
      this.invalidFields = [];
    } else {
      this.hideTestConnectionText = true;
      this.hideTestingText = false;
      this.hideTestConnectionBtn = true;
      // const hashPassword = this.encryptPassword(
      //   this.databaseForm.value.dbPassword
      // );
      const jdbsURL =
        'jdbc:sqlserver://' +
        `${this.databaseForm.value.host}` +
        ':' +
        `${this.databaseForm.value.port}` +
        ';databaseName=' +
        `${this.databaseForm.value.dbname}` +
        ';user=' +
        `${this.databaseForm.value.dbUsername}` +
        ';password=' +
        `${this.databaseForm.value.dbPassword}`;
      const encryptJbsUrl = this.encryptPassword(jdbsURL);
      let keysToRemove = ['host', 'port', 'dbname', 'dbUsername', 'dbPassword'];
      let credentialsObject = Object.fromEntries(
        Object.entries(this.databaseForm.value).filter(
          ([key, value]) => !keysToRemove.includes(key)
        )
      );
      credentialsObject.Schema = this.chips;
      credentialsObject['RandomIV'] = this.generatedIV;
      credentialsObject['databaseCredentials'] = encryptJbsUrl;
      var raw = JSON.stringify({
        conf: credentialsObject,
      });
      this.httpClient
        .post(
          env.ip +
          apiPaths.dataload.root +
          apiPaths.dataload.testConfigDatabase,
          raw,
          { headers: syncDatabase }
        )
        .pipe(
          catchError((errorResponse: any) => {
            this.hideTestConnectionText = false;
            this.hideTestingText = true;
            this.hideTestConnectionBtn = false;
            if (errorResponse.status == 500) {
              return;
            } else {
              this.toastService.error(errorResponse.error.error);
              return throwError('Something went wrong');
            }
          })
        )
        .subscribe((res: any) => {
          this.toastService.success(toastMessages.testConnectionsuccessful);
          this.hideTestConnectionBtn = false;
          this.hideTestConnectionText = false;
          this.connectButtonDisabled = false;
          this.hideTestingText = true;
          this.runDagId = res;
          this.popupDataService.setIvEncryptedData(raw);
        });
    }
  }


  openDatabaseTablesModal() {
    this.router.navigate([navigationRoutes.dataBaseTables]);
  }

  resetDatabaseForm() {
    this.databaseForm.reset();
  }

  resetAPIForm() {
    this.apiForm.reset();
  }

  cancelUpload() {
    this.resetUpload.emit()
  }

  loadFile() {
    this.isFileLoaded = true;
  }

  browseFile() {
    document.getElementById('browse-input')?.click();
  }

  async onFileChange(event: any) {
    this.uploadedFileData = event;
    this.filePath = event.target.files[0];
    this.fileName = event.target.files[0].name;
    this.fileSize = event.target.files[0].size;
    if (event.target.files[0]) {
      this.loadFile();
    }
  }

  upload(event: any) {
    this.service
      .upload(event, this.projectName)
      .pipe(
        tap(() => {
          this._refreshrequired$.next();
        }),
        this.toastService.observe({
          loading: toastMessages.uploading,
          success: (s) =>
            `${event.target.files[0].name} ` + toastMessages.uploadingSuccess,
          error: (e) => toastMessages.uploadingError,
        })
      )
      .subscribe((res: any) => {
        this.closeGetDataModal();
        var array = res.file_name.split(',');
        this.openRowColumnFiltering(array, 'flat file');
      });
  }

  openRowColumnFiltering(data: any, componentInstance: string): void {
    // this.closeCreateProjectModal()
    // const dialogRef = this.dialog.open(RowColumnFilteringComponent, {
    //   height: '80%',
    //   width: '80%',
    //   disableClose: true,
    //   data: data,
    // });
    // dialogRef.componentInstance.isGetDatabaseTablesComponent =
    //   componentInstance;
    this.rowColumFilteredData.emit(data);
    this.flatFileRowFilter.emit()
    this.dataToEmit.emit(componentInstance);
  }
}
