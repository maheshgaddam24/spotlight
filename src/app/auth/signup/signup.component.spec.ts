import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppModule } from '../../app.module';

import { SignupComponent } from './signup.component';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;

  function updateForm(name:any, email: any, password: any) {
    fixture.componentInstance.signupForm.controls['name'].setValue(name);
    fixture.componentInstance.signupForm.controls['email'].setValue(email);
    fixture.componentInstance.signupForm.controls['password'].setValue(password);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ AppModule ],
      declarations: [ SignupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('created a form with name, email, password and signup button', () => {
    const usernameContainer = fixture.debugElement.nativeElement.querySelector('#name-container');
    const userEmailContainer = fixture.debugElement.nativeElement.querySelector('#email-container');
    const passwordContainer = fixture.debugElement.nativeElement.querySelector('#password-container');
    const signupBtnContainer = fixture.debugElement.nativeElement.querySelector('#signup-btn-container');
    expect(usernameContainer).toBeDefined();
    expect(userEmailContainer).toBeDefined();
    expect(passwordContainer).toBeDefined();
    expect(signupBtnContainer).toBeDefined();
  });
});