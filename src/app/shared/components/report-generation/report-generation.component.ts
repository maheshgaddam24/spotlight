import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import { saveAs } from 'file-saver';
import { toastMessages } from '../../Config/toastr-messages';
import { ApiService } from '../../services/api/api.service';
import { XsdUploadComponent } from './xsd-upload/xsd-upload.component';

@Component({
  selector: 'app-report-generation',
  templateUrl: './report-generation.component.html',
  styleUrls: ['./report-generation.component.scss']
})
export class ReportGenerationComponent implements OnInit {
  dividedCsv: boolean = false;
  projectId: any;
  projectName: any;
  fileType: {};
  downloadType: any;
  isUploadEnabled: boolean = false;
  tableName: any;
  uploadedFile: any;
  isOptionSelected:boolean=false

  ngOnInit(): void {
    this.projectId = sessionStorage.getItem('project_id');
    this.projectName = sessionStorage.getItem('project_name');
  }
  constructor(
    public dialogRef: MatDialogRef<ReportGenerationComponent>,
    public modalService: NgbModal,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public service: ApiService,
    private toastService: HotToastService,
    public dialog: MatDialog
  ) { }

  radioSelected(e: any) {
    this.tableName = this.data["tableName"];
    if (e.value == 'CSV') {
    this.isOptionSelected=false
      this.fileType = {
        "table_name": this.data["tableName"],
        "file_type": { "csv": '' }
      }
      this.downloadType = e.value;
      this.dividedCsv = true;
      this.isUploadEnabled = false;
    } else if (e.value === 'XML') {
      
    this.isOptionSelected=true
      this.isUploadEnabled = true;
      this.downloadType = e.value;
      this.fileType = {
        "table_name": this.data["tableName"],
        "file_type": e.value
      }
      this.dividedCsv = false;

    } else {
      
    this.isOptionSelected=true
      this.downloadType = e.value;
      this.fileType = {
        "table_name": this.data["tableName"],
        "file_type": e.value
      }
      this.dividedCsv = false;
      this.isUploadEnabled = false;
    }
  }

  radioSelectedDivided(e: any) {
    this.isOptionSelected=true
    this.fileType["file_type"]["csv"] = e.value;
  }

  generateReport() {
    this.service.goldLayerReport(this.projectId, this.fileType).pipe(
      this.toastService.observe({
        loading: toastMessages.generatingReport,
        success: (s) => toastMessages.generatedReportSuccessfully,
        error: (e) => toastMessages.errorgeneratingReport,
      })
    ).subscribe((res: any) => {
      saveAs(res["download_url"], `${this.data["tableName"]}` + "." + `${this.downloadType}`)
    })
  }

  browseFile() {
    document.getElementById('browse-input')?.click();
  }

  async onFileChange(event: any) {
    this.uploadedFile = event;
    this.service.uploadXSDFile(event, this.projectName)
      .pipe(
        this.toastService.observe({
          loading: toastMessages.uploading,
          success: (s) =>
            `${event.target.files[0].name} ` + toastMessages.uploadingSuccess,
          error: (e) => toastMessages.uploadingError,
        })
      )
      .subscribe((res: any) => {
        this.closeDialog();
        this.openXSDUploadMoadl(res.file_name)
      });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  openXSDUploadMoadl(file: any) {
    const modalRef = this.modalService.open(XsdUploadComponent, {
      size: 'xl',
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.data = {
      table_name: this.tableName,
      file_name: file
    };
  }
}
