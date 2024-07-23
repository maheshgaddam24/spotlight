import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ApiService } from '../shared/services/api/api.service';
import { catchError } from 'rxjs';
import { toastMessages } from '../shared/Config/toastr-messages';
import { HotToastService } from '@ngneat/hot-toast';
import { map } from 'lodash';
import { ProjectViewActiveTabService } from '../shared/services/project-view-active-tab/project-view-active-tab.service';

@Component({
  selector: 'app-project-view',
  templateUrl: './project-view.component.html',
  styleUrls: ['./project-view.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state(
        'void',
        style({
          opacity: 0,
          transform: 'scale(0.9)',
        })
      ),
      transition(':enter, :leave', [animate(300)]),
    ]),
    trigger('expandCollapse', [
      state(
        'open',
        style({
          height: '*',
        })
      ),
      state(
        'closed',
        style({
          height: '0',
        })
      ),
      transition('open <=> closed', animate('300ms ease-in-out')),
    ]),
  ],
})

export class ProjectViewComponent implements OnInit {
  cardState: 'open' | 'closed' = 'closed';
  projectId: string;
  showSilverLayer: boolean = false;
  activeLink: string;
  showDataLineage = true;
  links: any[] = [
    {
      name: 'Define Pipelines',
      icon: '../../assets/images/define pipeline.svg',
    },
    {
      name: 'Execution Statistics',
      icon: '../../assets/images/execution statistics.svg',
    },
  ];
  zoomLevel = 0.73;
  active: boolean = true;
  cards: any[];
  projectName: string;
  layer_name: string;
  loading: boolean = true;
  screenChange: any = {};
  projects: any;
  selectedProject: string;
  showDropdown = false;
  triggerAuditLogs: boolean = false;
  jobLayerName: any;
  jobStatus: any;

  constructor(
    private router: Router,
    private toastService: HotToastService,
    public service: ApiService,
    public activeTabService: ProjectViewActiveTabService
  ) {
    this.projectId = sessionStorage.getItem('project_id');
    this.projectName = sessionStorage.getItem('project_name');
  }

  ngOnInit(): void {
    this.activeLink = this.activeTabService.getActiveTab();
    this.screenChange = window.matchMedia('(max-width: 1535px)');
    if (this.screenChange.matches) {
      this.zoomLevel = 0.60;
    }
    this.screenChange = window.matchMedia('(min-width: 1727px) and (max-width: 1729px)');
    if (this.screenChange.matches) {
      this.zoomLevel = 0.83;
    }
    this.projectList();
    this.getProjectViewStatics(this.projectId).subscribe(
      (projectViewStatics: any[]) => {
        this.cards = projectViewStatics;
      }
    );
  }

  get zoomTransform() {
    return `scale(${this.zoomLevel})`;
  }

  zoomIn() {
    this.zoomLevel += 0.1;
  }

  zoomOut() {
    if (this.zoomLevel > 0.1) {
      this.zoomLevel -= 0.1;
    }
  }

  resetZoom() {
    if (this.screenChange.matches) {
      this.zoomLevel = 0.7;
      const element = document.getElementById('cards-container');
      element.style.transform = 'translate3d(0px, 0px, 0px)';
    } else {
      this.zoomLevel = 0.73;
      const element = document.getElementById('cards-container');
      element.style.transform = 'translate3d(0px, 0px, 0px)';
    }
  }
  onSelectChange(event: any) {
    const project = this.projects.find(
      (project) => project.project_name === event.target.value
    );
    sessionStorage.setItem('project_name', event.target.value);
    sessionStorage.setItem('project_id', project.id);
    this.projectId = sessionStorage.getItem('project_id');
    this.projectName = sessionStorage.getItem('project_name');
    this.showDataLineage = false;
    setTimeout(() => {
      this.showDataLineage = true;
    }, 0);
    this.getProjectViewStatics(this.projectId).subscribe(
      (projectStatics: any[]) => {
        this.cards = projectStatics;
      }
    );
  }

  routeHome() {
    return `/projects`;
  }
  auditLogs(jobLayerName: any, jobStatus: any) {
    this.triggerAuditLogs = false;
    setTimeout(() => {
      this.triggerAuditLogs = true;
    }, 0);
    this.jobLayerName = jobLayerName;
    this.jobStatus = jobStatus;
  }
  projectList() {
    this.service
      .getSourceList()
      .pipe(
        catchError((Error) => {
          this.toastService.error(toastMessages.HttpRequestError);
          return Error(Error);
        })
      )
      .subscribe((res: any) => {
        this.loading = false;
        this.projects = res.Data.map((item) => ({
          id: item.id,
          project_name: item.project_name,
        }));
        this.selectedProject = this.projectName;
      });
  }
  routeHref(title: string): void {
    let route: string;
    switch (title) {
      case 'Raw Scheduler':
        route = `staging-view/Raw Scheduler/${this.projectId}`;
        break;
      case 'Staging Datasets':
        route = `staging-view/Staging Datasets/${this.projectId}`;
        break;
      case 'Raw Sources':
        route = `staging-view/Raw Sources/${this.projectId}`;
        break;
      case 'Refined Datasets':
        this.layer_name = 'bronze_layer';
        route = `/query-builder/${this.projectId}/${this.layer_name}`;
        break;
      case 'Refined Workflows':
        this.layer_name = 'silver_layer';
        route = `/rules/${this.projectId}/${this.layer_name}`;
        break;
      case 'Report Workflows':
        this.layer_name = 'gold_layer';
        route = `/rules/${this.projectId}/${this.layer_name}`;
        break;
      case 'Report Datasets':
        this.layer_name = 'silver_layer';
        route = `/query-builder/${this.projectId}/${this.layer_name}`;
        break;
      case 'Report Viewer':
        route = `/goldlayer-dashboard/${this.projectId}`;
        break;
      case 'Schedule':
      case 'Report Scheduler':
        this.layer_name = 'gold_layer';
        route = `/workflow-dashboard/${this.projectId}/${this.layer_name}`;
        break;
      case 'Refined Scheduler':
        this.layer_name = 'silver_layer';
        route = `/workflow-dashboard/${this.projectId}/${this.layer_name}`;
        break;
      default:
        route = '/projects';
        break;
    }
    this.router.navigate([route]);
  }

  navigateTo(layer: string) {
    this.showSilverLayer = !this.showSilverLayer;
    this.toggleCardState();
  }
  toggleCardState() {
    this.cardState = this.cardState === 'open' ? 'closed' : 'open';
  }  getProjectViewStatics(projectId: string) {
    return this.service.getProjectViewStatics(projectId);
  }

  switchTab(){
    this.activeTabService.setActiveTab(this.activeLink)
  }
}
