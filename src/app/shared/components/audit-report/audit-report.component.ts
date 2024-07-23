import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HotToastService } from '@ngneat/hot-toast';
import { saveAs } from 'file-saver';
import { toastMessages } from '../../Config/toastr-messages';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-audit-report',
  templateUrl: './audit-report.component.html',
  styleUrls: ['./audit-report.component.scss'],
})
export class AuditReportComponent implements OnInit {
  customDateRange: boolean = false;
  auditReport: any;
  downloadButtons: boolean = false;
  exportCSVAudits: any;
  range: FormGroup;
  reportType: boolean = false;
  auditReportForm = {};
  selectedValue: string;

  // selectedOption:any="1"
  constructor(private toastService: HotToastService,
    public dialogRef: MatDialogRef<AuditReportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, public service: ApiService,
  ) {
    this.range = new FormGroup({
      start: new FormControl<Date | null>(null),
      end: new FormControl<Date | null>(null),
    });
  }

  ngOnInit(): void {
    this.exportCSVAudits = this.data.csv;
  }

  radioSelected(e: any) {
    this.auditReport = e.value;
    if (this.auditReport == 1) {
      this.selectedValue = null;
      this.customDateRange = false;
      this.downloadButtons = true;
      this.auditReportForm = { "data": 'All', "type": '' }
      this.reportType = true
    } else if (this.auditReport == 2) {
      this.selectedValue = null;
      this.customDateRange = true;
      this.downloadButtons = false;
      this.reportType = true;
      this.auditReportForm = { "data": '', "type": '' }
    }
  }

  exportAuditPDF() {
    saveAs(this.data.pdf, 'audit.pdf');
  }

  applyDateRange(event: any) {
  }

  radioSelectedType(e: any) {
    if (e.value == "CSV") {
      this.auditReportForm["type"] = "csv"
    }
    else if (e.value == "PDF") {
      this.auditReportForm["type"] = "pdf"
    }
  }

  dateRange() {
    this.auditReportForm["data"] = this.range.value
  }

  report() {
    if (this.auditReportForm["type"] == "csv") {
      this.service.exportAuditPdf(this.data["projectId"], this.auditReportForm).pipe(
        this.toastService.observe({
          loading: toastMessages.generatingAudit,
          success: (s) => toastMessages.generatedAuditSuccessfully,
          error: (e) => toastMessages.errorGeneratingAudit,
        })
      )
        .subscribe((res: any) => {
          saveAs(res, `${this.data["projectId"]}` + '.csv');
        })
    }
    else if (this.auditReportForm["type"] == "pdf") {
      this.service.exportAuditPdf(this.data["projectId"], this.auditReportForm).pipe(
        this.toastService.observe({
          loading: toastMessages.generatingAudit,
          success: (s) => toastMessages.generatedAuditSuccessfully,
          error: (e) => toastMessages.errorGeneratingAudit,
        })
      ).subscribe((blob: Blob) => {
          saveAs(blob, `${this.data["projectId"]}` + '.pdf');
        })
    }
  }


  disableButton(): boolean {
    return false
  }
}
