import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AppliedDqChecksService {
  private appliedChecks: { [key: string]: any } | { length: number } = {};
  private sortColumn: any;

  constructor(private route: ActivatedRoute) {}
  getAppliedChecks(): {} {
    return this.appliedChecks;
  }

  setAppliedChecks(checks: any): void {
    this.appliedChecks = checks;
  }
  checkEdit(checks: any) {
    this.route.queryParams.subscribe((params) => {
      const isEmpty = Object.keys(params).length === 0;
      if (!isEmpty) {
        const edit = params['query'];
        if (edit === 'edit') {
          this.setAppliedChecks(checks);
        }
      }
    });
  }
  getSortColumn(): any{
    return this.sortColumn;
  }

  setSortColumn(checks: any): void {
    this.sortColumn = checks;
  }
}
