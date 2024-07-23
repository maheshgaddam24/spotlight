import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HighlightService {
  private highlightedColumn: string='' ;
  private workflowRoute :boolean = false;
  private queryBuilderRoute :boolean = false;
  private queryBuilderRouteTitle :string='';

  

  getHighlightedColumn(): string {
    return this.highlightedColumn;
  }

  setHighlightedColumn(column: string) {
    this.highlightedColumn = column;
  }
  getHighlightedRoute(): boolean {
    return this.workflowRoute;
  }

  setHighlightedRoute(route: boolean) {
    this.workflowRoute = route;
  }
  getQueryBuilderRoute(): { route: boolean, title: string } {
    return { route: this.queryBuilderRoute, title: this.queryBuilderRouteTitle };
  }
  

  setQueryBuilderRoute(route: boolean, queryBuilderTitle:string) {
    this.queryBuilderRoute = route;
    this.queryBuilderRouteTitle = queryBuilderTitle;

  }
}
