import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { AuthenticationService } from '../../shared/services/authentication/authentication.service';
import { navigationRoutes } from '../../shared/Config/navigation-routes';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  showPasswordOnPress!: boolean;
  signUpResponse: any;
  invalidFields: any[] = [];
  passwordInvalid: boolean = false;
  passwordMatch: boolean = false;

  constructor(
    public formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private router: Router,
    private toastService: HotToastService
  ) {
    this.signupForm = this.formBuilder.group(
      {
        username: ['', [Validators.required]],
        password: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            ),
          ],
        ],
        password2: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );

    this.signupForm.get('password')?.valueChanges.subscribe((value) => {
      this.passwordInvalid = this.signupForm.get('password')?.invalid || !value;
    });
  }
  ngOnInit(): void {}

  signup() {
    if (this.signupForm.invalid) {
      const controls = this.signupForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          this.invalidFields.push(name);
        }
      }
      this.toastService.warning(`
      <h6>${this.invalidFields}</h6> Fields missing
    `);
      this.invalidFields = [];
    } else {
      this.authService.signUp(this.signupForm.value).subscribe((res: any) => {
        this.signUpResponse = res;
        if (
          !this.signUpResponse.hasOwnProperty('token') &&
          !this.signUpResponse.hasOwnProperty('email')
        ) {
          this.toastService.warning(`${this.signUpResponse.username}`, {
            autoClose: false,
            dismissible: true,
          });
        } else if (
          !this.signUpResponse.hasOwnProperty('token') &&
          this.signUpResponse.hasOwnProperty('email')
        ) {
          this.toastService.warning(`${this.signUpResponse.email}`, {
            autoClose: false,
            dismissible: true,
          });
        } else if (this.signUpResponse.hasOwnProperty('token')) {
          this.toastService.success(`${this.signUpResponse.response}`);
          this.router.navigate([navigationRoutes.login]);
        }
      });
    }
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const password2 = group.get('password2')?.value;
    return password === password2 ? null : { mismatch: true };
  }
  confirmPasswordValidator(event: Event) {
    const confirmPasswordValue = (event.target as HTMLInputElement).value;
    if (confirmPasswordValue === this.signupForm.value.password) {
      this.passwordMatch = false;
    } else {
      this.passwordMatch = true;
    }
  }
}
