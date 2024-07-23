import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-data-journey',
  templateUrl: './data-journey.component.html',
  styleUrls: ['./data-journey.component.scss'],
})
export class DataJourneyComponent implements OnInit {
  @Output() childButtonClick: EventEmitter<void> = new EventEmitter<void>();
  @Input() workFlowData: any[] = [];
  autoRefreshInterval: Subscription;
  cards:any=[
    {
      title: 'Staging Datasets',
      description: "Import data from SQL, Oracle DB's or files",
      status : 'Queued',
      time:'',
      query:{},
    },
    {
      title: 'Refined Datasets',
      description: 'View data tables, columns of import data in staging Datasets',
      status : 'Queued',
      time:'',
      query:{}
    },
    {
      title: 'Report Datasets',
      description: 'Schedule workflows as jobs and view execution history',
      status: 'Queued',
      time:'',
      query:{}
    }   
  ];
  currentCardIndex: number = 0;
  autoRefreshEnabled = false;
  ngOnInit(): void {   
    this.refreshData();
  }
  refreshData(){
    this.updateStatus();
  }
  updateStatus(): void {
    const currentCard = this.cards[this.currentCardIndex];

    switch (currentCard.status) {
      case 'Success':
        currentCard.status = 'Queued';
        break;
      case 'Queued':
        currentCard.status = 'Running';
        break;
      case 'Running':
        currentCard.status = 'Success';
        break;
      default:
        break;
    }

    this.currentCardIndex = (this.currentCardIndex + 1) % this.cards.length;
  }
  dataJourneyChange() {
    this.childButtonClick.emit();
  }
  stopAutoRefresh() {
    if (this.autoRefreshInterval) {
      this.autoRefreshInterval.unsubscribe();
    }
  }
  startAutoRefresh() {
    this.autoRefreshInterval = interval(5000).subscribe(() => {
      this.updateStatus();
    });
  }
  toggleAutoRefresh(event) {
    this.autoRefreshEnabled = event.checked;

    if (this.autoRefreshEnabled) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }
  syncType(syncText: any) {
    if (syncText === 'event_based_trigger') {
      return 'Event';
    } else if (syncText === 'automatic') {
      return 'Auto';
    } else if (syncText === 'manual') {
      return 'Manual';
    }
  }
}
