import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { navigationRoutes } from './Config/navigation-routes';

@Injectable({
  providedIn: 'root',
})
export class StagingGuard implements CanActivate {
  constructor(
    private router: Router,
    private toastService: HotToastService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const stagingValue = route.paramMap.get('staging');
    const isValidStaging =
      stagingValue === 'Raw Scheduler' || stagingValue === 'Staging Datasets' || stagingValue === 'Raw Sources';

    if (!isValidStaging) {
      this.toastService.error('Invalid staging route parameter');
      this.router.navigate([navigationRoutes.projects]);
      return false;
    }

    return true;
  }
}
