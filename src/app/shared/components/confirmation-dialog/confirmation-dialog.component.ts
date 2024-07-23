import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import { tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { apiPaths } from '../../Config/apiPaths';
import { toastMessages } from '../../Config/toastr-messages';
import { AppObservable } from '../../app-observable';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent implements OnInit {
  @Input() data: any;
  ngOnInit(): void {
  }
  constructor(
    public modalService: NgbActiveModal,
    private appObservable: AppObservable,
    private httpClient: HttpClient,
    private router: Router,
    private service: ApiService,
    private toast: HotToastService
  ) { }

  deleteProject() {
    let id = { id: this.data[0] };
    this.httpClient
      .delete(environment.ip+apiPaths.api.root+ apiPaths.api.projectList, { body: id })
      .pipe(
        tap(() => { }),
        this.toast.observe({
          loading: toastMessages.deletingProject,
          success: (s) => toastMessages.deletedSuccessfully,
          error: (e) => toastMessages.errorDeleting,
        })
      )
      .subscribe(() => {
        this.closeModal();
        this.appObservable.filter('deleted');
      });
  }

  closeModal() {
    this.modalService.dismiss();
  }
}
