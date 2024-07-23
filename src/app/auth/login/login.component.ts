import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { AuthenticationService } from '../../shared/services/authentication/authentication.service';
import { commonConst } from '../../shared/Config/common-const';
import { navigationRoutes } from '../../shared/Config/navigation-routes';
import { toastMessages } from '../../shared/Config/toastr-messages';
import { AppObservable } from '../../shared/app-observable';
import { group } from '@angular/animations';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPasswordOnPress!: boolean;
  token: any;
  invalid: any[] = [];

  constructor(
    public router: Router,
    public formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private toastService: HotToastService,
    public appObs: AppObservable
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void { }
  login() {
    if (this.loginForm.invalid) {
      const controls = this.loginForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          this.invalid.push(name);
        }
      }
      this.toastService.warning(`
       <h6>${this.invalid}</h6> Fields missing
    ` );
      this.invalid = [];
    } else {
      this.authService.login(this.loginForm.value).subscribe((res: any) => {
        sessionStorage.setItem(commonConst.userData, JSON.stringify(res));
        this.toastService.success(toastMessages.loginSuccessful);
        this.authService.startRefreshTokenTimer();
        this.router.navigate([navigationRoutes.projects]);
        this.appObs.setUserName$(this.loginForm.value.username);
      });
    }
  }
}