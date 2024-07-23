import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';

import { GetDatabaseTablesComponent } from './get-database-tables.component';

describe('GetDatabaseTablesComponent', () => {
  let component: GetDatabaseTablesComponent;
  let fixture: ComponentFixture<GetDatabaseTablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ AppModule ],
      declarations: [ GetDatabaseTablesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetDatabaseTablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
