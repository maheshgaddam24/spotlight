import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import { toastMessages } from 'src/app/shared/Config/toastr-messages';
import { ApiService } from 'src/app/shared/services/api/api.service';

@Component({
  selector: 'app-scheduling-bronze',
  templateUrl: './scheduling-bronze.component.html',
  styleUrls: ['./scheduling-bronze.component.scss'],
})
export class SchedulingBronzeComponent implements OnInit {
  @ViewChild('ruleSelectRaw') ruleSelectRaw: MatSelect;
  @ViewChild('ruleSelectBronze') ruleSelectBronze: MatSelect;
  @ViewChild('ruleSelectSolver') ruleSelectSilver: MatSelect;
  projectId: string;
  Minutes: any;
  checked:boolean=false
  ngOnInit(): void {
    this.projectId = sessionStorage.getItem('project_id');
  }
  constructor(
    public dialogRef: MatDialogRef<SchedulingBronzeComponent>,
    private service: ApiService,
    private toastService: HotToastService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  frequency: any;
  selectedDateTime = '';
  selectedDay = '';
  selectedTime = '';
  dataDriftValue = '';

  repeatMode(e: any) {
    this.frequency = e;
  }

  dayName(e: any) {
    this.selectedDay = e;
  }

  dateTime(e: any) {
    this.selectedDateTime = e;
  }

  time(e: any) {
    this.selectedTime = e;
  }
  driftDataValue(e: any) {
    this.dataDriftValue = e;
  }
  getMin(e: any) {
    this.Minutes = e;
  }
  disableButton(): boolean {
    switch (this.frequency) {
      case 'Daily':
        return this.selectedTime ? false : true;
      case 'Weekly':
        return this.selectedDay && this.selectedTime ? false : true;
      case 'Monthly':
        return this.selectedDateTime ? false : true;
      case 'Minutes':
        return this.Minutes ? false : true;
      case 'Hourly':
        return false;
      default:
        return true;
    }
  }

  submitScheduling() {
    var raw = JSON.stringify({
      id: this.data.dataSourceID,
      load_type: this.data.loadType,
      incremental_column: this.data.primaryKey,
      sync_type: this.data.syncType,
      date: this.selectedDateTime,
      day: this.selectedDay,
      frequency: this.frequency,
      time: this.selectedTime,
      drift_percent: this.dataDriftValue,
      Minutes: this.Minutes,
      datasource_name:this.data.data_source,
      // is_event_based: this.checked
    });
    this.service
      .scheduleDataSources(raw, this.projectId)
      .pipe(
        this.toastService.observe({
          loading: toastMessages.savingRule,
          success: (s) => toastMessages.savedRuleSuccessfully,
          error: (e) => toastMessages.errorSaving,
        })
      )
      .subscribe((res: any) => {
        this.dialogRef.close("data saved");
      });
  }
}
