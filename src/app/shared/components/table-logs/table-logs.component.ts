import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../services/api/api.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-table-logs',
  templateUrl: './table-logs.component.html',
  styleUrls: ['./table-logs.component.scss'],
})
export class TableLogsComponent {
  logsData: string = '';
  logsDataSafe: SafeHtml = '';
  constructor(
    private http: HttpClient,
    public service: ApiService,
    public dialogRef: MatDialogRef<TableLogsComponent>,
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.getLogFile(this.data.projectID, this.data.dataSetName);
  }

  getLogFile(projectID: any, dataSetName: any) {
    this.service.getLogFileContent(projectID, dataSetName).subscribe({
      next: (data: string) => {
        this.logsData = data.replace(/^"|"$/g, '');
        this.logsData = this.logsData.replace(/\\n/g, '\n');
        this.logsData = this.logsData
          .split('\n')
          .map((line) => {
            if (line.includes('WARNING')) {
              return `<span style="background-color: rgba(255, 170, 51, 0.431372549);
            color: brown;" >${line}</span>`;
            } else if (line.includes('ERROR')) {
              return `<span style="background-color: #ffd1dc;
            color: #8c3f54;" >${line}</span>`;
            }
            return line;
          })
          .join('\n');
        this.logsDataSafe = this.sanitizer.bypassSecurityTrustHtml(
          this.logsData
        );
      },
      error: (error: any) => {
        this.dialogRef.close();
      },
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
