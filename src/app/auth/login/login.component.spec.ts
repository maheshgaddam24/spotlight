import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AppModule } from '../../app.module';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  function updateForm(email: any, password: any) {
    fixture.componentInstance.loginForm.controls['email'].setValue(email);
    fixture.componentInstance.loginForm.controls['password'].setValue(password);
  }
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ AppModule ],
      declarations: [LoginComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('created a form with email, password and login button', () => {
    const usernameContainer = fixture.debugElement.nativeElement.querySelector('#email-container');
    const passwordContainer = fixture.debugElement.nativeElement.querySelector('#password-container');
    const loginBtnContainer = fixture.debugElement.nativeElement.querySelector('#login-btn-container');
    expect(usernameContainer).toBeDefined();
    expect(passwordContainer).toBeDefined();
    expect(loginBtnContainer).toBeDefined();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});