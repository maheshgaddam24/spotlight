import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { environment as env } from 'src/environments/environment';
import { apiPaths } from '../Config/apiPaths';
import { commonConst } from '../Config/common-const';
import { LoaderService } from '../loader/loader.service';
import { ErrorHandlerService } from '../services/error-handler/error-handler.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private totalRequests = 0;
  private readonly excludedUrls = [
    commonConst.auditUrl,
    env.ip + apiPaths.api.root + apiPaths.api.workflowChartDataSet,
    env.ip + apiPaths.api.root + apiPaths.api.getWorkflowDashboardData,
    'assets/i18n/en.json',
    env.ip + apiPaths.api.root + apiPaths.api.previewFilteredData,
    env.ip + apiPaths.dataload.root + apiPaths.dataload.getSourceData,
    env.ip + apiPaths.api.root + apiPaths.api.dataQualityChecks,
    `${env.ip}` +
      `${apiPaths.dataload.root}` +
      `${apiPaths.dataload.pastFiveAirFlowDagRuns}`,
    env.ip + apiPaths.dataload.root + apiPaths.dataload.csvDataLoad,
    'https://spotlightus.s3.us-east-1.amazonaws.com/test/samplelogs.log',
  ];
  private readonly excludedErrorResponseUrls = [
    env.ip + apiPaths.dataload.root + apiPaths.dataload.getDatabaseTablesList,
    env.ip +
      apiPaths.dataload.root +
      apiPaths.dataload.dataBaseConnectionStatusCheck,
    env.ip + apiPaths.api.root + apiPaths.api.saveWorkFlowTransition,
  ];

  userData: any;
  isToastVisible = false;
  toastRef: any;

  constructor(
    private loadingService: LoaderService,
    private toastService: HotToastService,
    private router: Router,
    public modalService: NgbModal,
    private dialog: MatDialog,private errorHandlerService: ErrorHandlerService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.totalRequests++;
    this.loadingService.setLoading(true);
    if (
      request.method.toLowerCase() === commonConst.get ||
      request.url.includes(commonConst.login) ||
      request.url.includes(commonConst.register) ||
      request.url.includes(commonConst.rulevalidation) ||
      request.url.includes(commonConst.getColumns)
    ) {
      if (this.shouldExclude(request.url)) {
        this.loadingService.setLoading(false);
      } else if (request.url.includes(apiPaths.dataload.csvDataLoad)) {
        this.loadingService.setLoading(true);
      } else {
        this.loadingService.setLoading(true);
      }
    } else if (request.url.includes(apiPaths.dataload.getCsvTableColumns)) {
      this.loadingService.setLoading(true);
    } else {
      this.loadingService.setLoading(false);
    }

    let req = request.clone({
      setHeaders: {
        Accept: commonConst.httpAcceptHeader,
      },
    });
    const excludedUrls = [
      'https://spotlightus.s3.us-east-1.amazonaws.com/test/samplelogs.log',
    ];

    const shouldExcludeToken = excludedUrls.some((url) =>
      request.url.includes(url)
    );
    this.userData = sessionStorage.getItem(commonConst.userData);
    this.userData = JSON.parse(this.userData);
    if (this.userData && !shouldExcludeToken) {
      req = request.clone({
        setHeaders: {
          Authorization:
            `${commonConst.bearer}` + ' ' + `${this.userData?.token}`,
        },
      });
    }
    return next.handle(req).pipe(
      tap((resp) => {
        this.handleSuccess(resp);
      }),
      catchError((errorResponse: any) => {
        this.loadingService.setLoading(false);
        this.handleErrors(errorResponse);
        return throwError(errorResponse);
      }),
      finalize(() => {
        if (request.method.toLowerCase() === commonConst.get) {
          this.loadingService.setLoading(false);
          this.totalRequests = 0;
        } else {
          this.totalRequests--;
        }
        if (this.totalRequests === 0) {
          this.loadingService.setLoading(false);
        }
      })
    );
  }
  private shouldExclude(url: string) {
    return this.excludedUrls.some((excludedUrl) => url.includes(excludedUrl));
  }


  private handleSuccess(success: any) {}
  handleErrors(errorResponse) {
    this.errorHandlerService.handleErrorResponse(errorResponse);
  }
}
