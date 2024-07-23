import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment as env } from 'src/environments/environment';
import { apiPaths } from '../../Config/apiPaths';
import { commonConst } from '../../Config/common-const';
import { AppObservable } from '../../app-observable';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  userData:any
  constructor(private httpClient: HttpClient,    private appObservable: AppObservable,) {}
  login(loginFrom: any) {
    return this.httpClient.post(`${env.ip}`+`${apiPaths.account.root}`+ `${apiPaths.account.login}`, loginFrom, { withCredentials: true });
  }
  startRefreshTokenTimer() {
    this.userData = sessionStorage.getItem(commonConst.userData);
    if (this.userData) {
      const expiry = 1800 / 60;
      let expires = new Date();
      expires.setMinutes(expires.getMinutes() + expiry - 2);
      const timeout = expires.getTime() - Date.now() - 60 * 1000;
      
    }
  }
  signUp(signUpFrom: any) {
    return this.httpClient.post(`${env.ip}`+`${apiPaths.account.root}`+`${apiPaths.account.signUp}`, signUpFrom);
  }
}
