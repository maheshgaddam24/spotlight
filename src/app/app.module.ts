import { DragDropModule } from '@angular/cdk/drag-drop';
import { DatePipe } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
  NgModule,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  NgbActiveModal,
  NgbDatepickerModule,
  NgbModule,
  NgbTooltipModule
} from '@ng-bootstrap/ng-bootstrap';
import { HotToastModule } from '@ngneat/hot-toast';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AngularSplitModule } from 'angular-split';
import { QueryBuilderModule } from 'angular2-query-builder';
import * as echarts from 'echarts';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgToggleModule } from 'ng-toggle-button';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { NgxEchartsModule } from 'ngx-echarts';
import { JoyrideModule } from 'ngx-joyride';
import { AppMaterialModule } from './app-material.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthRoutingModule } from './auth/auth-routing.module';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { GoldLayerDashboardComponent } from './gold-layer-dashboard/gold-layer-dashboard.component';
import { GoldLayerDataPreviewComponent } from './gold-layer-data-preview/gold-layer-data-preview.component';
import { PrismComponent } from './prism.component';
import { ProjectDashboardComponent } from './project-dashboard/project-dashboard.component';
import { SchedulingBronzeComponent } from './project-dashboard/scheduling-bronze/scheduling-bronze.component';
import { ProjectListComponent } from './project-list/project-list.component';
import { QueryBuilderComponent } from './query-builder/query-builder.component';
import { SchemaDataComponent } from './schema-data/schema-data.component';
import { AppObservable } from './shared/app-observable';
import { AuditReportComponent } from './shared/components/audit-report/audit-report.component';
import { ConfirmationDialogComponent } from './shared/components/confirmation-dialog/confirmation-dialog.component';
import { DataLoadComponent } from './shared/components/data-load/data-load.component';
import { GetDataComponent } from './shared/components/get-data/get-data.component';
import { GetDatabaseTablesComponent } from './shared/components/get-database-tables/get-database-tables.component';
import { QueryBuilderDataPreviewComponent } from './shared/components/query-builder-data-preview/query-builder-data-preview.component';
import { ReportWorkflowSchedulingComponent } from './shared/components/query-builder-data-preview/report-workflow-scheduling/report-workflow-scheduling.component';
import { RefreshPageComponent } from './shared/components/refresh-page/refresh-page.component';
import { ReportGenerationComponent } from './shared/components/report-generation/report-generation.component';
import { XsdUploadComponent } from './shared/components/report-generation/xsd-upload/xsd-upload.component';
import { RowColumnFilteringComponent } from './shared/components/row-column-filtering/row-column-filtering.component';
import { FilterPipe } from './shared/components/rules-data-view/filter.pipe';
import { QueryDisplayComponent } from './shared/components/rules-data-view/query-display/query-display.component';
import { RulesDataViewComponent } from './shared/components/rules-data-view/rules-data-view.component';
import { SchedulingComponent } from './shared/components/scheduling/scheduling.component';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import { TopNavigationComponent } from './shared/components/top-navigation/top-navigation.component';
import { WorkflowDashboardComponent } from './shared/components/workflow-dashboard/workflow-dashboard.component';
import { LoadingInterceptor } from './shared/interceptor/loading.interceptor';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import 'prismjs';
import 'prismjs/components/prism-sql.min.js';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { ProjectViewComponent } from './project-view/project-view.component';
import { DataLineageComponent } from './project-view/data-lineage/data-lineage.component'
import { DataQualityComponent } from './shared/components/data-quality/data-quality.component';
import { AuditLogsComponent } from './shared/components/audit-logs/audit-logs.component';
import { TimezoneDatePipe } from './shared/pipes/TimezoneDate/timezone-date.pipe';
import { LogoutDialogComponent } from './shared/components/logout-dialog/logout-dialog.component';
import { TableLogsComponent } from './shared/components/table-logs/table-logs.component';
import { DataJourneyComponent } from './project-view/data-lineage/data-journey/data-journey.component';
import { SafeHtmlPipe } from './shared/pipes/TimezoneDate/safeHtml.pipe';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
@NgModule({
  declarations: [
    AppComponent,
    SignupComponent,
    LoginComponent,
    TopNavigationComponent,
    ProjectListComponent,
    ProjectDashboardComponent,
    GetDataComponent,
    SchemaDataComponent,
    QueryBuilderComponent,
    SpinnerComponent,
    GetDatabaseTablesComponent,
    GoldLayerDashboardComponent,
    GoldLayerDataPreviewComponent,
    QueryBuilderDataPreviewComponent,
    ConfirmationDialogComponent,
    RulesDataViewComponent,
    SchedulingComponent,
    WorkflowDashboardComponent,
    RefreshPageComponent,
    FilterPipe,
    AuditReportComponent,
    ReportGenerationComponent,
    RowColumnFilteringComponent,
    DataLoadComponent,
    XsdUploadComponent,
    SidebarComponent,
    QueryDisplayComponent,
    SchedulingBronzeComponent,
    PrismComponent,
    ReportWorkflowSchedulingComponent,
    DataQualityComponent,
    ProjectViewComponent,
    DataLineageComponent, AuditLogsComponent, TimezoneDatePipe, LogoutDialogComponent, TableLogsComponent, DataJourneyComponent,SafeHtmlPipe
  ],
  imports: [AuthRoutingModule,
    MatDatepickerModule,
    AppMaterialModule,
    MatDialogModule,
    MatMenuModule,
    MatIconModule,
    MatNativeDateModule,
    MatInputModule,
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgMultiSelectDropDownModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      isolate: true,
    }),

    NgxEchartsModule.forRoot({ echarts }),
    ReactiveFormsModule,
    DragDropModule,
    AngularSplitModule,
    QueryBuilderModule,
    FormsModule,
    HotToastModule.forRoot(),
    FormsModule,
    NgToggleModule,
    MatCardModule,
    NgbDatepickerModule,
    NgbTooltipModule,
    NgbModule,
    MatTableModule,
    MatCheckboxModule,
    MatNativeDateModule,
    MatDatepickerModule,
    JoyrideModule.forRoot(),
    CdkStepperModule,
    AutocompleteLibModule
  ],
  providers: [
    AppObservable,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
    {
      provide: MatDialogRef,
      useValue: {}
    },
    {
      provide: MAT_DIALOG_DATA,
      useValue: {}
    },
    NgbActiveModal,
    DatePipe,
    TimezoneDatePipe,SafeHtmlPipe
  ],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule { }
