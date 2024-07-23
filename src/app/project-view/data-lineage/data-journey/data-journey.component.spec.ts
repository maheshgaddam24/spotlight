import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataJourneyComponent } from './data-journey.component';

describe('DataJourneyComponent', () => {
  let component: DataJourneyComponent;
  let fixture: ComponentFixture<DataJourneyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataJourneyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataJourneyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
