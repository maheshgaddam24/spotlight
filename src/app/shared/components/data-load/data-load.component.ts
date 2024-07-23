import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import { PopupDataService } from '../../services/popup-data/popup-data-service.service';

@Component({
  selector: 'app-data-load',
  templateUrl: './data-load.component.html',
  styleUrls: ['./data-load.component.scss'],
})
export class DataLoadComponent implements OnInit {
  tableNames: string[] = [];
  tableColumns: any[] = [];

  selectedLoadType: { [key: string]: { loadType: string } } = {};
  formGroup: FormGroup;
  transferredData: any;
  button = 'CONFIRM';
  isLoading = false;
  constructor(
    public dialogRef: MatDialogRef<DataLoadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    public modalService: NgbModal,
    private popupDataService: PopupDataService,
    private formBuilder: FormBuilder,
    private toastService: HotToastService
  ) {}

  ngOnInit(): void {
    this.tableNames = Object.keys(this.data['table_names']['columnsFilter']);
    this.formGroup = this.formBuilder.group({});
    for (let i = 0; i < this.tableNames.length; i++) {
      const tableName = this.tableNames[i];
      this.formGroup.addControl(
        `loadType${i}`,
        this.formBuilder.control('full')
      );
      this.formGroup.addControl(`columns${i}`, this.formBuilder.control(null));
      this.selectedLoadType[tableName] = { loadType: 'full' };
    }

    this.formGroup.valueChanges.subscribe((formValue) => {
      for (let i = 0; i < this.tableNames.length; i++) {
        const tableName = this.tableNames[i];
        const loadType = formValue[`loadType${i}`];
        this.selectedLoadType[tableName] = { loadType };
      }
    });
    // setTimeout(() => {
    //   this.toastService.warning(
    //     'Initially, the load type will be full. For the next workflow run, if you require the incremental load type, select the primary column to move with.',
    //     {
    //       autoClose: false,
    //       dismissible: true,
    //     }
    //   );
    // }, 5000);
  }

  getColumnNames(tableName: string): string[] {
    const columns: string[] =
      this.data['table_names']['columnsFilter'][tableName]?.map(
        (column) => column[0]
      ) || [];
    return columns;
  }

  resetColumns(index: number): void {
    const columnsControl = this.formGroup.get(`columns${index}`);
    if (columnsControl) {
      columnsControl.setValue(null);
    }
  }

  table() {
    this.isLoading = true;
    this.button = 'saving';

    setTimeout(() => {
      this.isLoading = false;
      const selectedData = {};
      for (let i = 0; i < this.tableNames.length; i++) {
        const tableName = this.tableNames[i];
        const loadType = this.formGroup.get(`loadType${i}`)?.value;
        if (loadType === 'incremental') {
          const selectedColumn = this.formGroup.get(`columns${i}`)?.value;
          selectedData[tableName] = {
            loadType: loadType,
            column: selectedColumn,
          };
        } else {
          selectedData[tableName] = {
            loadType: loadType,
          };
        }
      }

      this.dialog.closeAll();
      this.data['load type'] = selectedData;
    }, 5000);
  }

  
}
