import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XsdUploadComponent } from './xsd-upload.component';

describe('XsdUploadComponent', () => {
  let component: XsdUploadComponent;
  let fixture: ComponentFixture<XsdUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XsdUploadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XsdUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
