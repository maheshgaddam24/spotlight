import { Injectable } from '@angular/core';
import { BehaviorSubject,Observable,Subject } from 'rxjs';

@Injectable()
export class AppObservable {
  static getDagRunId(dag_run_id: any) {
    throw new Error('Method not implemented.');
  }
  dag_run_ID$ = new BehaviorSubject<any>('');
  setDagRunId(dagId: any) {
    this.dag_run_ID$.next(dagId);
  }
  getDagRunID() {
    return this.dag_run_ID$.asObservable();
  }
  private _listners = new Subject<any>();
  listen(): Observable<any> {
    return this._listners.asObservable();
  }
  filter(filterBy: string) {
    this._listners.next(filterBy);
  }
  dataBase_source_Id$ = new BehaviorSubject<any>('');
  setDataBase_source_Id$(source_Id: any) {
    this.dataBase_source_Id$.next(source_Id);
  }
  getDataBase_source_Id$() {
    return this.dataBase_source_Id$.asObservable();
  }
  dataBase_connection_Id$ = new BehaviorSubject<any>('');
  setDataBase_connection_Id$(connection_Id: any) {
    this.dataBase_connection_Id$.next(connection_Id);
  }
  getDataBase_connection_Id$() {
    return this.dataBase_connection_Id$.asObservable();
  }
  dataBaseSelectedTables$ = new BehaviorSubject<any>('');
  setDataBaseSelectedTables$(selectedTables: any) {
    this.dataBaseSelectedTables$.next(selectedTables);
  }
  getDataBaseSelectedTables$() {
    return this.dataBaseSelectedTables$.asObservable();
  }
  restApiFrom$ = new BehaviorSubject<any>('');

  setRestApiFrom$(apiFrom: any) {
    this.restApiFrom$.next(apiFrom);
  }
  getRestApiFrom$() {
    return this.restApiFrom$.asObservable();
  }
  dataTypeSelect$ = new BehaviorSubject<any>('');
  setDataTypeSelect$(dataType: any) {
    this.dataTypeSelect$.next(dataType);
  }
  getDataTypeSelect$() {
    return this.dataTypeSelect$.asObservable();
  }
  alertSubmit$ = new BehaviorSubject<any>('');
  setAlertSubmit$(responseSubmit: any) {
    this.alertSubmit$.next(responseSubmit);
  }
  getAlertSubmit$() {
    return this.alertSubmit$.asObservable();
  }
  alertColumnName$ = new BehaviorSubject<any>('');
  setAlertColumnName$(columnName: any) {
    this.alertColumnName$.next(columnName);
  }
  getAlertColumnName$() {
    return this.alertColumnName$.asObservable();
  }

  dataQualityFinalTable$ = new BehaviorSubject<any>('');
  setDataQualityFinalTable$(finalTable: any) {
    this.dataQualityFinalTable$.next(finalTable);
  }
  getDataQualityFinalTable$() {
    return this.dataQualityFinalTable$.asObservable();
  }
  dataSourcetable$ = new BehaviorSubject<any>('');
  setDataSourceTable$(finalTable: any) {
    this.dataSourcetable$.next(finalTable);
  }
  getDataSourceTable$() {
    return this.dataSourcetable$.asObservable();
  }
  userName$ = new BehaviorSubject<any>('');
  setUserName$(name: any) {
    this.userName$.next(name);
  }
  getUserName$() {
    return this.userName$.asObservable();
  }
  joinSilverLayerTables$ = new BehaviorSubject<any>('');
  setJoinSilverLayerTables$(tableNames: any) {
    this.joinSilverLayerTables$.next(tableNames);
  }
  getJoinSilverLayerTables$() {
    return this.joinSilverLayerTables$.asObservable();
  }
  projectId$ = new BehaviorSubject<any>('');
  setProjectId$(projectId: any) {
    this.projectId$.next(projectId);
  }
  getProjectId$() {
    return this.projectId$.asObservable()
  }
  projectName$ = new BehaviorSubject<any>('');
  setProjectName$(projectName: any) {
    this.projectName$.next(projectName);
  }
  getProjectName$() {
    return this.projectName$.asObservable()
  }
  dataInsertUrl$= new BehaviorSubject<any>('');
  setDataInsertUrl$(dataInsertUrl: any) {
    this.dataInsertUrl$.next(dataInsertUrl);
  }
  getDataInsertUrl$() {
    return this.dataInsertUrl$.asObservable()
  }
  changesDetection$=new BehaviorSubject<any>("");
  setChangesDetection$(changesDetection: any) {
    this.changesDetection$.next(changesDetection);
  }
  getChangesDetection$() {
    return this.changesDetection$.asObservable()
  }
  bronzeSilver$=new BehaviorSubject<any>("new");
  setBronzeSilver$(bronzeSilver: any) {
    this.bronzeSilver$.next(bronzeSilver);
  }
  getBronzeSilver$() {
    return this.bronzeSilver$.asObservable()
  }
  activeEditWorkbench$=new BehaviorSubject<any>("new");
  setActiveEditWorkbench$(bronzeSilver: any) {
    this.activeEditWorkbench$.next(bronzeSilver);
  }
  getActiveEditWorkbench$() {
    return this.activeEditWorkbench$.asObservable()
  }
  saveSilveryGoldRules$=new BehaviorSubject<any>([]);
  setSaveSilveryGoldRules$(silverGold: any) {
    this.saveSilveryGoldRules$.next(silverGold);
  }
  getSaveSilveryGoldRules$() {
    return this.saveSilveryGoldRules$.asObservable()
  }
  editQueryBuilder$=new BehaviorSubject<any>("not previous");
  setEditQueryBuilder$(silverGold: any) {
    this.editQueryBuilder$.next(silverGold);
  }
  getEditQueryBuilder$() {
    return this.editQueryBuilder$.asObservable()
  }
  silverGold$=new BehaviorSubject<any>("");
  setSilverGold$(silverGold: any) {
    this.silverGold$.next(silverGold);
  }
  getSilverGold$() {
    return this.silverGold$.asObservable()
  }
  sqlStatement$=new BehaviorSubject<any>("");
  setSqlStatement(sql: any) {
    this.sqlStatement$.next(sql);
  }
  getSqlStatement() {
    return this.sqlStatement$.asObservable()
  }
  perviousURL$=new BehaviorSubject<any>("");
  setPreviousURL(queryBuilder: any) {
    this.perviousURL$.next(queryBuilder);
  }
  getPreviousURL() {
    return this.perviousURL$.asObservable()
  }
}
