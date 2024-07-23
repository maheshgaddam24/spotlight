import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { ApiService } from './services/api/api.service';
import { commonConst } from './Config/common-const';
import { HotToastService } from '@ngneat/hot-toast';
import { navigationRoutes } from './Config/navigation-routes';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IdMatchGuard implements CanActivate {
  constructor(
    private router: Router,
    private apiService: ApiService,
    private toastService: HotToastService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot
  ): boolean | Promise<boolean> | Observable<boolean> {
    const id = route.paramMap.get('id');
    return this.apiService.getProjectIds().pipe(
      map((apiData: any[]) => {
        for (let i = 0; i < apiData.length; i++) {
          if (apiData[i] == id) {
            return true
          }
        }
        this.router.navigate([navigationRoutes.projects]); 
        return false 
      })
    );
  }
}
