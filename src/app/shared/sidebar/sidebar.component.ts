import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { JoyrideService } from 'ngx-joyride';

@Component({
  selector: 'my-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  @Input() isExpanded: boolean = false;
  @Output() toggleSidebar: EventEmitter<boolean> = new EventEmitter<boolean>();
  projectId: string;
  workflowsExpanded: boolean = false;
  ngOnInit(): void {}

  constructor(private readonly joyrideService: JoyrideService) {}
  handleSidebarToggle = () => this.toggleSidebar.emit(!this.isExpanded);

  getProjectIdFromSessionStorage(): string | null {
    this.projectId = sessionStorage.getItem('project_id');
    return this.projectId;
  }
  toggleWorkflows() {
    this.workflowsExpanded = !this.workflowsExpanded;
  }
  help() {
    this.workflowsExpanded = true;
    this.joyrideService.startTour({
      steps: ['step1', 'step3', 'step4', 'step5', 'step6'],
      stepDefaultPosition: 'right',
      themeColor: '#212f23',
    });
  }
}
