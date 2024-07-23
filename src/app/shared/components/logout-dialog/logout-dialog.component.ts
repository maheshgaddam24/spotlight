import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { navigationRoutes } from '../../Config/navigation-routes';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../services/api/api.service';
import { LoaderService } from '../../loader/loader.service';
import { HotToastService } from '@ngneat/hot-toast';
import { toastMessages } from '../../Config/toastr-messages';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-logout-dialog',
  templateUrl: './logout-dialog.component.html',
  styleUrls: ['./logout-dialog.component.scss'],
})
export class LogoutDialogComponent implements OnInit {
  @Input() data: any;
  actionTitle: string = '';
  actionDescription: string = '';
  isAPICalling: boolean = false;

  constructor(
    public modalService: NgbModal,
    private router: Router,
    public activeModal: NgbActiveModal,
    private service: ApiService,
    private loadingService: LoaderService,
    private toastService: HotToastService
  ) {}
  ngOnInit() {
    if (this.data.action === 'logout') {
      this.actionTitle = 'Logout';
      this.actionDescription =
        'You are trying to logout from the application. Are you sure you want to proceed.';
    } else if (this.data.action === 'delete') {
      this.actionTitle = 'Delete';
      this.actionDescription =
        'You are trying to delete ' +
        `${this.data.project_name}` +
        '. Are you sure you want to proceed.';
    } else if (this.data.action === 'delete contributer') {
      this.actionTitle = 'Delete contributer';
      this.actionDescription = 'You are trying to delete contributer '+
      `${this.data.data}` +
      '. Are you sure you want to proceed.';
    }else if (this.data.action === 'edit contributer') {
      this.actionTitle = 'Updating Role';
      this.actionDescription = 'You are trying to update user Role to '+
      `${this.data.data}` +
      '. Are you sure you want to proceed.';
    }

  }
  onLogout(): void {
    this.isAPICalling = true;
    if (this.data.action === 'logout') {
      this.router.navigate([navigationRoutes.login]);
      sessionStorage.clear();
      this.closeLogoutModal();
    } else if (this.data.action === 'delete') {
      this.service
        .deleteDataSources(this.data.id, this.data.projectId)
        .pipe(
          this.toastService.observe({
            loading: toastMessages.deletingProject,
            success: (s) => toastMessages.deletedSuccessfully,
            error: (e) => e,
          }),
          catchError((error) => {
            this.isAPICalling = false;
            console.error('Error occurred during API call:', error);
            return of();
          })
        )
        .subscribe(() => {
          this.isAPICalling = false;
          this.activeModal.close('closed');
        });
    } else if (this.data.action === 'delete contributer' || 'edit contributer' ) {
      this.activeModal.close('closed');
    }
  
  }
  closeLogoutModal() {
    this.modalService.dismissAll();
  }
}
