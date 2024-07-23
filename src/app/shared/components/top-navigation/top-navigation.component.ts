import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { commonConst } from '../../Config/common-const';
import { navigationRoutes } from '../../Config/navigation-routes';
import { AppObservable } from '../../app-observable';
import { trigger, transition, style, animate } from '@angular/animations'; // Import animation functions
import { ApiService } from '../../services/api/api.service';
import { LogoutDialogComponent } from '../logout-dialog/logout-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
interface Notification {
  created_at: any;
  message: string;
  seen: boolean;
  route: string;
  date: string;
  attention: string;
}

@Component({
  selector: 'app-top-navigation',
  templateUrl: './top-navigation.component.html',
  styleUrls: ['./top-navigation.component.scss'],
})
export class TopNavigationComponent implements OnInit {
  userData: any;
  username: any;
  display: any;
  projectId: any;
  user_id: any;

  notifications: Notification[] = [];

  constructor(
    private router: Router,
    private appObservable: AppObservable,
    public service: ApiService,
    public modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.projectId = sessionStorage.getItem('project_id');
    this.userData = sessionStorage.getItem(commonConst.userData);
    this.username = JSON.parse(this.userData)?.username;
    this.user_id = JSON.parse(this.userData)?.userId;
    if (this.user_id) {
      this.getNotifications(this.user_id);
    }
  }

  homeRoute() {
    this.router.navigate([navigationRoutes.projects]);
  }

  logOut() {
    this.openDialog();
  }

  openDialog(): void {
    const modalRef = this.modalService.open(LogoutDialogComponent, {
      size: 'small',
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.data = { action: 'logout' };
  }
  get unseenNotificationCount(): number {
    return this.notifications.filter((notification) => !notification.seen)
      .length;
  }

  markAsSeen(): void {
    this.notifications.forEach((notification) => {
      notification.seen = true;
    });
    this.markAsSeenNotifications(this.user_id, this.notifications);
  }
  markAsSeenNotifications(user_id: any, seenData: any): void {
    this.service.markAsSeen(user_id, seenData).subscribe((res: any) => {});
  }

 
  routeNotification(notification: Notification): string {
     const queryParams = new URLSearchParams();
    queryParams.set('activeJobName', notification['job_name']);

    const baseUrl = window.location.origin + notification.route;
    const finalUrl = `${baseUrl}?${queryParams.toString()}`;
    return finalUrl;
  }
  setSessionDetails(notification: Notification){
    sessionStorage.setItem('project_name', notification['project_name']);
    sessionStorage.setItem('project_id', notification['project_id']);
  }
  clearNotifications(): void {
    for (let i = this.notifications.length - 1; i >= 0; i--) {
      setTimeout(() => {
        this.notifications.splice(i, 1);
      }, (this.notifications.length - 1 - i) * 500);
    }
  }
  getNotifications(user_id: any) {
    this.service.getNotifications(user_id).subscribe((res: any) => {
      this.notifications = res;
    });
  }
}
