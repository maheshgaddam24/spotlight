import { Injectable } from '@angular/core';
import { apiPaths } from '../../Config/apiPaths';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';

import { environment as env } from 'src/environments/environment';
import { commonConst } from '../../Config/common-const';
import { toastMessages } from '../../Config/toastr-messages';
import { navigationRoutes } from '../../Config/navigation-routes';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NEVER } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  private readonly excludedErrorResponseUrls = [
    env.ip + apiPaths.dataload.root + apiPaths.dataload.getDatabaseTablesList,
    env.ip +
      apiPaths.dataload.root +
      apiPaths.dataload.dataBaseConnectionStatusCheck,
    env.ip + apiPaths.api.root + apiPaths.api.saveWorkFlowTransition,
  ];

  constructor(
    private toastService: HotToastService,
    private router: Router,
    public modalService: NgbModal,
    private dialog: MatDialog
  ) {}

  public handleErrorResponse(errorResponse: any) {
    const excludedEndpoints = [
      env.ip + apiPaths.api.root + apiPaths.api.saveWorkFlowTransition,
      env.ip + apiPaths.api.root + apiPaths.api.dataQualityChecks,
      env.ip + apiPaths.api.root + apiPaths.api.saveGoldLayerData,
      env.ip + apiPaths.api.root + apiPaths.api.creating_gold_layer_table,
      apiPaths.api.previewFilteredData,
      apiPaths.api.getBronzeLayerTableColumns,
      apiPaths.api.getSilverLayerColumns,
      apiPaths.api.insertGoldData,
      env.ip + apiPaths.api.root + apiPaths.api.saveWorkFlowTransition,
      apiPaths.api.markSeenNotifications,
      env.ip + apiPaths.api.root + apiPaths.api.projectList
    ];
      let unauthorizedHandled = false;
    
      // Handle 400 status codes
      if (errorResponse.status === 400) {
        if (
          !excludedEndpoints.some((endpoint) =>
            errorResponse.url.includes(endpoint)
          ) &&
          errorResponse.statusText !== commonConst.UnknownError
        ) {
          this.toastService.error(toastMessages.HttpRequestError);
        }
      }
    
      // Handle login related errors
      if (errorResponse.url === env.ip + apiPaths.account.root + apiPaths.account.login) {
        if (errorResponse.statusText !== commonConst.UnknownError) {
          if (errorResponse.error.hasOwnProperty(commonConst.error)) {
            this.toastService.error(errorResponse.error.error);
          } else {
            this.toastService.error(toastMessages.HttpRequestError);
          }
        }
        this.router.navigateByUrl(navigationRoutes.login);
      }
    
      // Handle signup related errors
      if (errorResponse.url === env.ip + apiPaths.account.root + apiPaths.account.signUp) {
        if (errorResponse.status === 500 && errorResponse.statusText !== commonConst.UnknownError) {
          this.toastService.error(toastMessages.HttpRequestError);
        } else if (errorResponse.statusText !== commonConst.UnknownError) {
          if (errorResponse.error.hasOwnProperty(commonConst.error)) {
            this.toastService.error(errorResponse.error.error);
          } else {
            this.toastService.error(toastMessages.HttpRequestError);
          }
        }
      }
    
      // Handle 401 Unauthorized
      if (errorResponse.status === 401) {
        if (!unauthorizedHandled) {
          this.toastService.error(errorResponse.error.detail);
          this.modalService.dismissAll();
          this.dialog.closeAll();
          sessionStorage.clear();
          this.router.navigateByUrl(navigationRoutes.login);
          unauthorizedHandled = true;
        }
        return NEVER;
      }
    
      // Handle 500 status codes
      if (errorResponse.status === 500) {
        if (
          errorResponse.status === 500 &&
          errorResponse.statusText !== commonConst.UnknownError &&
          errorResponse.url !== this.excludedErrorResponseUrls
        ) {
          return this.toastService.error(toastMessages.HttpRequestError);
        }
      }
    
      // // Display a default toast message for all other error responses
      // if (
      //   !errorResponse.url.includes('workflowrules') &&
      //   !excludedEndpoints.some((endpoint) =>
      //     errorResponse.url.includes(endpoint)
      //   )
      // ) {
      //   this.toastService.error('An error occurred. Please try again.');
      // }
    }
    
}
