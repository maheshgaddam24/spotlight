import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
} from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { commonConst } from './Config/common-const';
import { navigationRoutes } from './Config/navigation-routes';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router,    private toastService: HotToastService,) {}
  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (sessionStorage.getItem(commonConst.userData) !== null) {
      return true;
    } else {
      this.router.navigate([navigationRoutes.login]);
      return false;
    }
  }
}
