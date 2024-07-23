import { LocationStrategy } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { commonConst } from '../shared/Config/common-const';
import { navigationRoutes } from '../shared/Config/navigation-routes';
import { LoaderService } from '../shared/loader/loader.service';
import { ApiService } from '../shared/services/api/api.service';

@Component({
  selector: 'app-schema-data',
  templateUrl: './schema-data.component.html',
  styleUrls: ['./schema-data.component.scss'],
})
export class SchemaDataComponent implements OnInit {
  @Input() data: any;
  bronzeLayerTableData: any;
  selectedTableName: any;
  bronzeTablePreviewData: any;
  selectedProjectID: any;
  currentUrl: any;
  hideBackButton: boolean = false;
  projectId: any;
  projectName: string;
  params_staging:string;
  constructor(
    public service: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    public loader: LoaderService,
    private url: LocationStrategy,
    public modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.currentUrl = this.url.path();
    this.selectedProjectID = this.route.snapshot.params[commonConst.params_id];
    this.selectedTableName =
      this.route.snapshot.params[commonConst.params_source];
    this.projectId = sessionStorage.getItem("project_id")
    this.projectName = sessionStorage.getItem('project_name');
    this.params_staging =
    this.route.snapshot.params[commonConst.params_staging];

    if (this.currentUrl.includes('rules')) {
      this.hideBackButton = true;
      this.getGoldLayerColumnsData(this.data);
    } else {
      this.getGoldLayerColumnsData(this.selectedTableName)
    }
  }

  getGoldLayerColumnsData(tableName: any) {
    this.service
      .getBronzeLayerTableColumnsData(tableName, this.projectId)
      .subscribe((res: any) => {
        this.bronzeLayerTableData = res;
        let bronzeLayerTableName = this.bronzeLayerTableData.map((key: any) =>
          Object.keys(key)
        );
        this.bronzeTablePreviewData = bronzeLayerTableName[0].filter((item) => !item.endsWith('SPOTLIGHT_HASHID'));
      });
  }
  
  navigateDataSourceDashboard() {
    this.router.navigate([
      navigationRoutes.projectDashboard + `${this.selectedProjectID}`,
    ]);
  }

  closeGetDataModal() {
    this.modalService.dismissAll();
  }

  routeHome() {
    return `/projects`;
  }
  routeDataPipelines(){
    return `/project-view`;
  }
  routeSourceData(){
    return "staging-view/"+`${this.params_staging}/` +`${this.projectId}`;
  }
}