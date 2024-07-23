import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';

@Component({
  selector: 'app-data-quality',
  templateUrl: './data-quality.component.html',
  styleUrls: ['./data-quality.component.scss'],
})
export class DataQualityComponent implements OnInit {
  columnName: any;
  checkApplying: any;
  lengthInput: any;
  customFormat: string;

  constructor(
    public dialogRef: MatDialogRef<DataQualityComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  ngOnInit(): void {
    this.columnName = this.data.columnName;
    this.checkApplying = this.data.check;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  closeDialogWithData(): void {    
    if (this.checkApplying === 'Length Check') {
      const data = {
        length: Number(this.lengthInput),
      };
      this.dialogRef.close(data);
    } else if (this.checkApplying === 'Decimal Check') {
      const data = {
        decimal: 
        this.lengthInput,
      };
      this.dialogRef.close(data);
    } else if (this.checkApplying === 'Date Check'){
      let format = '';
      format=this.lengthInput

      const data = {
        dateFormat :  format
      };
      this.dialogRef.close(data);
    }
  }

  onSelectChange(event: any) {
    this.customFormat = ''; 
    this.lengthInput = event.value; 
}

onInputChange() {
    this.lengthInput = this.customFormat;
}

}
