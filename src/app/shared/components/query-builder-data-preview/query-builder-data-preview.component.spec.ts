import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryBuilderDataPreviewComponent } from './query-builder-data-preview.component';

describe('QueryBuilderDataPreviewComponent', () => {
  let component: QueryBuilderDataPreviewComponent;
  let fixture: ComponentFixture<QueryBuilderDataPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueryBuilderDataPreviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QueryBuilderDataPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
