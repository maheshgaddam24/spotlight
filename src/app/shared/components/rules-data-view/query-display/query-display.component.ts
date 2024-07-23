import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HotToastService } from '@ngneat/hot-toast';
import { format } from 'sql-formatter';

@Component({
  selector: 'app-query-display',
  templateUrl: './query-display.component.html',
  styleUrls: ['./query-display.component.scss']
})
export class QueryDisplayComponent implements OnInit {
  copyIcon:any='content_copy';
  constructor(
    public dialogRef: MatDialogRef<QueryDisplayComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    // public service: ApiService,
    private toastService: HotToastService,
    public dialog: MatDialog,
    private clipboard: Clipboard,
  ) { }

  query: any;
  ngOnInit(): void {
    this.query = format(this.data.query, { language: 'sql' })
  }
  copyToClipboard(query: any) {
    this.clipboard.copy(query);
    this.toastService.success("Query Copied");
  }
}
