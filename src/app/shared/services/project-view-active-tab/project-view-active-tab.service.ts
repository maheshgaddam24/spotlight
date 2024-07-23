import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProjectViewActiveTabService {
  activeTab: string = 'Define Pipelines';

  constructor() { }

  setActiveTab(tab: any) {
    this.activeTab = tab;
  }

  getActiveTab() {
    return this.activeTab;
  }
}
