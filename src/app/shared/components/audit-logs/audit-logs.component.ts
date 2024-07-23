import { Component, Input, OnInit } from '@angular/core';
import { AuditReportComponent } from '../audit-report/audit-report.component';
import { WebsocketService } from '../../services/websockets/websocket.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AppObservable } from '../../app-observable';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../services/api/api.service';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-audit-logs',
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.scss']
})
export class AuditLogsComponent implements OnInit {
  @Input() projectId: any;
  @Input() layer_name: any;
  @Input() status: any;
  @Input() view: any;
  @Input()exportEnable:boolean

  
  createNewProjectForm: FormGroup;
  projectListData: any;
  userName: any;
  userData: any;
  userId: any;
  invalidFields: any[] = [];
  isEdit = false;
  editProjectBody: any;
  projectData: any = [];
  goldLayerTablesDataList: any;
  selectedAuditLogsId: any;
  auditLogs: any;
  HideLogsText: boolean = true;
  hideFetchingTablesText: boolean = true;
  auditKeys: any;
  exportCSVAudits: any;
  exportPdf: any;
  auditProjectId: any;
  exportReport: boolean = false;
  searchText: string = '';
  randomColor: string;
  bindingValue: number = 1;
  lastColorIndex: number = -1;
  private socket: WebSocket;
  projectLoader: boolean = false;
  failedWorkflowCount: number = 10;
  exportFullAudit:boolean;
  colors: string[] = [
    '#FEEEB8',
    '#B8FEE5',
    '#B8FAFE',
    '#FFCDBD',
    '#F9D6FF',
    '#FFDBBA',
    '#E0F0FE',
    '#E0F0FE',
  ];
  ngOnInit(): void {    
    this.exportFullAudit=this.exportEnable
    this.loadAudit(this.projectId)
  }

  constructor(
    private toastService: HotToastService,
    public service: ApiService,
    public modalService: NgbModal,
    private httpClient: HttpClient,
    private router: Router,
    public formBuilder: FormBuilder,
    private appObservable: AppObservable,
    private route: ActivatedRoute,
    public dialog: MatDialog, private websocketService: WebsocketService
  ) {}

  closeCreateProjectModal() {
    this.exportReport = false;
    this.auditLogs = [];
    this.HideLogsText = true;
    this.modalService.dismissAll();
    this.createNewProjectForm.get('project_name')?.reset();
    this.createNewProjectForm.get('description')?.reset();
  }


  loadAudit(projectId: any) {
    const auditLogs ={
      view:this.view,
      layer:this.layer_name,
      statusView:this.status
    }
    this.auditProjectId = projectId;
    this.hideFetchingTablesText = false;
    this.service.getAuditLogsData(projectId,auditLogs).subscribe((res) => {
      this.auditLogs = res;
      this.auditKeys = this.auditLogs.map((key: any) =>
        Object.keys(key.RECORD_COUNT)
      );
      if (this.auditLogs.length === 0) {
        this.HideLogsText = false;
        this.hideFetchingTablesText = true;
      } else {
        this.exportReport = true;
        this.HideLogsText = true;
        this.hideFetchingTablesText = true;
      }
    });
  }
  openDialog(
    enterAnimationDuration: string,
    exitAnimationDuration: string
  ): void {
    this.dialog.open(AuditReportComponent, {
      width: '520px',
      enterAnimationDuration,
      exitAnimationDuration,
      disableClose: true,
      data: {
        projectId: this.auditProjectId,
        csv: this.exportCSVAudits,
        pdf: this.exportPdf,
      },
    });
  }
  layerChange(layer:string){
    if(layer === 'Bronze' || layer === 'Bronze_Layer' || layer === 'BRONZE_LAYER'){
      return 'Raw scheduler'
    } else  if(layer === 'Silver' || layer === 'Silver_Layer' || layer === 'SILVER_LAYER'){
      return 'Refined scheduler'
    }else  if(layer === 'Gold' || layer === 'Gold_Layer'  || layer === 'GOLD_LAYER'){
      return 'Report scheduler'
    }

  }
}
