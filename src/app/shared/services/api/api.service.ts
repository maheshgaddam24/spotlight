import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import { Observable, Subject, tap } from 'rxjs';
import { AppObservable } from 'src/app/shared/app-observable';
import { environment as env, environment } from 'src/environments/environment';
import { apiPaths } from '../../Config/apiPaths';
import { toastMessages } from '../../Config/toastr-messages';
import { syncDatabase } from '../../headers';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  postResponse: any;
  apiFrom: any;
  dataBaseConnectionId: any;
  dataBaseSourceId: any;
  tablesSelected: any;
  restApiFrom: any;
  projectID: any;
  selectedProjectSDB: any;
  selectedProjectID: any;
  dataBaseTables: any;
  project_ID: any;
  projectName: any;
  id: any;
  selectedProjectName: any;
  runDagID: any;

  constructor(
    private httpClient: HttpClient,
    private toastService: HotToastService,
    public modalService: NgbModal,
    private appObservable: AppObservable,
    private router: Router
  ) {}
  public _refreshrequired$ = new Subject<void>();
  get Refreshrequired$() {
    return this._refreshrequired$;
  }

  getSourceList(): Observable<object> {
    return this.httpClient.get(
      env.ip + apiPaths.api.root + apiPaths.api.projectList
    );
  }
  getProjectRoleList(): Observable<object> {
    return this.httpClient.get(
      env.ip + apiPaths.api.root + apiPaths.api.getprojectRoles
    );
  }
  getUserList(): Observable<object> {
    return this.httpClient.get(
      env.ip + apiPaths.api.root + apiPaths.api.userList
    );
  }
  getContibuterList(projectIdContributer:any): Observable<object> {
    return this.httpClient.get(
      env.ip + apiPaths.api.root + apiPaths.api.addContributer +'?project_id='+`${projectIdContributer}`
    );
  }
  addContibuter(contibuterData:any): Observable<object> {
    return this.httpClient.post(
      env.ip + apiPaths.api.root + apiPaths.api.addContributer,
      contibuterData
    );
  }
  deleteContibuter(contibuterDeleteData:any): Observable<object> {
    return this.httpClient.delete(
      env.ip + apiPaths.api.root + apiPaths.api.addContributer+'?id='+`${contibuterDeleteData}`
    );
  }
  updateContibuter(contibuterUpdateData:any): Observable<object> {
    return this.httpClient.patch(
      env.ip + apiPaths.api.root + apiPaths.api.addContributer,contibuterUpdateData
    );
  }


  getDataSources(projectID: any): Observable<object> {
    this.selectedProjectID = projectID;
    return this.httpClient.get(
      env.ip +
        apiPaths.dataload.root +
        apiPaths.dataload.getDataSource +
        '?project_id=' +
        `${projectID}`
    );
  }
  getProjectIds() {
    return this.httpClient.get(
      environment.ip +
        apiPaths.api.root +
        apiPaths.api.userProjectIDs
    );
  }
  deleteDataSources(ID: any, projectID: any): Observable<object> {
    this.selectedProjectID = projectID;
    return this.httpClient.delete(
      env.ip +
        apiPaths.dataload.root +
        apiPaths.dataload.getDataSource +
        '?id=' +
        `${ID}` +
        '&project_id=' +
        `${projectID}`
    );
  }
  syncDataSources(syncData: any): Observable<object> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    return this.httpClient.post(
      env.ip + apiPaths.dataload.root + apiPaths.dataload.syncdataSource,
      syncData,
      httpOptions
    );
  }
  s3ManualSync(syncData: any): Observable<object> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    return this.httpClient.post(
      env.ip + apiPaths.dataload.root + apiPaths.dataload.manualSyncS3,
      syncData,
      httpOptions
    );
  }
  getProjectViewStatics(projectId: string) {
    return this.httpClient.get(
      environment.ip +
        apiPaths.api.root +
        apiPaths.api.project_view_statics +
        `${projectId}`
    );
  }

  scheduleDataSources(body: any, projectID: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    return this.httpClient.patch(
      environment.ip +
        apiPaths.dataload.root +
        apiPaths.dataload.getDataSource +
        '?project_id=' +
        `${projectID}`,
      body,
      httpOptions
    );
  }
  getBronzeLayerTables(projectID: any) {
    this.selectedProjectID = projectID;
    return this.httpClient.get(
      env.ip +
        apiPaths.api.root +
        apiPaths.api.getBronzeLayerTables +
        `${projectID}`
    );
  }
  getBronzeLayerTableColumnsData(tableName: any, projectID: any) {
    return this.httpClient.get(
      env.ip +
        apiPaths.api.root +
        apiPaths.api.getSourceTableData +
        `${tableName}` +
        '?project_id=' +
        `${projectID}`
    );
  }
  upload(event: any, project_name: any) {
    let uploadSourceFile = new FormData();
    uploadSourceFile.append('file', event.target.files[0]);
    uploadSourceFile.append('file_name', event.target.files[0].name);
    uploadSourceFile.append('file_type', event.target.files[0].type);
    uploadSourceFile.append('upoload_layer', 'True');
    uploadSourceFile.append('dump_layer', 'False');
    uploadSourceFile.append('transformation_layer', 'False');
    uploadSourceFile.append('project_name', project_name);

    if (event.target.files[0]) {
      return this.httpClient.post(
        env.ip + apiPaths.api.root + apiPaths.api.uploadSourceFile_api,
        uploadSourceFile
      );
    }
  }

  getCSVFileColumns(data: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.httpClient.post(
      env.ip + apiPaths.dataload.root + apiPaths.dataload.getCsvTableColumns,
      data,
      { headers }
    );
  }

  postSelectedTables() {
    this.appObservable.getProjectId$().subscribe((res: any) => {
      this.id = res;
    });
    this.appObservable.getProjectName$().subscribe((project_name: any) => {
      this.selectedProjectName = project_name;
    });
    this.appObservable.getDagRunID().subscribe((dagID: any) => {
      this.runDagID = dagID;
    });
    this.appObservable
      .getDataBase_connection_Id$()
      .subscribe((connection_Id) => {
        this.dataBaseConnectionId = connection_Id;
      });
    this.appObservable.getDataBase_source_Id$().subscribe((source_Id) => {
      this.dataBaseSourceId = source_Id;
    });
    this.appObservable
      .getDataBaseSelectedTables$()
      .subscribe((selectedTables) => {
        this.tablesSelected = selectedTables;
      });
    let raw = JSON.stringify({
      conf: {
        sourceid: this.dataBaseSourceId,
        connid: this.dataBaseConnectionId,
        tableName: this.tablesSelected,
        project_id: this.id,
        project_name: this.selectedProjectName,
        dag_run_id: this.runDagID,
      },
    });
    this.httpClient
      .post(
        env.ip +
          apiPaths.dataload.root +
          apiPaths.dataload.postDataBaseTablesSelected,
        raw,
        { headers: syncDatabase }
      )
      .pipe(
        this.toastService.observe({
          loading: toastMessages.savingTablesSDB,
          success: (s) => toastMessages.successSavingTablesSDB,
          error: (e) => toastMessages.errorSavingTablesSDB,
        })
      )
      .subscribe((res) => {
        this.closeGetDataModal();
      });
  }

  getLogFileContent(id: any, dataSetName: any) {
    return this.httpClient.get(
      env.ip +
        apiPaths.dataload.root +
        apiPaths.dataload.tableLogs +
        `${id}` +
        '&dataset_name=' +
        `${dataSetName}`,
      { responseType: 'text' }
    );
  }

  postSelectedTablesSDB(projectId: any, checkedTables: any) {
    // this.dataBaseTables = this.tablesSelected
    //   .toString()
    //   .replace(/[\[\]']+/g, '');
    // if (this.router.url === '/rules/' + projectId) {
    //   this.appObservable.getProjectId$().subscribe((res: any) => {
    //     this.selectedProjectID = res;
    //   });
    // }
    // this.selectedProjectSDB =
    //   env.postDataBaseTablesSelectedSDB +
    //   `${this.selectedProjectID}` +
    //   '/' +
    //   `${this.dataBaseTables}`;
    // return this.httpClient
    //   .post(this.selectedProjectSDB, this.selectedProjectSDB)
    //   .pipe(
    //     tap(() => {
    //       this._refreshrequired$.next();
    //     })
    //   );

    let raw = JSON.stringify({
      project_id: projectId,
      data: checkedTables,
    });
    return this.httpClient
      .post(
        env.ip +
          apiPaths.dataload.root +
          apiPaths.dataload.postDataBaseTablesSelectedSDB,
        raw,
        { headers: syncDatabase }
      )
      .pipe(
        tap(() => {
          this._refreshrequired$.next();
        })
      );
  }

  csvDataLoad(projectId: any, checkedTables: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    let raw = JSON.stringify({
      project_id: projectId,
      data: checkedTables,
    });
    return this.httpClient
      .post(
        env.ip + apiPaths.dataload.root + apiPaths.dataload.csvDataLoad,
        raw,
        { headers }
      )
      .pipe(
        tap(() => {
          this._refreshrequired$.next();
        })
      );
  }
  amazonS3DataLoad(projectId: any, checkedTables: any) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    let raw = JSON.stringify({
      project_id: projectId,
      data: checkedTables,
    });
    return this.httpClient
      .post(
        env.ip + apiPaths.dataload.root + apiPaths.dataload.amazonS3Api,
        raw,
        { headers }
      )
      .pipe(
        tap(() => {
          this._refreshrequired$.next();
        })
      );
  }

  closeGetDataModal() {
    this.modalService.dismissAll();
  }
  getDataTypes() {
    return this.httpClient.get(
      env.ip + apiPaths.api.root + apiPaths.api.dataTypes
    );
  }

  // connectingBlobStorageAPI() {
  //   this.appObservable.getRestApiFrom$().subscribe((res: any) => {
  //     this.apiFrom = res;
  //   });
  //   let raw = JSON.stringify({
  //     conf: this.apiFrom,
  //   });
  //   this.httpClient
  //     .post(
  //       env.ip + apiPaths.api.root + apiPaths.api.connectingAzureBlobStorageAPI,
  //       raw,
  //       { headers: syncDatabase }
  //     )
  //     .pipe(
  //       this.toastService.observe({
  //         loading: toastMessages.loadingTable,
  //         success: () => toastMessages.successConnectingRestApi,
  //         error: () => toastMessages.errorConnectingRestApi,
  //       })
  //     )
  //     .subscribe((res: any) => {});
  // }
  goldLayerTablesList(id: any) {
    return this.httpClient.get(
      env.ip + apiPaths.api.root + apiPaths.api.goldLayerDashboard + id
    );
  }

  getGoldLayerTablePreview(tableName: any, project_id: any,dataSetType:string) {
    if(dataSetType === "resultData"){
      return this.httpClient.get(
        env.ip +
          apiPaths.api.root +
          apiPaths.api.getGoldLayerTableData +
          `${tableName}` +
          '?project_id=' +
          `${project_id}`
      );
    }else{
      return this.httpClient.get(
        env.ip +
          apiPaths.api.root +
          apiPaths.api.getGoldLayerTableData +
          `${tableName}` +
          '?project_id=' +
          `${project_id}` + '&dataset_type=' + `${dataSetType}`
      );
    }
    
  }
  getSilverLayerTablePreview(tableName: any, project_id: any,dataSetType:string) {
      return this.httpClient.get(
        env.ip +
          apiPaths.api.root +
          apiPaths.api.getSilverLayerTableDataPreview + `${project_id}`+'/'+`${dataSetType}`+'/'+
          `${tableName}` 
         
      );
  }
  getEditQueryData(job_id:any){
    return this.httpClient.get(
      env.ip +
        apiPaths.api.root +
        apiPaths.api.editQueryData +
        `${job_id}`
    );
  }

  getProjectRulesData(id: any, layerId: any) {
    return this.httpClient.get(
      env.ip +
        apiPaths.api.root +
        apiPaths.api.workFlowTransition +
        `${id}` +
        '/' +
        `${layerId}`
    );
  }
  saveGoldLayer(projectData: any) {
    let goldLAyerData = {
      project_id: projectData[0],
      table_name: projectData[1],
      file_type: '',
    };
    return this.httpClient.post(
      env.ip +
        apiPaths.api.root +
        apiPaths.api.saveGoldLayerData +
        projectData[0],
      goldLAyerData
    );
  }

  getAuditLogsData(id: any, body: any) {
    return this.httpClient.post(
      env.ip + apiPaths.api.root + apiPaths.api.auditLogs + `${id}`,
      body
    );
  }

  postSelectedRule() {}
  workFlowChartDataSet(workFlowId: any) {
    return this.httpClient.get(
      env.ip +
        apiPaths.api.root +
        apiPaths.api.workflowChartDataSet +
        `${workFlowId}`
    );
  }
  schedulingWorkflow(workflowName: any) {
    let body = {
      workflow_name: workflowName,
    };
    return this.httpClient.post(
      env.ip + apiPaths.dataload.root + apiPaths.dataload.schedulingWorkflow,
      body
    );
  }

  jobManualSync(syncData: any): Observable<object> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    return this.httpClient.post(
      env.ip + apiPaths.dataload.root + apiPaths.dataload.jobManualRun,
      syncData,
      httpOptions
    );
  }
  queryInsights(rule_id: any, project_id: any, table_schema: any) {
    return this.httpClient.get(
      env.ip +
        apiPaths.api.root +
        apiPaths.api.queryInsights +
        `${rule_id}` +
        '&project_id=' +
        `${project_id}` +
        '&table_schema=' +
        `${table_schema}`
    );
  }
  goldQueryInsights(rule_id: any, project_id: any) {
    return this.httpClient.get(
      env.ip +
        apiPaths.api.root +
        apiPaths.api.goldQueryInsightsTreeData +
        `${rule_id}` +
        '&project_id=' +
        `${project_id}`
    );
  }
  queryInsightsTreeData(rule_id: any, project_id: any, table_schema: any) {
    let body = {
      project_id: project_id,
      rule_id: rule_id,
    };
    return this.httpClient.post(
      env.ip + apiPaths.api.root + apiPaths.api.queryInsightsTreeData,
      body
    );
  }
  previewDataQueryInsight(
    columns: any,
    project_id: any,
    tableSchema: any,
    tableName: any,
    endDate: any,
    startDate: any
  ) {
    return this.httpClient.get(
      env.ip +
        apiPaths.api.root +
        apiPaths.api.previewDataQueryInsights +
        `${columns}` +
        '&project_id=' +
        `${project_id}` +
        '&table_schema=' +
        `${tableSchema}` +
        '&table_name=' +
        `${tableName}` +
        '&to_date=' +
        `${endDate}` +
        '&from_date=' +
        `${startDate}`
    );
  }
  pastFiveDagRUns(projectId: any) {
    return this.httpClient.get(
      `${env.ip}` +
        `${apiPaths.dataload.root}` +
        `${apiPaths.dataload.pastFiveAirFlowDagRuns}` +
        `${projectId}`
    );
  }
  workFlowSkipDates(data: any) {
    let body = {
      data: data,
    };
    return this.httpClient.patch(
      env.ip + apiPaths.api.root + apiPaths.api.saveWorkFlowTransition,
      body
    );
  }

  exportAuditPdf(id: any, data: any) {
    if (data['type'] == 'csv') {
      return this.httpClient.post(
        env.ip + apiPaths.api.root + apiPaths.api.exportAuditPdf + id,
        data
      );
    } else if (data['type'] == 'pdf')
      return this.httpClient.post(
        env.ip + apiPaths.api.root + apiPaths.api.exportAuditPdf + id,
        data,
        {
          responseType: 'blob',
        }
      );
  }

  goldLayerReport(id: any, data: any) {
    return this.httpClient.post(
      `${env.ip}` +
        `${apiPaths.api.root}` +
        `${apiPaths.api.goldLayerReport}` +
        `${id}`,
      data
    );
  }

  queryInsightReport(exportData: any, project_id: any) {
    return this.httpClient.post(
      env.ip +
        apiPaths.api.root +
        apiPaths.api.queryInsightReport +
        `${project_id}`,
      exportData
    );
  }

  uploadXSDFile(event: any, project_name: any) {
    let uploadSourceFile = new FormData();
    uploadSourceFile.append('file', event.target.files[0]);
    uploadSourceFile.append('file_name', event.target.files[0].name);
    uploadSourceFile.append('file_type', event.target.files[0].type);
    uploadSourceFile.append('upoload_layer', 'True');
    uploadSourceFile.append('dump_layer', 'False');
    uploadSourceFile.append('transformation_layer', 'False');
    uploadSourceFile.append('project_name', project_name);

    if (event.target.files[0]) {
      return this.httpClient.post(
        env.ip + apiPaths.api.root + apiPaths.api.xsdupload,
        uploadSourceFile
      );
    }
  }

  getTableAndXsdColumns(project_id, file_name, table_name) {
    return this.httpClient.get(
      env.ip +
        apiPaths.api.root +
        apiPaths.api.getXsdColumns +
        '?project_id=' +
        project_id +
        '&XSDfilename=' +
        `${file_name}` +
        '&tablename=' +
        `${table_name}`
    );
  }

  generateXMLwithXSD(projectID, tableColumns, xsdColumns, tableName) {
    let generateXML = {
      data: {
        project_id: projectID,
        table_columns: tableColumns,
        xsd_columns: xsdColumns,
        table_name: tableName,
      },
    };

    return this.httpClient.post(
      env.ip + apiPaths.api.root + apiPaths.api.generateXMLwithXSD,
      generateXML
    );
  }
  getNotifications(userId: any) {
    return this.httpClient.get(
      env.ip +
        apiPaths.api.root +
        apiPaths.api.applicationNotifications +
        `${userId}`
    );
  }
  markAsSeen(user_id: any, body: any) {
    return this.httpClient.patch(
      env.ip + apiPaths.api.root + apiPaths.api.markSeenNotifications,
      body
    );
  }
}
