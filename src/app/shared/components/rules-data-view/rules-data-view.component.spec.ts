import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RulesDataViewComponent } from './rules-data-view.component';

describe('RulesDataViewComponent', () => {
  let component: RulesDataViewComponent;
  let fixture: ComponentFixture<RulesDataViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RulesDataViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RulesDataViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
