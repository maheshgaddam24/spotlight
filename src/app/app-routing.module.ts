import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CanDeactivateGuard } from './can-deactivate.guard';
import { ProjectViewComponent } from './project-view/project-view.component';
import { GoldLayerDashboardComponent } from './gold-layer-dashboard/gold-layer-dashboard.component';
import { GoldLayerDataPreviewComponent } from './gold-layer-data-preview/gold-layer-data-preview.component';
import { ProjectDashboardComponent } from './project-dashboard/project-dashboard.component';
import { ProjectListComponent } from './project-list/project-list.component';
import { QueryBuilderComponent } from './query-builder/query-builder.component';
import { SchemaDataComponent } from './schema-data/schema-data.component';
import { AuthGuard } from './shared/auth.guard';
import { GetDataComponent } from './shared/components/get-data/get-data.component';
import { GetDatabaseTablesComponent } from './shared/components/get-database-tables/get-database-tables.component';
import { QueryBuilderDataPreviewComponent } from './shared/components/query-builder-data-preview/query-builder-data-preview.component';
import { RefreshPageComponent } from './shared/components/refresh-page/refresh-page.component';
import { RulesDataViewComponent } from './shared/components/rules-data-view/rules-data-view.component';
import { WorkflowDashboardComponent } from './shared/components/workflow-dashboard/workflow-dashboard.component';
import { RowColumnFilteringComponent } from './shared/components/row-column-filtering/row-column-filtering.component';
import { StagingGuard } from './shared/staging.guard';
import { IdMatchGuard } from './shared/project.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  {
    path: 'projects',
    component: ProjectListComponent,
    canActivate: [AuthGuard],data: { hideTopNav: true }
  },
  {
    path: 'staging-view/:staging/:id',
    component: ProjectDashboardComponent,
    canActivate: [AuthGuard,StagingGuard],
  },
  { path: 'get-data', component: GetDataComponent, canActivate: [AuthGuard] },
  {
    path: 'schema-data/:staging/:id/:source',
    component: SchemaDataComponent,
    canActivate: [AuthGuard,StagingGuard],
  },
  {
    path: 'database-tables',
    component: GetDatabaseTablesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'row-column',
    component: RowColumnFilteringComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'query-builder/:id/:layer_Name',
    component: QueryBuilderComponent,
    canActivate: [AuthGuard], canDeactivate: [CanDeactivateGuard]
  },
  {
    path: 'goldlayer-dashboard/:id',
    component: GoldLayerDashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'goldlayer-preview/:id/:tablename_instance/:tablename/:data',
    component: GoldLayerDataPreviewComponent,
    canActivate: [AuthGuard],
  },
{
  path: 'data-preview',
  component: QueryBuilderDataPreviewComponent,
  canActivate: [AuthGuard]
},
{
	path: 'rules/:id/:layer_Name',
	component: RulesDataViewComponent,
	canActivate: [AuthGuard]
},
{
	path: 'workflow-dashboard/:id/:layer_Name',
	component: WorkflowDashboardComponent,
  canActivate: [AuthGuard]
},
{
	path: 'refresh-page',
	component: RefreshPageComponent,
}
,
{
	path: 'project-view',
	component: ProjectViewComponent,
	canActivate: [AuthGuard]
},
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    TranslateModule],
  exports: [RouterModule, TranslateModule],
})
export class AppRoutingModule {}
