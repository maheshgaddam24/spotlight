import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefreshPageComponent } from './refresh-page.component';

describe('RefreshPageComponent', () => {
  let component: RefreshPageComponent;
  let fixture: ComponentFixture<RefreshPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RefreshPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RefreshPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
