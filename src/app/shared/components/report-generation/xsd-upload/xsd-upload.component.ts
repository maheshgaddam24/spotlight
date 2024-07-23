import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import { saveAs } from 'file-saver';
import { toastMessages } from 'src/app/shared/Config/toastr-messages';
import { ApiService } from 'src/app/shared/services/api/api.service';

@Component({
  selector: 'app-xsd-upload',
  templateUrl: './xsd-upload.component.html',
  styleUrls: ['./xsd-upload.component.scss']
})
export class XsdUploadComponent implements OnInit {
  project_id: any;
  table_name: any;
  xsdColumns: any[] = [];
  tableColumns: any[] = [];
  matchedCol: any;
  isColumnMatched: boolean = false;
  selectedOptions: any[] = [];

  constructor(
    public service: ApiService,
    private toastService: HotToastService,
    public modalService: NgbModal,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.project_id = sessionStorage.getItem('project_id')
    let file_name = this.data.file_name;
    this.table_name = this.data.table_name
    this.service.getTableAndXsdColumns(this.project_id, file_name, this.table_name).subscribe((res: any) => {
      this.xsdColumns = res.xsd_colums.map(item => item.toUpperCase());
      this.tableColumns = res.table_columns;
      this.tableColumns.push('IGNORE');
    })
  }

  GenerateXML() {
    for (let i = 0; i < this.xsdColumns.length; i++) {
      let option = (document.getElementById(`selectedOption-${i}`) as HTMLInputElement).value;
      this.selectedOptions.push(option)
    }
    this.service.generateXMLwithXSD(this.project_id, this.selectedOptions, this.xsdColumns, this.table_name) .pipe(
      this.toastService.observe({
        loading: toastMessages.generatingReport,
        success: (s) => toastMessages.generatedReportSuccessfully,
        error: (e) => e,
      })
    )
    .subscribe((res:any)=>{
      saveAs(res,  this.table_name + "." + 'xml');
      this.modalService.dismissAll();
    });

  }

  closeGetDataModal() {
    this.modalService.dismissAll();
  }

}
